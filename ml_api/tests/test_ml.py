import pytest
import sys
import os
import json

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from train import generate_demand_data, generate_supplier_data, train_demand_model, train_supplier_model

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_data_generation():
    df_demand = generate_demand_data(10)
    assert len(df_demand) == 10
    assert 'demand_level' in df_demand.columns
    
    df_supplier = generate_supplier_data(10)
    assert len(df_supplier) == 10
    assert 'risk_level' in df_supplier.columns

def test_training_pipeline():
    # Test that training produces model artifacts
    train_demand_model()
    train_supplier_model()
    assert os.path.exists('models/demand_model.joblib')
    assert os.path.exists('models/supplier_risk_model.joblib')

def test_health_endpoint(client):
    # Models should be loaded after training
    from app import demand_model, supplier_model
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'up'

def test_predict_demand(client):
    payload = {
        "category": "Electronics",
        "cost": 50,
        "sellingPrice": 120,
        "additionalCost": 10,
        "rating": 4.8,
        "salesVolume": "High"
    }
    response = client.post('/api/predict/demand', json=payload)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "prediction" in data
    assert "probabilities" in data

def test_predict_supplier_risk(client):
    payload = {
        "rating": 4.5,
        "deliveryTimeDays": 5,
        "returnRate": 2,
        "qualityScore": 90,
        "priceLevel": "Medium"
    }
    response = client.post('/api/predict/supplier-risk', json=payload)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "prediction" in data
    assert "probabilities" in data

def test_analyze_product(client):
    payload = {
        "product": {
            "category": "Electronics",
            "cost": 50,
            "sellingPrice": 120,
            "additionalCost": 10,
            "rating": 4.8,
            "salesVolume": "High"
        },
        "supplier": {
            "rating": 4.5,
            "deliveryTimeDays": 5,
            "returnRate": 2,
            "qualityScore": 90,
            "priceLevel": "Medium"
        }
    }
    response = client.post('/api/analyze/product', json=payload)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "demand_prediction" in data
    assert "supplier_risk_prediction" in data
    assert "overallScore" in data
    assert "recommendation" in data
