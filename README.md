# Autism Prediction using Machine Learning

## Overview

This project aims to predict the likelihood of autism based on various features using machine learning techniques. The dataset is preprocessed, analyzed, and used to train models for classification.

## Table of Contents

- [Project Overview](#overview)
- [Dataset](#dataset)
- [Installation](#installation)
- [Exploratory Data Analysis (EDA)](#eda)
- [Model Training](#model-training)
- [Results](#results)
- [Usage](#usage)
- [Contributors](#contributors)
- [License](#license)

## Dataset

The dataset contains various demographic and behavioral features related to autism assessment. Some preprocessing steps include:

- Handling missing values
- Removing redundant columns
- Fixing class imbalances
- Encoding categorical variables

## Installation

To run this project, install the necessary dependencies using:

```bash
pip install -r requirements.txt
```

## Exploratory Data Analysis (EDA)

Key insights from EDA:

- Identified missing values in categorical columns
- Detected outliers in numerical columns
- Found class imbalances in target and categorical features
- Performed label encoding and feature engineering

## Model Training

The dataset is split into training and testing sets. Different machine learning models are evaluated, including:

- Logistic Regression
- Decision Trees
- Random Forest
- Support Vector Machines (SVM)
- Neural Networks

## Results

The models are evaluated based on accuracy, precision, recall, and F1-score. Class imbalance handling techniques such as oversampling or class weighting are applied to improve performance.

## Usage

To run the model and make predictions:

```python
python autism_prediction.py
```

## Contributors

- JAYA VARDHAN BOGUDA

## License

This project is licensed under the MIT License.

