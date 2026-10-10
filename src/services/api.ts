import axios from 'axios';
import { Product, Supplier, getSuppliers, api, dedupedGet } from './storage';

const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5001/api';

export const mlApi = axios.create({
  baseURL: ML_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getScoreColor = (score: number): string => {
  if (score >= 75) return '#22c55e'; // green  – Excellent
  if (score >= 50) return '#f97316'; // orange – Moderate
  return '#ef4444';                  // red    – Poor
};

export const getScoreLabel = (score: number): string => {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Moderate';
  return 'Poor';
};

// Caching latest analysis session to maintain compatibility with existing pages
let currentAnalysisSession: any = null;

export const evaluateProduct = async (inputData: Product) => {
  let supplierData: Supplier | null = null;
  if (inputData.supplierId) {
    const suppliers = await getSuppliers();
    supplierData = suppliers.find(s => s.id === inputData.supplierId) || null;
  }

  const payload = {
    product: inputData,
    supplier: supplierData
  };

  const res = await mlApi.post('/analyze/product', payload);
  currentAnalysisSession = res.data;
  
  // Format response for existing components
  return {
    ...currentAnalysisSession,
    productName: inputData.name || 'Unknown Product',
    productScore: currentAnalysisSession.demandScore,
    profitMargin: currentAnalysisSession.profit_margin,
  };
};

export const getAnalysisResults = async () => {
  if (!currentAnalysisSession) return null;
  return {
    ...currentAnalysisSession,
    productName: currentAnalysisSession.originalInput?.name || 'Unknown Product',
    productScore: currentAnalysisSession.demandScore,
    product: currentAnalysisSession.demandScore,
    supplier: currentAnalysisSession.supplierScore,
    pricing: currentAnalysisSession.pricingScore,
    profitMargin: currentAnalysisSession.profit_margin,
  };
};

export const getDecisionReport = async () => {
  if (!currentAnalysisSession) return null;
  
  // Convert Flask response to expected report format
  return {
    recommendation: currentAnalysisSession.recommendation,
    status: currentAnalysisSession.status,
    overallScore: currentAnalysisSession.overallScore,
    riskLevel: currentAnalysisSession.riskLevel,
    confidenceRating: currentAnalysisSession.confidenceRating,
    strengths: [
      `Demand Prediction: ${currentAnalysisSession.demand_prediction}`,
      `Supplier Risk: ${currentAnalysisSession.supplier_risk_prediction}`
    ],
    weaknesses: [],
    nextSteps: [
       currentAnalysisSession.overallScore >= 75 ? "Proceed with product launch" : "Re-evaluate market viability"
    ],
    probabilities: {
      demand: currentAnalysisSession.demand_probabilities,
      supplierRisk: currentAnalysisSession.supplier_risk_probabilities
    }
  };
};

export const getModelMetrics = async () => {
  try {
    const res = await mlApi.get('/model/metrics');
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getWorkflowPlan = async (productId?: string) => {
  if (productId) {
    try {
      const res = await dedupedGet(`/workflows/product/${productId}`);
      if (res.data) {
        return res.data.steps;
      }
    } catch (e) {
      // Not found, will return fresh plan
    }
  }
  
  return [
    { title: "Product Selection", status: "PENDING", progress: 0 },
    { title: "Demand Analysis", status: "PENDING", progress: 0 },
    { title: "Supplier Evaluation", status: "PENDING", progress: 0 },
    { title: "Profitability Analysis", status: "PENDING", progress: 0 },
    { title: "AI Recommendation", status: "PENDING", progress: 0 },
    { title: "Final Decision", status: "PENDING", progress: 0 },
  ];
};

export default api;