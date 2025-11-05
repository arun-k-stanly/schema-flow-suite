from __future__ import annotations

from typing import Any, Dict, List, Optional, Set
import json
import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..utils.storage import read_json
from ..core.groq_client import GroqClient
from ..agents.data_model_agent import DataModelAgent


router = APIRouter(prefix="/model", tags=["model"])


class ModelGenerateRequest(BaseModel):
    schema: Optional[Dict[str, Any]] = None
    prompt: Optional[str] = None
    sampleRows: Optional[List[Dict[str, Any]]] = None
    schemaType: Optional[str] = None  # star, snowflake, galaxy, wide_table, data_vault


@router.post("/generate")
def generate_model(req: ModelGenerateRequest):
    """Enhanced model generation using AI and schema analysis"""
    
    # Get schema and sample data
    schema = req.schema or (read_json("last_schema.json") or {})
    sample_rows = req.sampleRows or (read_json("last_rows.json") or [])
    prompt = (req.prompt or "").strip()
    schema_type = req.schemaType or "auto"  # Default to auto-detection
    
    # Use enhanced data model agent for analysis
    try:
        groq_client = GroqClient()
        data_model_agent = DataModelAgent(name="data_model", groq_client=groq_client)
    except Exception:
        # Fall back to agent without Groq
        data_model_agent = DataModelAgent(name="data_model", groq_client=None)
    
    # Get schema analysis
    analysis_result = data_model_agent.handle({"schema": schema})
    schema_analysis = analysis_result.get("summary", {})
    
    # If no elements in schema, return empty model
    elements: List[Dict[str, Any]] = schema.get("elements") or []
    if not elements:
        return {
            "model": {
                "schema_type": "empty",
                "title": "Empty Model", 
                "description": "No schema elements found to generate model from.",
                "fact": {"name": "fact", "columns": []}, 
                "dimensions": []
            }
        }

    # Extract ALL possible columns from schema structure
    allowed_from_schema = _extract_all_schema_columns(schema, schema_analysis)
    
    # Enhanced AI-powered model generation
    if prompt:
        try:
            groq = GroqClient()
            ai_model = _generate_ai_model(groq, prompt, schema, schema_analysis, sample_rows, allowed_from_schema, schema_type)
            if ai_model:
                return {"model": ai_model}
        except Exception as e:
            # Continue to heuristic generation if AI fails
            pass
    
    # Heuristic model generation from schema
    heuristic_model = _generate_heuristic_model(schema, schema_analysis, sample_rows, allowed_from_schema, schema_type)
    return {"model": heuristic_model}


def _extract_all_schema_columns(schema: Dict[str, Any], analysis: Dict[str, Any]) -> Set[str]:
    """Extract all possible column names from XSD schema structure"""
    columns = set()
    
    # Get columns from entities analysis
    entities = analysis.get("entities", [])
    for entity in entities:
        for field in entity.get("fields", []):
            field_name = field.get("name")
            if field_name:
                columns.add(field_name)
    
    # Also extract from raw schema elements
    elements = schema.get("elements", [])
    complex_types = schema.get("complexTypes", [])
    
    def _extract_from_element(element: Dict[str, Any], prefix: str = "") -> None:
        """Recursively extract column names from element structure"""
        name = element.get("name", "")
        if name and prefix:
            columns.add(f"{prefix}_{name}")
        elif name:
            columns.add(name)
            
        # Extract from attributes
        for attr in element.get("attributeDetails", []):
            attr_name = attr.get("name")
            if attr_name:
                full_name = f"{prefix}_{attr_name}" if prefix else attr_name
                columns.add(full_name)
                
        # Extract from children recursively
        for child in element.get("children", []):
            child_prefix = name if name else prefix
            _extract_from_element(child, child_prefix)
    
    # Process all elements
    for element in elements:
        _extract_from_element(element)
        
    # Process all complex types
    for complex_type in complex_types:
        _extract_from_element(complex_type)
    
    return columns


def _generate_ai_model(groq: GroqClient, prompt: str, schema: Dict[str, Any], analysis: Dict[str, Any], sample_rows: List[Dict[str, Any]], allowed_from_schema: Set[str], schema_type: str) -> Optional[Dict[str, Any]]:
    """Generate AI-powered data model with specific schema type"""
    
    # Build context for AI
    context_parts = []
    
    # Schema context
    if analysis.get("isValid"):
        context_parts.append(f"Schema Analysis:")
        context_parts.append(f"- Complexity: {analysis.get('complexity', 'Unknown')}")
        context_parts.append(f"- Entities: {analysis.get('numElements', 0)} elements + {analysis.get('numComplexTypes', 0)} complex types")
        context_parts.append(f"- Total Fields: {analysis.get('totalFields', 0)}")
        
        entities = analysis.get("entities", [])
        if entities:
            context_parts.append(f"- Main Entities: {', '.join([e.get('name', 'Unknown') for e in entities[:5]])}")
    
    # Sample data context
    sample_excerpt = sample_rows[:3] if isinstance(sample_rows, list) else []
    if sample_excerpt:
        context_parts.append(f"\nSample Data Structure:")
        for i, row in enumerate(sample_excerpt, 1):
            if isinstance(row, dict):
                context_parts.append(f"Record {i}: {list(row.keys())[:10]}")  # Show first 10 keys
    
    context_str = "\n".join(context_parts)
    
    # Collect available columns from sample data
    available_columns = set()
    if sample_excerpt and isinstance(sample_excerpt[0], dict):
        available_columns.update(sample_excerpt[0].keys())
    
    # Determine schema type preference
    schema_type_instruction = ""
    if schema_type and schema_type != "auto":
        schema_type_instruction = f"\n**REQUIRED SCHEMA TYPE**: You MUST use '{schema_type}' schema type. Do not choose any other type."
    
    prompt_template = f"""
You are a senior data architect designing an optimal data warehouse model. Based on the user's request and the provided schema/data context, create a well-designed model.

User Request: {prompt}

Context:
{context_str}

Requirements:
1. **Schema Type**: {"Use '" + schema_type + "' schema type as required" if schema_type != "auto" else "Choose the most appropriate type (star, snowflake, galaxy, wide_table, data_vault)"}
2. **Business Focus**: Design for analytics and reporting efficiency  
3. **Fact Table**: Include measures (numeric metrics) and foreign keys to dimensions
4. **Dimensions**: Create logical groupings of descriptive attributes
5. **Keys**: Use surrogate keys (PK/FK) for proper relationships
6. **Data Types**: Use appropriate SQL types (INTEGER, DECIMAL, VARCHAR, DATE, TIMESTAMP, BOOLEAN){schema_type_instruction}

Available Columns: {list(available_columns)[:20]}

Respond ONLY with JSON in this exact format:
{{
  "schema_type": "{schema_type if schema_type != 'auto' else 'star|snowflake|galaxy|wide_table|data_vault'}",
  "title": "Descriptive model title",
  "description": "Brief explanation of the model design",
  "fact": {{
    "name": "fact_table_name",
    "columns": [
      {{"name": "column_name", "type": "SQL_TYPE", "key": "PK|FK|"}},
      {{"name": "measure_column", "type": "DECIMAL", "key": ""}}
    ]
  }},
  "dimensions": [
    {{
      "name": "dim_table_name", 
      "columns": [
        {{"name": "id", "type": "INTEGER", "key": "PK"}},
        {{"name": "attribute", "type": "VARCHAR", "key": ""}}
      ]
    }}
  ]
}}

Focus on creating a model optimized for {prompt}"""

    messages = [
        {"role": "system", "content": "You are a data warehouse architect specializing in dimensional modeling and star schema design."},
        {"role": "user", "content": prompt_template}
    ]
    
    try:
        ai_response = groq.chat(messages)
        
        # Extract JSON from response
        json_match = re.search(r"\{[\s\S]*\}", ai_response)
        if json_match:
            ai_model = json.loads(json_match.group(0))
            
            # Validate the model structure
            if isinstance(ai_model, dict) and "fact" in ai_model:
                return ai_model
                
    except Exception as e:
        pass
    
    return None


def _generate_heuristic_model(schema: Dict[str, Any], analysis: Dict[str, Any], sample_rows: List[Dict[str, Any]], allowed_from_schema: Set[str], schema_type: str) -> Dict[str, Any]:
    """Generate heuristic model from schema analysis with comprehensive column coverage"""
    
    elements: List[Dict[str, Any]] = schema.get("elements") or []
    root = elements[0] if elements else {}
    
    # Find repeatable elements (potential facts)
    repeated = None
    others: List[Dict[str, Any]] = []
    
    for ch in root.get("children", []) or []:
        max_occurs = (ch.get("maxOccurs") or "1").lower()
        if repeated is None and (max_occurs == "unbounded" or max_occurs not in ("1", None)):
            repeated = ch
        else:
            others.append(ch)

    def map_xsd_to_sql(xsd_type: Optional[str]) -> str:
        """Map XSD types to SQL types"""
        if not xsd_type:
            return "VARCHAR"
        t = xsd_type.lower()
        mapping = {
            "string": "VARCHAR", "normalizedstring": "VARCHAR", "token": "VARCHAR",
            "boolean": "BOOLEAN", "decimal": "DECIMAL", "integer": "INTEGER", 
            "positiveinteger": "INTEGER", "nonnegativeinteger": "INTEGER",
            "long": "BIGINT", "int": "INTEGER", "short": "SMALLINT",
            "float": "FLOAT", "double": "DOUBLE", "date": "DATE", 
            "datetime": "TIMESTAMP", "time": "TIME"
        }
        return mapping.get(t, "VARCHAR")

    def to_columns(el: Dict[str, Any], add_id: bool = False) -> List[Dict[str, str]]:
        """Convert element to columns"""
        cols = []
        
        # Add surrogate key for dimensions
        if add_id:
            table_name = el.get("name", "table")
            cols.append({"name": f"{table_name}_id", "type": "INTEGER", "key": "PK"})
        
        # Add attributes
        attr_details = {ad.get("name", ""): ad.get("xsdType") for ad in el.get("attributeDetails", [])}
        for a in el.get("attributes", []):
            sql_type = map_xsd_to_sql(attr_details.get(a))
            cols.append({"name": a, "type": sql_type, "key": ""})
        
        # Add child elements
        if not el.get("children"):
            sql_type = map_xsd_to_sql(el.get("xsdType"))
            cols.append({"name": el.get("name", "value"), "type": sql_type, "key": ""})
        else:
            for ch in el.get("children", []):
                # For complex children, just add a foreign key reference
                if ch.get("xsdType") == "complexType":
                    child_name = ch.get("name", "child")
                    cols.append({"name": f"{child_name}_id", "type": "INTEGER", "key": "FK"})
                else:
                    cols.extend(to_columns(ch))
        
        return cols

    # Build fact table
    fact_element = repeated or root
    fact_name = fact_element.get("name", "fact")
    fact_columns = to_columns(fact_element)
    
    # Add fact table ID if not present
    has_id = any(col.get("key") == "PK" for col in fact_columns)
    if not has_id:
        fact_columns.insert(0, {"name": f"{fact_name}_id", "type": "INTEGER", "key": "PK"})
    
    # Build dimension tables  
    dimensions = []
    for d in others:
        dim_name = d.get("name", "dimension")
        dim_columns = to_columns(d, add_id=True)  # Add surrogate key
        dimensions.append({"name": f"dim_{dim_name}", "columns": dim_columns})

    # COMPREHENSIVE COLUMN COVERAGE: Ensure ALL columns from schema are included
    used_columns = set()
    # Collect columns already used in fact and dimensions
    for col in fact_columns:
        col_name = col.get("name", "")
        if col_name in allowed_from_schema:
            used_columns.add(col_name)
    
    for dim in dimensions:
        for col in dim.get("columns", []):
            col_name = col.get("name", "")
            if col_name in allowed_from_schema:
                used_columns.add(col_name)
    
    # Add missing columns to fact table or create comprehensive dimension
    missing_columns = allowed_from_schema - used_columns
    if missing_columns:
        # Add missing columns to fact table
        for missing_col in missing_columns:
            # Determine appropriate type based on column name
            col_type = "VARCHAR"
            if any(x in missing_col.lower() for x in ["date", "time"]):
                col_type = "DATE"
            elif any(x in missing_col.lower() for x in ["price", "amount", "cost", "total", "qty", "quantity"]):
                col_type = "DECIMAL"
            elif any(x in missing_col.lower() for x in ["id", "num", "count"]):
                col_type = "INTEGER"
            
            # Add to fact if it's measure-like, otherwise create comprehensive dimension
            if any(x in missing_col.lower() for x in ["price", "amount", "cost", "total", "qty", "quantity", "date"]):
                fact_columns.append({"name": missing_col, "type": col_type})
            else:
                # Find or create comprehensive dimension
                comp_dim = None
                for dim in dimensions:
                    if dim["name"] == "dim_comprehensive":
                        comp_dim = dim
                        break
                
                if not comp_dim:
                    comp_dim = {
                        "name": "dim_comprehensive",
                        "columns": [{"name": "comprehensive_id", "type": "INTEGER", "key": "PK"}]
                    }
                    dimensions.append(comp_dim)
                
                comp_dim["columns"].append({"name": missing_col, "type": col_type})

    fact = {"name": f"fact_{fact_name}", "columns": fact_columns}

    # Determine schema characteristics based on user choice or auto-detection
    complexity = analysis.get("complexity", "Simple")
    num_entities = len(analysis.get("entities", []))
    
    if schema_type and schema_type != "auto":
        # Use user-specified schema type
        chosen_schema_type = schema_type
        if schema_type == "star":
            title = "Star Schema Model"
            description = "Star schema with central fact table and surrounding dimension tables"
        elif schema_type == "snowflake":
            title = "Snowflake Schema Model"
            description = "Normalized snowflake schema with fact table and hierarchical dimension tables"
        elif schema_type == "galaxy":
            title = "Galaxy Schema Model"
            description = "Galaxy schema with multiple fact tables and shared dimensions"
        elif schema_type == "wide_table":
            title = "Wide Table Model"
            description = "Denormalized wide table model for simplified analytics"
        elif schema_type == "data_vault":
            title = "Data Vault Model"
            description = "Data vault model with hubs, links, and satellites for enterprise data warehousing"
        else:
            # Fallback for unknown types
            chosen_schema_type = "star"
            title = "Star Schema Model"
            description = "Default star schema model"
    else:
        # Auto-detect based on complexity
        if num_entities <= 3:
            chosen_schema_type = "star"
            title = "Star Schema Model"
            description = "Simple star schema with central fact table and surrounding dimension tables"
        elif num_entities <= 6:
            chosen_schema_type = "snowflake" 
            title = "Snowflake Schema Model"
            description = "Normalized snowflake schema with fact and hierarchical dimension tables"
        else:
            chosen_schema_type = "galaxy"
            title = "Galaxy Schema Model" 
            description = "Complex galaxy schema with multiple fact tables and shared dimensions"

    return {
        "schema_type": chosen_schema_type,
        "title": title,
        "description": description,
        "fact": fact,
        "dimensions": dimensions
    }


