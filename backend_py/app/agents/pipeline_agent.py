from __future__ import annotations

from typing import Any

from pyspark.sql import DataFrame

from .base import BaseAgent
from ..core.spark import get_spark_session


class PipelineAgent(BaseAgent):
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        rows = payload.get("rows") or []
        output_path = payload.get("output_path")
        
        if not isinstance(rows, list):
            return {"error": "rows must be a list of objects"}

        ops = payload.get("ops") or []
        pyspark_code_lines = [
            "from pyspark.sql import SparkSession",
            "from pyspark.sql.functions import col, expr",
            "",
            "spark = SparkSession.builder.appName(\"PipelineTransform\").getOrCreate()",
            "",
            "# Create DataFrame from input data",
            f"df = spark.createDataFrame({rows})",
            ""
        ]
        
        # Generate PySpark operations
        for op in ops:
            if not isinstance(op, dict):
                continue
            action = op.get("action")
            if action == "select":
                cols = op.get("columns") or []
                if cols:
                    cols_str = ", ".join([f"'{col}'" for col in cols])
                    pyspark_code_lines.append(f"df = df.select({cols_str})")
            elif action == "filter_eq":
                # { action: 'filter_eq', column: 'status', value: 'ok' }
                col = op.get("column")
                val = op.get("value")
                if col is not None:
                    if isinstance(val, str):
                        pyspark_code_lines.append(f"df = df.filter(df['{col}'] == '{val}')")
                    else:
                        pyspark_code_lines.append(f"df = df.filter(df['{col}'] == {val})")

        # Add output operation if output_path is provided
        if output_path:
            pyspark_code_lines.extend([
                "",
                f"# Save transformed data to output path",
                f"df.write.mode('overwrite').parquet('{output_path}')",
                "",
                "print('Pipeline transformation completed')"
            ])

        generated_code = "\n".join(pyspark_code_lines)

        # Try to execute with PySpark if available, otherwise just return the generated code
        try:
            spark = get_spark_session()
            df: DataFrame = spark.createDataFrame(rows)

            # Apply operations to actual DataFrame
            for op in ops:
                if not isinstance(op, dict):
                    continue
                action = op.get("action")
                if action == "select":
                    cols = op.get("columns") or []
                    if cols:
                        df = df.select(*cols)
                elif action == "filter_eq":
                    col = op.get("column")
                    val = op.get("value")
                    if col is not None:
                        df = df.filter(df[col] == val)

            count = df.count()
            sample = df.limit(10).toPandas().to_dict(orient="records")
            schema_json = df.schema.jsonValue()
            
            return {
                "agent": self.name,
                "count": count,
                "schema": schema_json,
                "sample": sample,
                "pyspark_code": generated_code,
                "output_path": output_path,
            }
            
        except Exception as spark_error:
            # PySpark not available or failed, return generated code only
            return {
                "agent": self.name,
                "pyspark_code": generated_code,
                "output_path": output_path,
                "note": f"PySpark execution not available: {str(spark_error)}",
                "sample_estimation": f"Would process {len(rows)} input rows"
            }


