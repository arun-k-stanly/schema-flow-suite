from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(prefix="/code", tags=["code"])


class CodeGenRequest(BaseModel):
    model: Dict[str, Any]
    input_format: str = "json"  # json or xml
    input_path: Optional[str] = None
    input_options: Optional[Dict[str, Any]] = None
    adls_config: Optional[Dict[str, Any]] = None  # { enabled: bool, account_name, account_key, container }


@router.post("/pyspark")
def generate_pyspark(req: CodeGenRequest):
    fact = req.model.get("fact", {})
    fact_name = fact.get("name", "fact_table") or "fact_table"
    fact_cols: List[Dict[str, Any]] = list(fact.get("columns", []) or [])
    dimensions: List[Dict[str, Any]] = list(req.model.get("dimensions", []) or [])

    def _escape_sql(s: str) -> str:
        # escape backslashes and double quotes for safe embedding in a Python string
        return s.replace("\\", "\\\\").replace('"', '\\"')

    def select_exprs(cols: List[Dict[str, Any]]) -> List[str]:
        exprs: List[str] = []
        for c in cols:
            name = (c.get("name") or "").strip()
            if not name:
                continue
            derived = c.get("derived_from")
            if derived:
                safe = _escape_sql(str(derived))
                exprs.append(f'expr("{safe}").alias("{name}")')
            else:
                exprs.append(f"col('{name}').alias('{name}')")
        return exprs

    code: List[str] = []
    code.append("from pyspark.sql import SparkSession")
    code.append("from pyspark.sql.functions import col, expr, monotonically_increasing_id")
    code.append("")
    code.append("spark = SparkSession.builder.appName(\"SchemaFlowETL\").getOrCreate()")
    code.append("")
    # Optional: ADLS Gen2 configuration
    fmt = (req.input_format or "json").lower()
    path = req.input_path or {
        "json": "input.json",
        "parquet": "input.parquet",
        "avro": "input.avro",
        "csv": "input.csv",
        "xml": "input.xml",
    }.get(fmt, "input.json")

    if (req.adls_config or {}).get("enabled"):
        account = (req.adls_config or {}).get("account_name") or "<account>"
        container = (req.adls_config or {}).get("container") or "<container>"
        account_key = (req.adls_config or {}).get("account_key")
        if account_key:
            code.append(
                f"spark.conf.set('fs.azure.account.key.{account}.dfs.core.windows.net', '{account_key}')"
            )
        # Build abfss path if user provided a relative path
        if not path.startswith("abfss://"):
            path = f"abfss://{container}@{account}.dfs.core.windows.net/{path}"

    code.append("reader = spark.read")
    options = req.input_options or {}
    for k, v in options.items():
        # convert booleans to 'true'/'false' strings in code for readability
        sval = str(v).lower() if isinstance(v, bool) else str(v)
        code.append(f"reader = reader.option('{k}', '{sval}')")

    if fmt == "json":
        code.append("# Read flattened source rows (generated from your schema)")
        code.append(f"input_df = reader.json('{path}')")
    elif fmt == "parquet":
        code.append(f"input_df = reader.parquet('{path}')")
    elif fmt == "avro":
        code.append("# Requires spark-avro package")
        code.append(f"input_df = reader.format('avro').load('{path}')")
    elif fmt == "csv":
        code.append(f"input_df = reader.csv('{path}')")
    elif fmt == "xml":
        code.append("# Requires spark-xml package")
        # default rowTag to the fact table name when not provided
        if not options.get("rowTag"):
            code.append(f"reader = reader.option('rowTag','{fact_name}')")
        code.append(f"input_df = reader.format('xml').load('{path}')")
    else:
        code.append(f"# Unsupported format '{fmt}', reading as JSON fallback")
        code.append(f"input_df = reader.json('{path}')")
    code.append("")

    # Dimensions first (deduplicate on PK when present)
    for d in dimensions:
        dname = d.get('name') or 'dimension'
        dcols: List[Dict[str, Any]] = list(d.get('columns', []) or [])
        dselect = select_exprs(dcols)
        if dselect:
            code.append(f"{dname}_df = input_df.select({', '.join(dselect)})")
        else:
            code.append(f"{dname}_df = input_df")
        # drop duplicates by PK if any
        pk_cols = [c.get('name') for c in dcols if str(c.get('key') or '').upper() == 'PK']
        if pk_cols:
            code.append(f"{dname}_df = {dname}_df.dropDuplicates({pk_cols})")
        code.append(f"{dname}_df.write.mode('overwrite').parquet('{dname}')")
        code.append("")

    # Fact table
    fselect = select_exprs(fact_cols)
    if fselect:
        code.append(f"fact_df = input_df.select({', '.join(fselect)})")
    else:
        code.append("fact_df = input_df")
    code.append(f"fact_df.write.mode('overwrite').parquet('{fact_name}')")
    code.append("")
    code.append("print('ETL completed')")

    return {"language": "python", "framework": "pyspark", "code": "\n".join(code)}


