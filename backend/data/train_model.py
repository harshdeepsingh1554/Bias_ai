import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv("data.csv")

X = df.drop("label", axis=1)
y = df["label"]

# Categorical + numerical
categorical = ["gender", "education"]
numerical = ["age", "income"]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
    ("num", "passthrough", numerical)
])

# Model pipeline
model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=50, random_state=42))
])

# Train
model.fit(X, y)

# Save
joblib.dump(model, "model.pkl")

print("Model saved as model.pkl")