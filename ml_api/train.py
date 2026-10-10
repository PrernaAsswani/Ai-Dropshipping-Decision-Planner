import pandas as pd
import numpy as np
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.dummy import DummyClassifier
import os

os.makedirs('models', exist_ok=True)
os.makedirs('data', exist_ok=True)

np.random.seed(42)

def generate_demand_data(n=1000):
    categories = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports']
    sales_volumes = ['Low', 'Medium', 'High']
    
    data = []
    for _ in range(n):
        cat = np.random.choice(categories)
        cost = np.random.uniform(5, 100)
        margin_pct = np.random.uniform(0.1, 1.0)
        selling_price = cost * (1 + margin_pct)
        additional_cost = np.random.uniform(1, 15)
        rating = np.random.uniform(1.0, 5.0)
        sales_vol = np.random.choice(sales_volumes)
        
        # Determine demand label (synthetic logic to make it learnable)
        score = rating * 10
        if margin_pct > 0.4: score -= 5
        if sales_vol == 'High': score += 20
        elif sales_vol == 'Low': score -= 10
        if cat == 'Electronics': score += 5
        
        score += np.random.normal(0, 5) # add noise
        
        if score > 60:
            target = 'High'
        elif score > 40:
            target = 'Medium'
        else:
            target = 'Low'
            
        data.append([cat, cost, selling_price, additional_cost, rating, sales_vol, target])
        
    df = pd.DataFrame(data, columns=['category', 'cost', 'sellingPrice', 'additionalCost', 'rating', 'salesVolume', 'demand_level'])
    df.to_csv('data/synthetic_demand.csv', index=False)
    return df

def generate_supplier_data(n=1000):
    price_levels = ['Low', 'Medium', 'High']
    
    data = []
    for _ in range(n):
        rating = np.random.uniform(1.0, 5.0)
        delivery_time = np.random.uniform(1, 30)
        return_rate = np.random.uniform(0, 20)
        quality_score = np.random.uniform(20, 100)
        price_level = np.random.choice(price_levels)
        
        # Synthetic logic for risk
        risk_score = delivery_time * 2 + return_rate * 3 - quality_score * 0.5 - rating * 5
        risk_score += np.random.normal(0, 10)
        
        if risk_score > 40:
            target = 'High'
        elif risk_score > 0:
            target = 'Medium'
        else:
            target = 'Low'
            
        data.append([rating, delivery_time, return_rate, quality_score, price_level, target])
        
    df = pd.DataFrame(data, columns=['rating', 'deliveryTimeDays', 'returnRate', 'qualityScore', 'priceLevel', 'risk_level'])
    df.to_csv('data/synthetic_supplier.csv', index=False)
    return df

def train_demand_model():
    print("Training Demand Model (Synthetic Data)...")
    df = generate_demand_data()
    X = df.drop('demand_level', axis=1)
    y = df['demand_level']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    numeric_features = ['cost', 'sellingPrice', 'additionalCost', 'rating']
    categorical_features = ['category', 'salesVolume']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
        
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(random_state=42))])
                          
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    
    # Baseline
    dummy = DummyClassifier(strategy="stratified", random_state=42)
    dummy.fit(X_train, y_train)
    dummy_pred = dummy.predict(X_test)
    
    metrics = {
        'model_version': '1.0',
        'dataset': 'Synthetic',
        'accuracy': accuracy_score(y_test, y_pred),
        'precision_macro': precision_score(y_test, y_pred, average='macro'),
        'recall_macro': recall_score(y_test, y_pred, average='macro'),
        'f1_macro': f1_score(y_test, y_pred, average='macro'),
        'baseline_accuracy': accuracy_score(y_test, dummy_pred),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'classes': clf.classes_.tolist()
    }
    
    joblib.dump(clf, 'models/demand_model.joblib')
    with open('models/demand_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
    print("Demand model trained and saved.")
    
def train_supplier_model():
    print("Training Supplier Risk Model (Synthetic Data)...")
    df = generate_supplier_data()
    X = df.drop('risk_level', axis=1)
    y = df['risk_level']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    numeric_features = ['rating', 'deliveryTimeDays', 'returnRate', 'qualityScore']
    categorical_features = ['priceLevel']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
        
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(random_state=42))])
                          
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    
    # Baseline
    dummy = DummyClassifier(strategy="stratified", random_state=42)
    dummy.fit(X_train, y_train)
    dummy_pred = dummy.predict(X_test)
    
    metrics = {
        'model_version': '1.0',
        'dataset': 'Synthetic',
        'accuracy': accuracy_score(y_test, y_pred),
        'precision_macro': precision_score(y_test, y_pred, average='macro'),
        'recall_macro': recall_score(y_test, y_pred, average='macro'),
        'f1_macro': f1_score(y_test, y_pred, average='macro'),
        'baseline_accuracy': accuracy_score(y_test, dummy_pred),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'classes': clf.classes_.tolist()
    }
    
    joblib.dump(clf, 'models/supplier_risk_model.joblib')
    with open('models/supplier_risk_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
    print("Supplier Risk model trained and saved.")

if __name__ == '__main__':
    train_demand_model()
    train_supplier_model()
