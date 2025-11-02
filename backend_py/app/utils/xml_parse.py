from __future__ import annotations

from typing import Any, Dict, List, Optional
import xml.etree.ElementTree as ET


XS_NS = "http://www.w3.org/2001/XMLSchema"
NS = {"xs": XS_NS}


def _parse_element(el: ET.Element) -> Dict[str, Any]:
    name = el.get("name") or el.get("ref") or "(anonymous)"
    max_occurs = el.get("maxOccurs")
    # attributes on complexType
    attrs: List[str] = []
    children: List[Dict[str, Any]] = []

    complex_type = el.find("xs:complexType", NS)
    if complex_type is not None:
        # attributes
        for attr in complex_type.findall("xs:attribute", NS):
            attr_name = attr.get("name")
            if attr_name:
                attrs.append(attr_name)
        # sequences/children
        seq = complex_type.find(".//xs:sequence", NS)
        if seq is not None:
            for ch in seq.findall("xs:element", NS):
                children.append(_parse_element(ch))

    return {"name": name, "maxOccurs": max_occurs, "attributes": attrs, "children": children}


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


