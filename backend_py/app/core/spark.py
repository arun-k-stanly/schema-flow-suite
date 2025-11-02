from __future__ import annotations

from typing import Optional

from pyspark.sql import SparkSession

from .config import settings


_spark_session: Optional[SparkSession] = None


def get_spark_session() -> SparkSession:
    global _spark_session
    if _spark_session is not None:
        return _spark_session

    builder = (
        SparkSession.builder.appName(settings.app_name)
        .config("spark.ui.showConsoleProgress", "false")
        .config("spark.sql.execution.arrow.pyspark.enabled", "true")
    )
    if settings.spark_master:
        builder = builder.master(settings.spark_master)

    _spark_session = builder.getOrCreate()
    return _spark_session


