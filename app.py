from flask import Flask, render_template, request, jsonify, session
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import pickle
import plotly
import plotly.express as px
import json
import sys
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

# Load the trained model
with open('model.pkl', 'rb') as file:
    model = pickle.load(file)

# Load and preprocess data for visualizations
df = pd.read_csv('train.csv')
df.columns = [col.strip() for col in df.columns]
if 'Class/ASD' in df.columns:
    df['Class/ASD'] = pd.to_numeric(df['Class/ASD'], errors='coerce').fillna(0).astype(int)
    print('DEBUG: First 5 Class/ASD values:', df['Class/ASD'].head(), file=sys.stderr)
    print('DEBUG: Sum of Class/ASD:', df['Class/ASD'].sum(), file=sys.stderr)
if 'age' in df.columns:
    df['age'] = pd.to_numeric(df['age'], errors='coerce').fillna(0)

# Calculate global statistics
total_cases = len(df)
autism_cases = int(df['Class/ASD'].sum()) if 'Class/ASD' in df.columns else 0
non_autism_cases = total_cases - autism_cases
accuracy_rate = 95  # This would come from model evaluation
hours_saved = 24  # Estimated time saved per case

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        required_fields = [
            'A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score',
            'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score',
            'age', 'gender', 'jaundice', 'austim', 'used_app_before'
        ]
        
        # Validate all required fields
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}', 'status': 'error'})
        
        # Extract and validate features
        features = []
        for field in required_fields:
            if field in ['age']:
                features.append(float(data[field]))
            elif field in ['gender', 'jaundice', 'austim', 'used_app_before']:
                features.append(1 if data[field] == 'yes' or data[field] == 'm' else 0)
            else:
                features.append(int(data[field]))
        
        features_array = np.array([features])
        
        # Make prediction
        prediction = model.predict(features_array)[0]
        probability = model.predict_proba(features_array)[0][1]
        
        # Log prediction (you might want to store this in a database)
        prediction_log = {
            'timestamp': datetime.now().isoformat(),
            'features': data,
            'prediction': int(prediction),
            'probability': float(probability)
        }
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'status': 'success',
            'confidence': 'high' if probability > 0.8 else 'medium' if probability > 0.6 else 'low'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

@app.route('/get_stats')
def get_stats():
    try:
        # Calculate statistics
        total_cases = len(df)
        autism_cases = int(df['Class/ASD'].sum()) if 'Class/ASD' in df.columns else 0
        non_autism_cases = total_cases - autism_cases
        
        # Gender distribution
        gender_dist = df['gender'].value_counts().to_dict() if 'gender' in df.columns else {}
        
        # Age distribution
        age_dist = df['age'].describe().to_dict() if 'age' in df.columns else {}
        
        # Create visualizations
        fig1 = px.pie(
            df, 
            names='Class/ASD', 
            title='Autism vs Non-Autism Distribution',
            color_discrete_sequence=px.colors.qualitative.Set3
        ) if 'Class/ASD' in df.columns and df['Class/ASD'].nunique() > 0 else None
        
        fig2 = px.histogram(
            df, 
            x='age', 
            color='Class/ASD', 
            title='Age Distribution by Autism Status',
            color_discrete_sequence=px.colors.qualitative.Set3
        ) if 'age' in df.columns and 'Class/ASD' in df.columns and df['age'].notnull().any() else None
        
        # Add more detailed statistics
        stats = {
            'total_cases': total_cases,
            'autism_cases': autism_cases,
            'non_autism_cases': non_autism_cases,
            'gender_distribution': gender_dist,
            'age_statistics': age_dist,
            'accuracy_rate': accuracy_rate,
            'hours_saved': hours_saved,
            'visualizations': {
                'pie_chart': json.dumps(fig1, cls=plotly.utils.PlotlyJSONEncoder) if fig1 else None,
                'histogram': json.dumps(fig2, cls=plotly.utils.PlotlyJSONEncoder) if fig2 else None
            }
        }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/stats')
def api_stats():
    return jsonify({
        'total_cases': total_cases,
        'autism_cases': autism_cases,
        'non_autism_cases': non_autism_cases,
        'accuracy_rate': accuracy_rate,
        'hours_saved': hours_saved
    })

@app.route('/api/theme', methods=['POST'])
def set_theme():
    theme = request.json.get('theme', 'light')
    session['theme'] = theme
    return jsonify({'status': 'success', 'theme': theme})

@app.route('/api/theme', methods=['GET'])
def get_theme():
    return jsonify({'theme': session.get('theme', 'light')})

if __name__ == '__main__':
    app.run(debug=True) 