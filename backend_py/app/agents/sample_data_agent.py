from __future__ import annotations

from typing import Any, Dict, List, Optional
import json
import random
from datetime import datetime, timedelta

from .base import BaseAgent


class SampleDataAgent(BaseAgent):
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Generate intelligent sample data based on schema structure and field semantics"""
        
        schema = payload.get("schema", {})
        count = payload.get("count", 3)
        user_context = payload.get("context", "")  # User-provided business context
        target_namespace = schema.get("targetNamespace", "")
        
        # Always try enhanced generation first, then Groq if available
        enhanced_result = self._generate_enhanced_sample(schema, count, user_context)
        
        if self.groq and enhanced_result.get("method") == "enhanced_basic":
            # Try to improve with Groq AI if available
            try:
                schema_context = self._build_schema_context(schema)
                
                # Enhanced prompt that incorporates user context
                context_instruction = ""
                if user_context:
                    context_instruction = f"\n\nBusiness Context:\n{user_context}\n\nUse this context to generate realistic, domain-appropriate data."
                
                prompt = f"""
You are an expert data generation specialist for Metro Electronics Store, a mid-sized electronics retailer in Chicago. Based on the following XML schema structure, generate {count} realistic customer order records in JSON format.

Schema Context:
{schema_context}{context_instruction}

BUSINESS CONTEXT - Metro Electronics Store:
- Mid-sized electronics retailer located in Chicago, Illinois
- Sells laptops, phones, tablets, headphones, monitors, gaming equipment
- Customer base primarily in Chicago metropolitan area
- Order processing system for retail customers

REQUIREMENTS:
1. **Customer Information**: Use realistic names (no "Sample" or "Test" names)
2. **Chicago Addresses**: Use real Chicago street names and valid Chicago zip codes (60601-60661, 60707, 60827 range)
3. **Electronics Products**: 
   - Realistic electronics: laptops, phones, tablets, headphones, monitors, gaming equipment
   - Prices between $50-2000 as appropriate for electronics
   - Proper product names (e.g., "Apple MacBook Pro 16\"", "Samsung Galaxy S24", "Sony WH-1000XM5")
4. **Order Details**:
   - Order IDs: Format ORD-2024-001, ORD-2024-002, etc.
   - Customer IDs: Format CUST-001, CUST-002, etc.
   - Order dates within last 7 days
   - Quantities 1-3 per item (realistic retail quantities)
5. **Contact Information**:
   - Realistic email addresses
   - Chicago area phone numbers (312, 773, 872 area codes)
6. **Data Quality**:
   - Ensure all required attributes are included
   - Respect data types (string, decimal, date, integer, etc.)
   - Make relationships logical (order totals match item prices × quantities)
   - Use proper date formats (YYYY-MM-DD)

Return ONLY a JSON array of {count} complete order records, no explanation or markdown formatting.
Example format: [{{"field1": "value1", "field2": "value2"}}, ...]
"""

                messages = [
                    {"role": "system", "content": "You are a data generation specialist who creates realistic sample data."},
                    {"role": "user", "content": prompt}
                ]
                
                response = self.groq.chat(messages)
                
                # Try to parse the JSON response
                try:
                    sample_data = json.loads(response)
                    if isinstance(sample_data, list) and len(sample_data) > 0:
                        return {
                            "agent": self.name,
                            "output": sample_data,
                            "method": "ai_generated"
                        }
                except json.JSONDecodeError:
                    # If JSON parsing fails, try to extract JSON from response
                    sample_data = self._extract_json_from_response(response)
                    if sample_data:
                        return {
                            "agent": self.name,
                            "output": sample_data,
                            "method": "ai_generated_parsed"
                        }
                
            except Exception as e:
                # If Groq fails, continue with enhanced basic generation
                pass
        
        # Return enhanced basic generation result
        return enhanced_result
    
    def _build_schema_context(self, schema: Dict[str, Any]) -> str:
        """Build a human-readable context about the schema for Groq"""
        context_parts = []
        
        target_ns = schema.get("targetNamespace", "")
        if target_ns:
            context_parts.append(f"Target Namespace: {target_ns}")
        
        elements = schema.get("elements", [])
        complex_types = schema.get("complexTypes", [])
        
        if elements:
            context_parts.append("\nMain Elements:")
            for elem in elements:
                context_parts.append(f"- {elem.get('name')} ({elem.get('xsdType', 'unknown')})")
                if elem.get('children'):
                    context_parts.append(f"  Children: {[c.get('name') for c in elem.get('children', [])]}")
        
        if complex_types:
            context_parts.append("\nComplex Types:")
            for ct in complex_types:
                context_parts.append(f"- {ct.get('name')}")
                children = ct.get('children', [])
                attributes = ct.get('attributeDetails', [])
                if children:
                    context_parts.append(f"  Fields: {[c.get('name') + ' (' + c.get('xsdType', 'unknown') + ')' for c in children]}")
                if attributes:
                    context_parts.append(f"  Attributes: {[a.get('name') + ' (' + a.get('xsdType', 'unknown') + ')' for a in attributes]}")
        
        return "\n".join(context_parts)
    
    def _extract_json_from_response(self, response: str) -> Optional[List[Dict[str, Any]]]:
        """Try to extract JSON from a response that might have extra text"""
        try:
            # Look for JSON array patterns
            start = response.find('[')
            end = response.rfind(']')
            if start != -1 and end != -1 and end > start:
                json_str = response[start:end+1]
                return json.loads(json_str)
        except:
            pass
        
        try:
            # Look for JSON object patterns
            start = response.find('{')
            end = response.rfind('}')
            if start != -1 and end != -1 and end > start:
                json_str = response[start:end+1]
                obj = json.loads(json_str)
                return [obj] if isinstance(obj, dict) else obj
        except:
            pass
        
        return None
    
    def _generate_enhanced_sample(self, schema: Dict[str, Any], count: int, user_context: str = "") -> Dict[str, Any]:
        """Enhanced sample generation with better field type awareness"""
        
        sample_data = []
        elements = schema.get("elements", [])
        
        if not elements:
            return {"agent": self.name, "output": [], "method": "no_schema"}
        
        # Find the most complex element (one with the most children)
        main_element = elements[0]
        for elem in elements:
            if len(elem.get('children', [])) > len(main_element.get('children', [])):
                main_element = elem
        
        # If no element has children, pick one that references a complex type
        if not main_element.get('children') and main_element.get('xsdType') == 'complexType':
            # Look for the complex type definition
            complex_types = schema.get('complexTypes', [])
            for ct in complex_types:
                if ct.get('children'):  # Found a complex type with structure
                    # Create a synthetic element that combines the element name with complex type structure
                    main_element = {
                        'name': main_element.get('name'),
                        'xsdType': 'complexType',
                        'children': ct.get('children', []),
                        'attributeDetails': ct.get('attributeDetails', [])
                    }
                    break
        
        for i in range(count):
            record = self._generate_element_data(main_element, i)
            sample_data.append(record)
        
        return {
            "agent": self.name,
            "output": sample_data,
            "method": "enhanced_basic"
        }
    
    def _generate_element_data(self, element: Dict[str, Any], index: int) -> Dict[str, Any]:
        """Generate data for a single element based on its structure"""
        
        data = {}
        
        # Handle attributes
        for attr in element.get('attributeDetails', []):
            attr_name = attr.get('name')
            attr_type = attr.get('xsdType', 'string')
            fixed_value = attr.get('fixed')
            
            if fixed_value:
                data[f"@{attr_name}"] = fixed_value
            else:
                data[f"@{attr_name}"] = self._generate_typed_value(attr_name, attr_type, index)
        
        # Handle child elements
        for child in element.get('children', []):
            child_name = child.get('name')
            child_type = child.get('xsdType', 'string')
            max_occurs = child.get('maxOccurs')
            
            if max_occurs == 'unbounded':
                # Generate 1-3 items for unbounded elements
                item_count = random.randint(1, 3)
                if child.get('children'):
                    # Complex child - generate array of objects
                    data[child_name] = [self._generate_element_data(child, i) for i in range(item_count)]
                else:
                    # Simple child - generate array of values
                    data[child_name] = [self._generate_typed_value(child_name, child_type, i) for i in range(item_count)]
            else:
                if child.get('children'):
                    # Complex child - generate single object
                    data[child_name] = self._generate_element_data(child, index)
                else:
                    # Simple child - generate single value
                    data[child_name] = self._generate_typed_value(child_name, child_type, index)
        
        return data
    
    def _generate_typed_value(self, field_name: str, xsd_type: str, index: int) -> Any:
        """Generate a value based on field name semantics and XSD type"""
        
        field_lower = field_name.lower()
        
        # Date fields
        if xsd_type in ['date', 'dateTime'] or 'date' in field_lower:
            base_date = datetime.now()
            if 'ship' in field_lower:
                # Shipping dates should be in the future (1-10 days)
                return (base_date + timedelta(days=random.randint(1, 10))).strftime('%Y-%m-%d')
            elif 'order' in field_lower or 'confirm' in field_lower:
                # Order dates should be recent (within last 7 days)
                return (base_date - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d')
            else:
                return (base_date - timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d')
        
        # Numeric fields
        if xsd_type in ['decimal', 'float', 'double']:
            if any(word in field_lower for word in ['price', 'usprice']):
                # Electronics pricing between $50-2000 as requested
                return round(random.uniform(50.0, 2000.0), 2)
            elif any(word in field_lower for word in ['amount', 'cost', 'total', 'revenue']):
                return round(random.uniform(100.0, 5000.0), 2)
            elif 'zip' in field_lower:
                # Chicago area zip codes
                chicago_zips = [60601, 60602, 60603, 60604, 60605, 60606, 60607, 60608, 60609, 60610,
                               60611, 60612, 60613, 60614, 60615, 60616, 60617, 60618, 60619, 60620,
                               60621, 60622, 60623, 60624, 60625, 60626, 60628, 60629, 60630, 60631,
                               60632, 60633, 60634, 60636, 60637, 60638, 60639, 60640, 60641, 60642,
                               60643, 60644, 60645, 60646, 60647, 60649, 60651, 60652, 60653, 60654,
                               60655, 60656, 60657, 60659, 60660, 60661, 60707, 60827]
                return random.choice(chicago_zips)
            else:
                return round(random.uniform(1.0, 100.0), 2)
        
        if xsd_type in ['integer', 'int', 'positiveInteger']:
            if any(word in field_lower for word in ['quantity', 'count']):
                # Quantities should be 1-3 as requested
                return random.randint(1, 3)
            elif 'number' in field_lower:
                return random.randint(1, 100)
            elif 'id' in field_lower:
                if 'customer' in field_lower:
                    return f"CUST-{index + 1:03d}"
                elif 'order' in field_lower:
                    return f"ORD-2024-{index + 1:03d}"
                else:
                    return index + 1000
            else:
                return random.randint(1, 1000)
        
        # String fields with semantic meaning
        if xsd_type in ['string', 'NMTOKEN', 'unknown']:
            if 'name' in field_lower:
                if 'product' in field_lower:
                    # Realistic electronics products with proper names
                    electronics = [
                        'Apple MacBook Pro 16" M3 Max',
                        'Samsung Galaxy S24 Ultra 256GB', 
                        'Sony WH-1000XM5 Wireless Headphones',
                        'Dell UltraSharp 32" 4K Monitor',
                        'iPad Pro 12.9" 6th Generation',
                        'Logitech MX Master 3S Wireless Mouse',
                        'iPhone 15 Pro Max 512GB',
                        'Bose QuietComfort Earbuds',
                        'Microsoft Surface Laptop Studio',
                        'Canon EOS R6 Mark II Camera',
                        'ASUS ROG Gaming Laptop',
                        'AirPods Pro 2nd Generation',
                        'Samsung 55" QLED 4K Smart TV',
                        'Nintendo Switch OLED Console',
                        'Razer DeathAdder V3 Gaming Mouse'
                    ]
                    return random.choice(electronics)
                elif 'company' in field_lower:
                    return "Metro Electronics Store"
                else:
                    # Realistic customer names
                    first_names = ['Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Maria', 
                                  'Christopher', 'Patricia', 'Daniel', 'Susan', 'Matthew', 'Jessica', 'Anthony']
                    last_names = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
                                 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas']
                    return f"{random.choice(first_names)} {random.choice(last_names)}"
            
            elif 'street' in field_lower or 'address' in field_lower:
                # Real Chicago street names
                chicago_streets = [
                    '1247 North Michigan Avenue',
                    '3456 West Madison Street', 
                    '789 South State Street',
                    '2134 North Lake Shore Drive',
                    '567 West Division Street',
                    '890 North Rush Street',
                    '1523 West Fullerton Avenue',
                    '324 East Ohio Street',
                    '876 North Clark Street',
                    '1998 West Belmont Avenue',
                    '445 North Wells Street',
                    '2367 West Armitage Avenue',
                    '123 East Wacker Drive',
                    '678 North LaSalle Street',
                    '1456 West Lincoln Avenue'
                ]
                return random.choice(chicago_streets)
            
            elif 'city' in field_lower:
                # Chicago neighborhoods and suburbs
                chicago_areas = ['Chicago', 'Evanston', 'Oak Park', 'Cicero', 'Skokie', 'Des Plaines', 'Elmhurst']
                return random.choice(chicago_areas)
            
            elif 'state' in field_lower:
                return 'IL'
            
            elif 'country' in field_lower:
                return 'US'
            
            elif 'email' in field_lower:
                domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
                # Generate email based on customer names if possible
                names = ['michael.johnson', 'sarah.williams', 'david.brown', 'jennifer.jones', 'robert.garcia',
                        'lisa.miller', 'james.davis', 'maria.rodriguez', 'chris.martinez', 'patricia.hernandez']
                return f"{random.choice(names)}@{random.choice(domains)}"
            
            elif 'phone' in field_lower or 'mobile' in field_lower:
                # Chicago area codes: 312, 773, 872
                area_codes = ['312', '773', '872']
                return f"({random.choice(area_codes)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}"
            
            elif 'comment' in field_lower:
                retail_comments = [
                    'Please call before delivery',
                    'Expedite shipping - needed for project', 
                    'Handle electronics with care',
                    'Leave at front desk if not home',
                    'Standard delivery is fine',
                    'Rush order - needed by weekend',
                    'Gift wrap requested',
                    'Fragile - electronics inside'
                ]
                return random.choice(retail_comments)
            
            elif any(word in field_lower for word in ['sku', 'partnum', 'partnum']):
                # Electronics SKU format
                prefixes = ['ELEC', 'COMP', 'PHON', 'TABL', 'AUDV']
                return f"{random.choice(prefixes)}-{random.randint(1000, 9999)}"
            
            elif 'customerid' in field_lower.replace(' ', ''):
                return f"CUST-{index + 1:03d}"
                
            elif 'orderid' in field_lower.replace(' ', ''):
                return f"ORD-2024-{index + 1:03d}"
            
            else:
                return f"{field_name}-{index + 1}"
        
        # Default fallback
        return f"{field_name}-{index + 1}"
    
    def _generate_basic_sample(self, schema: Dict[str, Any], count: int) -> Dict[str, Any]:
        """Basic fallback generation when nothing else works"""
        return {
            "agent": self.name,
            "output": [{"message": f"Generated {count} basic samples"}],
            "method": "basic_fallback"
        }