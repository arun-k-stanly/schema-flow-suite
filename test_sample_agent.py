#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend_py'))

from backend_py.app.agents.sample_data_agent import SampleDataAgent
from backend_py.app.core.groq_client import GroqClient
import json

# Load the purchase order schema
def load_test_schema():
    """Load the test purchase order schema"""
    try:
        with open('storage/last_schema.json', 'r') as f:
            return json.load(f)
    except:
        # Fallback: create a minimal schema for testing
        return {
            "elements": [
                {
                    "name": "purchaseOrder",
                    "xsdType": "complexType",
                    "attributeDetails": [
                        {"name": "orderDate", "xsdType": "date"},
                        {"name": "confirmDate", "xsdType": "date"}
                    ],
                    "children": [
                        {
                            "name": "shipTo",
                            "xsdType": "complexType",
                            "children": [
                                {"name": "name", "xsdType": "string"},
                                {"name": "street", "xsdType": "string"},
                                {"name": "city", "xsdType": "string"},
                                {"name": "state", "xsdType": "string"},
                                {"name": "zip", "xsdType": "decimal"}
                            ]
                        },
                        {
                            "name": "items",
                            "xsdType": "complexType",
                            "children": [
                                {
                                    "name": "item",
                                    "maxOccurs": "unbounded",
                                    "xsdType": "complexType",
                                    "attributeDetails": [
                                        {"name": "partNum", "xsdType": "string"}
                                    ],
                                    "children": [
                                        {"name": "productName", "xsdType": "string"},
                                        {"name": "quantity", "xsdType": "positiveInteger"},
                                        {"name": "USPrice", "xsdType": "decimal"},
                                        {"name": "comment", "xsdType": "string"},
                                        {"name": "shipDate", "xsdType": "date"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }

def test_sample_generation():
    """Test the enhanced sample data generation"""
    print("Testing Enhanced Sample Data Agent for Metro Electronics Store")
    print("=" * 60)
    
    # Load schema
    schema = load_test_schema()
    print(f"Loaded schema with {len(schema.get('elements', []))} elements")
    
    # Create sample data agent (without Groq for basic test)
    agent = SampleDataAgent(name="sample_data", groq_client=None)
    
    # Test the enhanced basic generation
    context = """
    Generate realistic data for Metro Electronics Store - a mid-sized electronics retailer in Chicago.
    Create orders with realistic customer names, Chicago addresses, electronics products, and proper pricing.
    """
    
    payload = {
        "schema": schema,
        "count": 3,
        "context": context
    }
    
    print(f"Generating 3 sample orders...")
    result = agent.handle(payload)
    
    print(f"\nGeneration Method: {result.get('method', 'unknown')}")
    print(f"Agent: {result.get('agent', 'unknown')}")
    
    sample_data = result.get('output', [])
    print(f"Generated {len(sample_data)} records")
    
    # Display the generated data
    for i, record in enumerate(sample_data, 1):
        print(f"\n--- ORDER {i} ---")
        print(json.dumps(record, indent=2))
    
    return sample_data

if __name__ == "__main__":
    test_sample_generation()