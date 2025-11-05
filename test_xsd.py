#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend_py'))

from backend_py.app.utils.xml_parse import parse_xsd_structure
import json

# Your Purchase Order XSD schema
xsd_content = '''<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
          xmlns:tns="http://tempuri.org/PurchaseOrderSchema.xsd"
          targetNamespace="http://tempuri.org/PurchaseOrderSchema.xsd"
          elementFormDefault="qualified">
  <xsd:element name='comment' type='xsd:string'/>

  <xsd:element name='purchaseOrder' type='tns:PurchaseOrderType'/>

  <xsd:complexType name='USAddress'>
    <xsd:annotation>
      <xsd:documentation>
        Purchase order schema for Example.Microsoft.com.
      </xsd:documentation>
    </xsd:annotation>
    <xsd:sequence>
      <xsd:element name='name'   type='xsd:string'/>
      <xsd:element name='street' type='xsd:string'/>
      <xsd:element name='city'   type='xsd:string'/>
      <xsd:element name='state'  type='xsd:string'/>
      <xsd:element name='zip'    type='xsd:decimal'/>
    </xsd:sequence>
    <xsd:attribute name='country' type='xsd:NMTOKEN' fixed='US'/>
  </xsd:complexType>

  <xsd:simpleType name='SKU'>
    <xsd:restriction base='xsd:string'>
      <xsd:pattern value='\d{3}\w{3}'/>
    </xsd:restriction>
  </xsd:simpleType>

  <xsd:complexType name='Items'>
    <xsd:sequence>
      <xsd:element name='item' minOccurs='0' maxOccurs='unbounded'>
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name='productName' type='xsd:string'/>
            <xsd:element name='quantity'>
              <xsd:simpleType>
                <xsd:restriction base='xsd:positiveInteger'>
                  <xsd:minInclusive value='1'/>
                  <xsd:maxExclusive value='100'/>
                </xsd:restriction>
              </xsd:simpleType>
            </xsd:element>
            <xsd:element name='USPrice'  type='xsd:decimal'/>
            <xsd:element ref='tns:comment'/>
            <xsd:element name='shipDate' type='xsd:date' minOccurs='0'/>
          </xsd:sequence>
          <xsd:attribute name='partNum' type='tns:SKU'/>
        </xsd:complexType>
      </xsd:element>
    </xsd:sequence>
  </xsd:complexType>

  <xsd:complexType name='PurchaseOrderType'>
    <xsd:sequence>
      <xsd:element name='shipTo' type='tns:USAddress'/>
      <xsd:element name='billTo' type='tns:USAddress'/>
      <xsd:element ref='tns:comment' minOccurs='0'/>
      <xsd:element name='items'  type='tns:Items'/>
    </xsd:sequence>
    <xsd:attribute name='orderDate' type='xsd:date'/>
    <xsd:attribute name='confirmDate' type='xsd:date' use='required'/>
  </xsd:complexType>
</xsd:schema>'''

def test_xsd_parsing():
    try:
        result = parse_xsd_structure(xsd_content.encode('utf-8'))
        print("XSD Parsing successful!")
        print("=" * 50)
        print(json.dumps(result, indent=2))
        
        print("\n" + "=" * 50)
        print("SUMMARY:")
        print(f"Target Namespace: {result.get('targetNamespace')}")
        print(f"Element Form Default: {result.get('elementFormDefault')}")
        print(f"Number of top-level elements: {len(result.get('elements', []))}")
        print(f"Number of complex types: {len(result.get('complexTypes', []))}")
        
        print("\nTop-level elements:")
        for elem in result.get('elements', []):
            print(f"  - {elem['name']} (type: {elem.get('xsdType', 'unknown')})")
            
        print("\nComplex types:")
        for ct in result.get('complexTypes', []):
            print(f"  - {ct['name']} ({len(ct.get('children', []))} children, {len(ct.get('attributeDetails', []))} attributes)")
        
    except Exception as e:
        print(f"Error parsing XSD: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_xsd_parsing()