from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import json
import os

app = Flask(__name__)
CORS(app) # Allow local frontend to access

# Model paths
DEMAND_MODEL_PATH = 'models/demand_model.joblib'
SUPPLIER_MODEL_PATH = 'models/supplier_risk_model.joblib'
DEMAND_METRICS_PATH = 'models/demand_metrics.json'
SUPPLIER_METRICS_PATH = 'models/supplier_risk_metrics.json'

def load_model(path):
    if os.path.exists(path):
        return joblib.load(path)
    return None

demand_model = load_model(DEMAND_MODEL_PATH)
supplier_model = load_model(SUPPLIER_MODEL_PATH)

def load_metrics(path):
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return {}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "up",
        "demand_model_loaded": demand_model is not None,
        "supplier_model_loaded": supplier_model is not None
    })

@app.route('/api/model/metrics', methods=['GET'])
def model_metrics():
    return jsonify({
        "demand": load_metrics(DEMAND_METRICS_PATH),
        "supplier_risk": load_metrics(SUPPLIER_METRICS_PATH)
    })

@app.route('/api/predict/demand', methods=['POST'])
def predict_demand():
    if not demand_model:
        return jsonify({"error": "Demand model not trained. Run train.py first."}), 503
        
    data = request.json
    try:
        df = pd.DataFrame([data])
        # Ensure correct columns exist, filling missing with defaults
        required_cols = ['category', 'cost', 'sellingPrice', 'additionalCost', 'rating', 'salesVolume']
        for col in required_cols:
            if col not in df.columns:
                df[col] = 0 if col in ['cost', 'sellingPrice', 'additionalCost', 'rating'] else 'Unknown'
                
        pred = demand_model.predict(df)[0]
        probs = demand_model.predict_proba(df)[0]
        classes = demand_model.classes_
        
        return jsonify({
            "prediction": pred,
            "probabilities": {c: float(p) for c, p in zip(classes, probs)}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/predict/supplier-risk', methods=['POST'])
def predict_supplier_risk():
    if not supplier_model:
        return jsonify({"error": "Supplier risk model not trained. Run train.py first."}), 503
        
    data = request.json
    try:
        df = pd.DataFrame([data])
        required_cols = ['rating', 'deliveryTimeDays', 'returnRate', 'qualityScore', 'priceLevel']
        for col in required_cols:
            if col not in df.columns:
                df[col] = 0 if col != 'priceLevel' else 'Unknown'
                
        pred = supplier_model.predict(df)[0]
        probs = supplier_model.predict_proba(df)[0]
        classes = supplier_model.classes_
        
        return jsonify({
            "prediction": pred,
            "probabilities": {c: float(p) for c, p in zip(classes, probs)}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/analyze/product', methods=['POST'])
def analyze_product():
    if not demand_model or not supplier_model:
        return jsonify({"error": "Models not trained. Run train.py first."}), 503
        
    data = request.json
    # Expected data shape: { product: {...}, supplier: {...} } (or flat mapping if preferred, we'll extract)
    # The frontend currently sends flat product data + optional supplierId in /evaluate.
    # But for ML, it might send product fields + supplier fields.
    # Let's extract them.
    product_data = data.get('product', data) # fallback to data itself
    supplier_data = data.get('supplier', None)
    
    # Predict Demand
    try:
        df_prod = pd.DataFrame([product_data])
        required_prod_cols = ['category', 'cost', 'sellingPrice', 'additionalCost', 'rating', 'salesVolume']
        for col in required_prod_cols:
            if col not in df_prod.columns:
                df_prod[col] = 0 if col in ['cost', 'sellingPrice', 'additionalCost', 'rating'] else 'Unknown'
                
        demand_pred = demand_model.predict(df_prod)[0]
        demand_probs = demand_model.predict_proba(df_prod)[0]
        demand_classes = demand_model.classes_
        demand_prob_map = {c: float(p) for c, p in zip(demand_classes, demand_probs)}
    except Exception as e:
        return jsonify({"error": f"Demand prediction failed: {str(e)}"}), 400
        
    # Predict Risk
    risk_pred = "Unknown"
    risk_prob_map = {}
    if supplier_data:
        try:
            df_sup = pd.DataFrame([supplier_data])
            required_sup_cols = ['rating', 'deliveryTimeDays', 'returnRate', 'qualityScore', 'priceLevel']
            for col in required_sup_cols:
                if col not in df_sup.columns:
                    df_sup[col] = 0 if col != 'priceLevel' else 'Unknown'
                    
            risk_pred = supplier_model.predict(df_sup)[0]
            risk_probs = supplier_model.predict_proba(df_sup)[0]
            risk_classes = supplier_model.classes_
            risk_prob_map = {c: float(p) for c, p in zip(risk_classes, risk_probs)}
        except Exception as e:
            return jsonify({"error": f"Supplier risk prediction failed: {str(e)}"}), 400

    # Calculate financial metrics
    cost = float(product_data.get('cost', 0))
    selling_price = float(product_data.get('sellingPrice', 0))
    additional_cost = float(product_data.get('additionalCost', 0))
    profit = selling_price - cost - additional_cost
    margin = (profit / selling_price * 100) if selling_price > 0 else 0
    
    # Rule engine to map predictions to 0-100 scores to stay compatible with frontend UI
    # Mapping Demand: Low -> 30, Medium -> 60, High -> 90
    demand_score_map = {"Low": 30, "Medium": 60, "High": 90}
    demand_score = demand_score_map.get(demand_pred, 50)
    
    # Mapping Supplier Risk: High -> 30, Medium -> 60, Low -> 90
    risk_score_map = {"High": 30, "Medium": 60, "Low": 90, "Unknown": 50}
    supplier_score = risk_score_map.get(risk_pred, 50)
    
    # Pricing score based on margin
    if margin > 40: pricing_score = 95
    elif margin > 30: pricing_score = 85
    elif margin > 20: pricing_score = 70
    elif margin > 10: pricing_score = 50
    else: pricing_score = 30
    
    overall_score = round((demand_score * 0.4) + (pricing_score * 0.4) + (supplier_score * 0.2))
    
    # Recommendation
    if overall_score >= 80 and risk_pred != "High":
        recommendation = "Strongly Recommended"
        status = "APPROVED"
    elif overall_score >= 60:
        recommendation = "Recommended"
        status = "APPROVED"
    else:
        recommendation = "Not Recommended"
        status = "REJECTED"
        
    return jsonify({
        "demand_prediction": demand_pred,
        "demand_probabilities": demand_prob_map,
        "supplier_risk_prediction": risk_pred,
        "supplier_risk_probabilities": risk_prob_map,
        "profit_margin": margin,
        "demandScore": demand_score,
        "pricingScore": pricing_score,
        "supplierScore": supplier_score,
        "overallScore": overall_score,
        "confidenceRating": int(demand_prob_map.get(demand_pred, 0.5) * 100),
        "riskLevel": risk_pred,
        "recommendation": recommendation,
        "status": status,
        "originalInput": product_data
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
