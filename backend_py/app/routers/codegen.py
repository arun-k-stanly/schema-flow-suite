from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(prefix="/code", tags=["code"])


class CodeGenRequest(BaseModel):
    model: Dict[str, Any]
    input_format: str = "json"  # json or xml


@router.post("/pyspark")
def generate_pyspark(req: CodeGenRequest):
    fact = req.model.get("fact", {})
    fact_name = fact.get("name", "fact_table")
    fact_cols = [c.get("name") for c in fact.get("columns", []) if c.get("name")]

    code = []
    code.append("from pyspark.sql import SparkSession")
    code.append("from pyspark.sql.functions import col")
    code.append("")
    code.append("spark = SparkSession.builder.appName(\"SchemaFlowETL\").getOrCreate()")
    code.append("")
    if req.input_format.lower() == "json":
        code.append("input_df = spark.read.json('input.json')")
    else:
        code.append("# XML input requires spark-xml; adjust as needed")
        code.append("input_df = spark.read.format('xml').option('rowTag','records').load('input.xml')")
    code.append("")
    if fact_cols:
        selects = ", ".join([f"col('{c}').alias('{c}')" for c in fact_cols])
        code.append(f"fact_df = input_df.select({selects})")
    else:
        code.append("fact_df = input_df")
    code.append("")
    code.append(f"fact_df.write.mode('overwrite').parquet('{fact_name}')")
    code.append("")
    code.append("print('ETL completed')")

    return {"language": "python", "framework": "pyspark", "code": "\n".join(code)}


