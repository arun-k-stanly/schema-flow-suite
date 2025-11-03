from __future__ import annotations

from typing import Any, Dict, List, Optional
import xml.etree.ElementTree as ET


XS_NS = "http://www.w3.org/2001/XMLSchema"
NS = {"xs": XS_NS}


def _local_name(qname: Optional[str]) -> Optional[str]:
    if not qname:
        return None
    return qname.split(":", 1)[-1]


def _parse_element(el: ET.Element) -> Dict[str, Any]:
    name = el.get("name") or el.get("ref") or "(anonymous)"
    max_occurs = el.get("maxOccurs")

    # Determine XSD type for this element
    xsd_type = _local_name(el.get("type"))
    if xsd_type is None:
        simple_type = el.find("xs:simpleType", NS)
        if simple_type is not None:
            restr = simple_type.find(".//xs:restriction", NS)
            if restr is not None:
                xsd_type = _local_name(restr.get("base"))

    # attributes on complexType
    attrs: List[str] = []
    attr_details: List[Dict[str, Any]] = []
    children: List[Dict[str, Any]] = []

    complex_type = el.find("xs:complexType", NS)
    if complex_type is not None:
        # attributes
        for attr in complex_type.findall("xs:attribute", NS):
            attr_name = attr.get("name")
            if not attr_name:
                continue
            attrs.append(attr_name)
            atype = _local_name(attr.get("type"))
            if atype is None:
                st = attr.find("xs:simpleType", NS)
                if st is not None:
                    restr = st.find(".//xs:restriction", NS)
                    if restr is not None:
                        atype = _local_name(restr.get("base"))
            attr_details.append({"name": attr_name, "xsdType": atype})
        # sequences/children
        seq = complex_type.find(".//xs:sequence", NS)
        if seq is not None:
            for ch in seq.findall("xs:element", NS):
                children.append(_parse_element(ch))

    return {
        "name": name,
        "maxOccurs": max_occurs,
        "attributes": attrs,  # legacy list of attribute names for compatibility
        "attributeDetails": attr_details,
        "children": children,
        "xsdType": xsd_type,
    }


def parse_xsd_structure(content: bytes) -> Dict[str, Any]:
    """Parse nested structure from an XSD file using ElementTree.

    Returns hierarchical summary suitable for sample generation:
    {
      "elements": [ { "name": str, "maxOccurs": str|None, "attributes": [str], "children": [ElementSummary] } ]
    }
    """
    root = ET.fromstring(content)
    elements: List[Dict[str, Any]] = []
    for el in root.findall("xs:element", NS):
        elements.append(_parse_element(el))
    return {"elements": elements}


