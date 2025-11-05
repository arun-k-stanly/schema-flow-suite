from __future__ import annotations

from typing import Any, Dict, List, Optional

from .base import BaseAgent


class DataModelAgent(BaseAgent):
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Analyze XSD schema structure and provide meaningful insights"""
        
        schema = payload.get("schema") or payload.get("schema_def") or {}
        
        # Analyze XSD schema structure
        analysis = self._analyze_xsd_schema(schema)
        
        # Generate AI suggestions if Groq is available
        suggestion: str | None = None
        if self.groq and analysis.get("isValid"):
            try:
                schema_context = self._build_schema_context(schema, analysis)
                
                prompt = f"""
You are a data modeling expert analyzing an XSD schema structure. Based on the following schema analysis, provide practical suggestions for improving the data model design.

Schema Analysis:
{schema_context}

Focus your suggestions on:
1. **Data Model Structure**: Are the entities and relationships well-designed?
2. **Business Logic**: Does the model capture the business domain effectively?
3. **Data Integrity**: Are there missing constraints, validations, or required fields?
4. **Normalization**: Are there opportunities to reduce redundancy or improve organization?
5. **Extensibility**: How can the model be made more flexible for future needs?
6. **Performance**: Are there structural improvements that would help with data processing?

Provide 2-3 specific, actionable suggestions. Be concise and focus on the most impactful improvements.
"""

                messages = [
                    {"role": "system", "content": "You are a senior data architect providing actionable suggestions for schema improvements."},
                    {"role": "user", "content": prompt}
                ]
                
                suggestion = self.groq.chat(messages)
                
            except Exception as e:
                # If Groq fails, provide a fallback suggestion
                suggestion = self._generate_fallback_suggestion(analysis)
        
        return {
            "agent": self.name, 
            "summary": analysis, 
            "suggestion": suggestion
        }

    def _analyze_xsd_schema(self, schema: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze XSD schema structure and extract meaningful insights"""
        
        elements = schema.get("elements", [])
        complex_types = schema.get("complexTypes", [])
        target_namespace = schema.get("targetNamespace", "")
        
        if not elements and not complex_types:
            return {
                "isValid": False,
                "numElements": 0,
                "numComplexTypes": 0,
                "entities": [],
                "relationships": [],
                "issues": ["No elements or complex types found in schema"]
            }
        
        # Analyze entities (main business objects)
        entities = self._extract_entities(elements, complex_types)
        
        # Analyze relationships between entities
        relationships = self._extract_relationships(elements, complex_types)
        
        # Identify potential issues
        issues = self._identify_schema_issues(elements, complex_types, entities)
        
        # Calculate complexity metrics
        total_fields = sum(len(entity.get("fields", [])) for entity in entities)
        max_depth = max((self._calculate_nesting_depth(elem) for elem in elements), default=0)
        
        return {
            "isValid": True,
            "numElements": len(elements),
            "numComplexTypes": len(complex_types),
            "totalFields": total_fields,
            "maxNestingDepth": max_depth,
            "targetNamespace": target_namespace,
            "entities": entities,
            "relationships": relationships,
            "issues": issues,
            "complexity": self._assess_complexity(len(entities), total_fields, max_depth)
        }

    def _extract_entities(self, elements: List[Dict[str, Any]], complex_types: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract business entities from XSD elements and complex types"""
        
        entities = []
        
        # Process top-level elements as potential entities
        for element in elements:
            if element.get("xsdType") == "complexType" and element.get("children"):
                entity = {
                    "name": element.get("name", "Unknown"),
                    "type": "root_element",
                    "fields": self._extract_fields(element),
                    "isRequired": element.get("minOccurs") != "0",
                    "isRepeatable": element.get("maxOccurs") == "unbounded",
                    "hasAttributes": len(element.get("attributeDetails", [])) > 0
                }
                entities.append(entity)
        
        # Process complex types as entities
        for complex_type in complex_types:
            entity = {
                "name": complex_type.get("name", "Unknown"),
                "type": "complex_type",
                "fields": self._extract_fields(complex_type),
                "hasAttributes": len(complex_type.get("attributeDetails", [])) > 0,
                "isReusable": True  # Complex types are reusable by definition
            }
            entities.append(entity)
        
        return entities

    def _extract_fields(self, element: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract field information from an element or complex type"""
        
        fields = []
        
        # Add attributes as fields
        for attr in element.get("attributeDetails", []):
            fields.append({
                "name": attr.get("name"),
                "type": attr.get("xsdType"),
                "category": "attribute",
                "isRequired": attr.get("use") == "required",
                "isFixed": attr.get("fixed") is not None,
                "fixedValue": attr.get("fixed")
            })
        
        # Add child elements as fields
        for child in element.get("children", []):
            field_info = {
                "name": child.get("name"),
                "type": child.get("xsdType"),
                "category": "element",
                "isRequired": child.get("minOccurs") != "0",
                "isRepeatable": child.get("maxOccurs") == "unbounded",
                "isComplex": child.get("xsdType") == "complexType"
            }
            
            # Add nested field count for complex fields
            if child.get("children"):
                field_info["nestedFieldCount"] = len(child.get("children", []))
            
            fields.append(field_info)
        
        return fields

    def _extract_relationships(self, elements: List[Dict[str, Any]], complex_types: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify relationships between entities"""
        
        relationships = []
        
        for element in elements:
            relationships.extend(self._find_element_relationships(element))
        
        return relationships

    def _find_element_relationships(self, element: Dict[str, Any], parent_name: str = None) -> List[Dict[str, Any]]:
        """Find relationships within an element"""
        
        relationships = []
        element_name = parent_name or element.get("name", "Unknown")
        
        for child in element.get("children", []):
            child_name = child.get("name")
            child_type = child.get("xsdType")
            max_occurs = child.get("maxOccurs")
            
            if child_type == "complexType":
                # This is a composition relationship
                relationship_type = "one-to-many" if max_occurs == "unbounded" else "one-to-one"
                relationships.append({
                    "from": element_name,
                    "to": child_name,
                    "type": relationship_type,
                    "category": "composition",
                    "isRequired": child.get("minOccurs") != "0"
                })
                
                # Recursively find nested relationships
                relationships.extend(self._find_element_relationships(child, child_name))
        
        return relationships

    def _identify_schema_issues(self, elements: List[Dict[str, Any]], complex_types: List[Dict[str, Any]], entities: List[Dict[str, Any]]) -> List[str]:
        """Identify potential issues in the schema design"""
        
        issues = []
        
        # Check for missing required elements
        if not elements:
            issues.append("No top-level elements defined - schema may not be usable")
        
        # Check for overly complex entities
        for entity in entities:
            field_count = len(entity.get("fields", []))
            if field_count > 20:
                issues.append(f"Entity '{entity['name']}' has {field_count} fields - consider breaking into smaller entities")
            elif field_count == 0:
                issues.append(f"Entity '{entity['name']}' has no fields defined")
        
        # Check for potential normalization issues
        field_names = []
        for entity in entities:
            for field in entity.get("fields", []):
                field_names.append(field.get("name"))
        
        # Look for duplicated field names across entities
        from collections import Counter
        field_counts = Counter(field_names)
        common_fields = [name for name, count in field_counts.items() if count > 2]
        if common_fields:
            issues.append(f"Common fields appear across multiple entities: {', '.join(common_fields[:3])} - consider creating shared types")
        
        # Check for missing business key fields
        key_indicators = ["id", "code", "number", "key", "reference"]
        for entity in entities:
            has_key_field = any(
                any(indicator in field.get("name", "").lower() for indicator in key_indicators)
                for field in entity.get("fields", [])
            )
            if not has_key_field and entity.get("type") != "complex_type":
                issues.append(f"Entity '{entity['name']}' may be missing a business key field")
        
        return issues

    def _calculate_nesting_depth(self, element: Dict[str, Any], current_depth: int = 0) -> int:
        """Calculate the maximum nesting depth of an element"""
        
        max_depth = current_depth
        
        for child in element.get("children", []):
            if child.get("xsdType") == "complexType":
                child_depth = self._calculate_nesting_depth(child, current_depth + 1)
                max_depth = max(max_depth, child_depth)
        
        return max_depth

    def _assess_complexity(self, num_entities: int, total_fields: int, max_depth: int) -> str:
        """Assess the overall complexity of the schema"""
        
        if num_entities <= 2 and total_fields <= 10:
            return "Simple"
        elif num_entities <= 5 and total_fields <= 30 and max_depth <= 3:
            return "Moderate"
        elif num_entities <= 10 and total_fields <= 60 and max_depth <= 5:
            return "Complex"
        else:
            return "Very Complex"

    def _build_schema_context(self, schema: Dict[str, Any], analysis: Dict[str, Any]) -> str:
        """Build context string for AI analysis"""
        
        context_parts = []
        
        # Basic metrics
        context_parts.append(f"Schema Complexity: {analysis.get('complexity', 'Unknown')}")
        context_parts.append(f"Number of Entities: {analysis.get('numElements', 0)} elements + {analysis.get('numComplexTypes', 0)} complex types")
        context_parts.append(f"Total Fields: {analysis.get('totalFields', 0)}")
        context_parts.append(f"Maximum Nesting Depth: {analysis.get('maxNestingDepth', 0)}")
        
        # Entity details
        entities = analysis.get("entities", [])
        if entities:
            context_parts.append(f"\nEntities ({len(entities)}):")
            for entity in entities[:5]:  # Limit to first 5
                field_count = len(entity.get("fields", []))
                context_parts.append(f"- {entity.get('name')}: {field_count} fields ({entity.get('type')})")
        
        # Relationships
        relationships = analysis.get("relationships", [])
        if relationships:
            context_parts.append(f"\nRelationships ({len(relationships)}):")
            for rel in relationships[:3]:  # Limit to first 3
                context_parts.append(f"- {rel.get('from')} -> {rel.get('to')} ({rel.get('type')})")
        
        # Issues
        issues = analysis.get("issues", [])
        if issues:
            context_parts.append(f"\nIdentified Issues:")
            for issue in issues:
                context_parts.append(f"- {issue}")
        
        return "\n".join(context_parts)

    def _generate_fallback_suggestion(self, analysis: Dict[str, Any]) -> str:
        """Generate a basic suggestion when AI is not available"""
        
        suggestions = []
        
        complexity = analysis.get("complexity", "Unknown")
        if complexity == "Very Complex":
            suggestions.append("Consider breaking down large entities into smaller, more focused ones")
        
        issues = analysis.get("issues", [])
        if any("missing a business key field" in issue for issue in issues):
            suggestions.append("Add unique identifier fields (ID, code, or reference numbers) to main entities")
        
        if any("has no fields defined" in issue for issue in issues):
            suggestions.append("Define proper field structures for empty entities")
        
        if not suggestions:
            suggestions.append("Schema structure appears well-organized. Consider adding validation constraints and documentation.")
        
        return " • ".join(suggestions)


