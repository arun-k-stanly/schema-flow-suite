from __future__ import annotations

from typing import Any

from pyspark.sql import DataFrame

from .base import BaseAgent
from ..core.spark import get_spark_session


class PipelineAgent(BaseAgent):
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        spark = get_spark_session()
        rows = payload.get("rows") or []
        if not isinstance(rows, list):
            return {"error": "rows must be a list of objects"}
        df: DataFrame = spark.createDataFrame(rows)

        ops = payload.get("ops") or []
        for op in ops:
            if not isinstance(op, dict):
                continue
            action = op.get("action")
            if action == "select":
                cols = op.get("columns") or []
                if cols:
                    df = df.select(*cols)
            elif action == "filter_eq":
                # { action: 'filter_eq', column: 'status', value: 'ok' }
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
        }


