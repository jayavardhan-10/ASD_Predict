import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

# Load the data
print("Loading data...")
df = pd.read_csv('train.csv')

# Preprocess the data
print("Preprocessing data...")
# Convert categorical variables
le = LabelEncoder()
df['gender'] = le.fit_transform(df['gender'])
df['jaundice'] = le.fit_transform(df['jaundice'])
df['austim'] = le.fit_transform(df['austim'])
df['used_app_before'] = le.fit_transform(df['used_app_before'])

# Select features
features = [
    'A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score',
    'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score',
    'age', 'gender', 'jaundice', 'austim', 'used_app_before'
]

X = df[features]
y = df['Class/ASD']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Handle class imbalance using SMOTE
print("Handling class imbalance...")
smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

# Train the model
print("Training model...")
model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)
model.fit(X_train_balanced, y_train_balanced)

# Evaluate the model
print("Evaluating model...")
train_score = model.score(X_train_balanced, y_train_balanced)
test_score = model.score(X_test, y_test)
print(f"Training accuracy: {train_score:.4f}")
print(f"Testing accuracy: {test_score:.4f}")

# Save the model
print("Saving model...")
model.save_model('model.json')

print("Model training and saving completed!") 