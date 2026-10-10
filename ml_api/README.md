# ML API for Droplify

This directory contains the actual trained Machine Learning pipelines integrating with the Droplify frontend, replacing the heuristic and LLM logic.

## Models
1. **Demand Classification Model (Random Forest)**: Predicts if product demand is `Low`, `Medium`, or `High`.
2. **Supplier Risk Classification Model (Random Forest)**: Predicts if a supplier's risk profile is `Low`, `Medium`, or `High`.

Due to the absence of a real-world dataset, a reproducible script generates a **synthetic dataset** mimicking the exact frontend schema.

## Setup Instructions

### 1. Requirements
Ensure you have Python 3.9+ installed.

### 2. Installation
Navigate to this `ml_api` folder and create a virtual environment:
```bash
cd ml_api
python -m venv .venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (Mac/Linux)
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Generate Data and Train Models
Run the training script. This generates synthetic CSVs in `data/` and saves trained Scikit-Learn Pipelines (`.joblib`) and metrics (`.json`) into `models/`.
```bash
python train.py
```

### 4. Run the Flask API
Start the Flask server on port 5001.
```bash
python app.py
```

### 5. Test
Run the unit tests using `pytest`:
```bash
pytest tests/
```

### 6. Start the Frontend
In another terminal, run the existing frontend. Make sure the frontend `.env` contains `VITE_ML_API_URL="http://localhost:5001/api"`.
```bash
npm run dev
```

The frontend will now point to this ML service for product analysis, and the `AnalysisPage` will render actual classification probabilities and ML evaluation metrics.
