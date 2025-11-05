from __future__ import annotations

from typing import Any, Dict, List, Optional
import xml.etree.ElementTree as ET


XS_NS = "http://www.w3.org/2001/XMLSchema"
NS = {"xs": XS_NS}


def _local_name(qname: Optional[str]) -> Optional[str]:
    if not qname:
        return None
    return qname.split(":", 1)[-1]


def _remove_namespace_prefix(qname: Optional[str]) -> Optional[str]:
    """Remove namespace prefix from qualified name"""
    if not qname:
        return None
    if ":" in qname:
        return qname.split(":", 1)[1]
    return qname


class XSDParser:
    def __init__(self, root: ET.Element):
        self.root = root
        self.target_namespace = root.get("targetNamespace")
        self.element_form_default = root.get("elementFormDefault", "unqualified")
        
        # Cache for named types and elements
        self.complex_types: Dict[str, ET.Element] = {}
        self.simple_types: Dict[str, ET.Element] = {}
        self.global_elements: Dict[str, ET.Element] = {}
        
        self._cache_named_types()
    
    def _cache_named_types(self):
        """Cache all named types and global elements for reference resolution"""
        # Cache complex types
        for ct in self.root.findall("xs:complexType[@name]", NS):
            name = ct.get("name")
            if name:
                self.complex_types[name] = ct
        
        # Cache simple types
        for st in self.root.findall("xs:simpleType[@name]", NS):
            name = st.get("name")
            if name:
                self.simple_types[name] = st
        
        # Cache global elements
        for el in self.root.findall("xs:element[@name]", NS):
            name = el.get("name")
            if name:
                self.global_elements[name] = el
    
    def _resolve_type(self, type_name: str) -> Optional[ET.Element]:
        """Resolve a type name to its definition"""
        local_name = _remove_namespace_prefix(type_name)
        if not local_name:
            return None
            
        # Check complex types first
        if local_name in self.complex_types:
            return self.complex_types[local_name]
        
        # Check simple types
        if local_name in self.simple_types:
            return self.simple_types[local_name]
        
        return None
    
    def _resolve_element_ref(self, ref_name: str) -> Optional[ET.Element]:
        """Resolve an element reference to its definition"""
        local_name = _remove_namespace_prefix(ref_name)
        if not local_name:
            return None
        
        return self.global_elements.get(local_name)
    
    def _parse_element(self, el: ET.Element, processed_types: Optional[set] = None) -> Dict[str, Any]:
        if processed_types is None:
            processed_types = set()
            
        # Handle element references
        ref = el.get("ref")
        if ref:
            ref_element = self._resolve_element_ref(ref)
            if ref_element is not None:
                result = self._parse_element(ref_element, processed_types)
                # Override name with the referenced name
                result["name"] = _remove_namespace_prefix(ref) or ref
                return result
            else:
                return {
                    "name": _remove_namespace_prefix(ref) or ref,
                    "maxOccurs": el.get("maxOccurs"),
                    "minOccurs": el.get("minOccurs"),
                    "attributes": [],
                    "attributeDetails": [],
                    "children": [],
                    "xsdType": "unknown",
                    "isReference": True
                }
        
        name = el.get("name") or "(anonymous)"
        max_occurs = el.get("maxOccurs")
        min_occurs = el.get("minOccurs")
        
        # Determine XSD type for this element
        type_attr = el.get("type")
        xsd_type = _local_name(type_attr) if type_attr else None
        
        # attributes and children
        attrs: List[str] = []
        attr_details: List[Dict[str, Any]] = []
        children: List[Dict[str, Any]] = []
        
        # Handle inline complex type
        inline_complex_type = el.find("xs:complexType", NS)
        if inline_complex_type is not None:
            attrs, attr_details, children = self._parse_complex_type(inline_complex_type, processed_types)
            xsd_type = "complexType"
        
        # Handle inline simple type
        elif el.find("xs:simpleType", NS) is not None:
            simple_type = el.find("xs:simpleType", NS)
            restr = simple_type.find(".//xs:restriction", NS)
            if restr is not None:
                xsd_type = _local_name(restr.get("base"))
        
        # Handle reference to named type
        elif type_attr:
            type_def = self._resolve_type(type_attr)
            if type_def is not None and type_def.tag.endswith("complexType"):
                # Prevent infinite recursion
                type_name = _remove_namespace_prefix(type_attr)
                if type_name not in processed_types:
                    processed_types.add(type_name)
                    attrs, attr_details, children = self._parse_complex_type(type_def, processed_types)
                    processed_types.discard(type_name)
                xsd_type = "complexType"
        
        return {
            "name": name,
            "maxOccurs": max_occurs,
            "minOccurs": min_occurs,
            "attributes": attrs,  # legacy list of attribute names for compatibility
            "attributeDetails": attr_details,
            "children": children,
            "xsdType": xsd_type,
        }
    
    def _parse_complex_type(self, complex_type: ET.Element, processed_types: set) -> tuple[List[str], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Parse a complex type and return attributes and children"""
        attrs: List[str] = []
        attr_details: List[Dict[str, Any]] = []
        children: List[Dict[str, Any]] = []
        
        # Parse attributes
        for attr in complex_type.findall("xs:attribute", NS):
            attr_name = attr.get("name")
            if not attr_name:
                continue
            attrs.append(attr_name)
            
            atype = _local_name(attr.get("type"))
            fixed_value = attr.get("fixed")
            use = attr.get("use", "optional")
            
            if atype is None:
                st = attr.find("xs:simpleType", NS)
                if st is not None:
                    restr = st.find(".//xs:restriction", NS)
                    if restr is not None:
                        atype = _local_name(restr.get("base"))
            
            attr_details.append({
                "name": attr_name, 
                "xsdType": atype,
                "fixed": fixed_value,
                "use": use
            })
        
        # Parse sequences/children - look for all sequence patterns
        sequences = complex_type.findall(".//xs:sequence", NS)
        for seq in sequences:
            for ch in seq.findall("xs:element", NS):
                children.append(self._parse_element(ch, processed_types))
        
        # Also check for choice elements
        choices = complex_type.findall(".//xs:choice", NS)
        for choice in choices:
            for ch in choice.findall("xs:element", NS):
                child_elem = self._parse_element(ch, processed_types)
                child_elem["isChoice"] = True
                children.append(child_elem)
        
        return attrs, attr_details, children


def parse_xsd_structure(content: bytes) -> Dict[str, Any]:
    """Parse nested structure from an XSD file using ElementTree.

    Returns hierarchical summary suitable for sample generation:
    {
      "elements": [ { "name": str, "maxOccurs": str|None, "attributes": [str], "children": [ElementSummary] } ],
      "complexTypes": [ { "name": str, "attributes": [str], "children": [ElementSummary] } ],
      "targetNamespace": str
    }
    """
    root = ET.fromstring(content)
    parser = XSDParser(root)
    
    elements: List[Dict[str, Any]] = []
    complex_types: List[Dict[str, Any]] = []
    
    # Parse all top-level elements
    for el in root.findall("xs:element", NS):
        elements.append(parser._parse_element(el))
    
    # Also include information about named complex types for reference
    for name, ct in parser.complex_types.items():
        attrs, attr_details, children = parser._parse_complex_type(ct, set())
        complex_types.append({
            "name": name,
            "attributes": attrs,
            "attributeDetails": attr_details,
            "children": children,
            "xsdType": "complexType"
        })
    
    return {
        "elements": elements,
        "complexTypes": complex_types,
        "targetNamespace": parser.target_namespace,
        "elementFormDefault": parser.element_form_default
    }


