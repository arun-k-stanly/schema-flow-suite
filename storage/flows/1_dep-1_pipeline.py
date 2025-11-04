from pyspark.sql import SparkSession
from pyspark.sql.functions import col

spark = SparkSession.builder.appName("SchemaFlowETL").getOrCreate()

input_df = spark.read.json('input.json')

fact_df = input_df.select(col('title').alias('title'), col('note').alias('note'), col('quantity').alias('quantity'), col('price').alias('price'))

fact_df.write.mode('overwrite').parquet('item')

print('ETL completed')