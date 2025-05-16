import pandas as pd
import json
from collections import defaultdict

# === Step 1: Load JSON lines ===
with open(r"C:\Users\User\OneDrive\Documents\GitHub\patent-analyser-FE\frontend\src\components\results-with-topic.json", "r", encoding="utf-8") as f:
    data = [json.loads(line) for line in f if line.strip()]

df = pd.DataFrame(data)

# === Step 2: Top 15 Topics (Bar Chart) ===
topic_counts = df['topic_list'].explode().value_counts().reset_index()
topic_counts.columns = ['Topic', 'Count']
topic_counts_top15 = topic_counts.head(15)
topic_counts_top15.to_json("topics_chart_data.json", orient="records", indent=2)

# === Step 3: TRIZ Principle Pie Chart ===
principle_counts = defaultdict(int)
for row in df['parsed_result']:
    parsed = json.loads(row)
    for code in parsed:
        principle_counts[parsed[code]] += 1

principle_df = pd.DataFrame(principle_counts.items(), columns=['TRIZ Principle', 'Count'])
principle_df = principle_df.sort_values(by="Count", ascending=False)

# Group into top 8 + Others
top_n = 8
top_triz = principle_df.head(top_n)
others = pd.DataFrame([{
    'TRIZ Principle': 'Others',
    'Count': principle_df['Count'][top_n:].sum()
}])
pie_data = pd.concat([top_triz, others], ignore_index=True)
pie_data.to_json("triz_pie_data.json", orient="records", indent=2)

# === Step 4: Radar Chart (Classification Confidence) ===
import pandas as pd
import json


# Count number of TRIZ principles per patent
claim_complexity = [len(set(json.loads(row).keys())) for row in df['parsed_result']]

# Count frequency of each unique count
complexity_df = pd.Series(claim_complexity).value_counts().reset_index()
complexity_df.columns = ['num_principles', 'count']
complexity_df = complexity_df.sort_values(by='num_principles')

# Save to JSON
complexity_df.to_json("claim_complexity_data.json", orient="records", indent=2)

print("✅ All chart data generated successfully 1.")
