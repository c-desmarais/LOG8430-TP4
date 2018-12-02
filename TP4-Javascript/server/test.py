from pyspark.mllib.fpm import FPGrowth
from pyspark.context import SparkContext
from pyspark.sql import *
from pyspark.sql.functions import *

def main():
    sc = SparkContext.getOrCreate()
    m_spark = SparkSession.builder.getOrCreate()
    df = m_spark.read.format("com.mongodb.spark.sql.DefaultSource").load()
    cleanData = df.select(explode("items.name"))
    transaction = cleanData.rdd.map(lambda x: list(set(x)))
    model = FPGrowth.train(transaction, minSupport=0.2, numPartitions=10)
    result = model.freqItemsets().collect()
    for it in result:
        print(it)

if __name__ == '__main__':
    main()
