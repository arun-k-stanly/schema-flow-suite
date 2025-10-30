import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Download, Play } from "lucide-react";

const pysparkCode = `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_date, year, quarter, month
from pyspark.sql.types import *

# Initialize Spark Session
spark = SparkSession.builder \\
    .appName("SalesPromotionETL") \\
    .config("spark.hadoop.fs.azure.account.key", "<KEY>") \\
    .getOrCreate()

# Define Schema
sales_schema = StructType([
    StructField("transaction_id", IntegerType(), False),
    StructField("campaign_id", IntegerType(), True),
    StructField("product_id", IntegerType(), True),
    StructField("customer_id", IntegerType(), True),
    StructField("date", DateType(), True),
    StructField("quantity", IntegerType(), True),
    StructField("revenue", DecimalType(10,2), True)
])

# Read XML from ADLS2
df = spark.read.format("xml") \\
    .option("rowTag", "SalesPromotion") \\
    .load("abfss://container@account.dfs.core.windows.net/input/")

# Transformations
df_transformed = df \\
    .withColumn("date", to_date(col("date"))) \\
    .withColumn("year", year(col("date"))) \\
    .withColumn("quarter", quarter(col("date"))) \\
    .withColumn("month", month(col("date")))

# Data Quality Checks
df_cleaned = df_transformed \\
    .filter(col("revenue").isNotNull()) \\
    .filter(col("quantity") > 0) \\
    .dropDuplicates(["transaction_id"])

# Write to Delta Lake
df_cleaned.write \\
    .format("delta") \\
    .mode("overwrite") \\
    .partitionBy("year", "month") \\
    .save("abfss://container@account.dfs.core.windows.net/output/fact_sales")

print(f"Processed {df_cleaned.count()} records successfully")`;

const configCode = `# Pipeline Configuration
pipeline:
  name: sales_promotion_etl
  version: 1.0
  
source:
  type: xml
  location: abfss://raw@storage.dfs.core.windows.net/sales/
  format: xml
  
target:
  type: delta
  location: abfss://processed@storage.dfs.core.windows.net/sales/
  partition_by: [year, month]
  
transformations:
  - type: date_conversion
    columns: [transaction_date, campaign_start_date]
  - type: deduplication
    key_columns: [transaction_id]
  - type: null_handling
    strategy: drop
    columns: [revenue, quantity]

validation:
  row_count_check: true
  schema_validation: true
  data_quality_threshold: 95`;

export default function BuildPipeline() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Build Data Pipeline</h2>
        <p className="text-muted-foreground">Dynamically generated PySpark code based on your data model structure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pipeline Actions */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Pipeline Actions</CardTitle>
            <CardDescription>Control your ETL workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Deploy Pipeline
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Code
            </Button>
            <Button variant="outline" className="w-full">
              <Code className="w-4 h-4 mr-2" />
              Edit Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Code View */}
        <Card className="lg:col-span-3 shadow-card border-border">
          <CardHeader>
            <CardTitle>Pipeline Code</CardTitle>
            <CardDescription>Auto-generated PySpark job for your data model</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pyspark">
              <TabsList className="mb-4">
                <TabsTrigger value="pyspark">PySpark Code</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pyspark">
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono">
                    <code>{pysparkCode}</code>
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="config">
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono">
                    <code>{configCode}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Source Files</p>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Transformations</p>
            <p className="text-2xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Target Tables</p>
            <p className="text-2xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Partitions</p>
            <p className="text-2xl font-bold">24</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Pipeline Stages</CardTitle>
          <CardDescription>ETL workflow breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { stage: "Extract", desc: "Read XML from ADLS2", time: "~2 min" },
              { stage: "Transform", desc: "Apply schema mapping & validations", time: "~5 min" },
              { stage: "Load", desc: "Write to Delta Lake (partitioned)", time: "~3 min" },
              { stage: "Validate", desc: "Run data quality checks", time: "~1 min" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.stage}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
