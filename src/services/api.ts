import axios from 'axios';
import { Product } from './storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://droplify-fof1.onrender.com/api',
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

export const evaluateProduct = async (inputData: Product) => {
  const res = await api.post('/analysis/evaluate', inputData);
  return res.data;
};

export const getAnalysisResults = async () => {
  const res = await api.get('/analysis/results');
  return res.data;
};

export const getDecisionReport = async () => {
  const res = await api.get('/analysis/report');
  return res.data;
};

export const getWorkflowPlan = async (productId?: string) => {
  if (productId) {
    try {
      const res = await api.get(`/workflows/product/${productId}`);
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