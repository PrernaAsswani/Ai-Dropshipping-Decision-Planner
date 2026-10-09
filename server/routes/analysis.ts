import express from 'express';
import Product from '../models/Product';
import Supplier from '../models/Supplier';

const router = express.Router();

// Helper functions translated from frontend
const calculateProfit = (product: any) => {
  const profit = product.sellingPrice - product.cost - product.additionalCost;
  const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;
  return { profit, margin };
};

const calculateSupplierScore = (supplier: any) => {
  const ratingScore = (supplier.rating / 5) * 100;
  const deliveryScore = Math.max(0, 100 - (supplier.deliveryTimeDays * 5)); 
  const qualityScore = supplier.qualityScore;
  const reliability = (ratingScore * 0.4) + (qualityScore * 0.3) + (deliveryScore * 0.3);
  
  let risk = 'Low';
  if (reliability < 70) risk = 'High';
  else if (reliability < 85) risk = 'Medium';

  return { reliability: Math.round(reliability), risk };
};

let currentAnalysisSession: any = null;

router.post('/evaluate', async (req, res) => {
  try {
    const inputData = req.body;
    
    // 1. Demand Score
    let demandScore = (inputData.rating / 5) * 80;
    if (inputData.salesVolume === 'High') demandScore += 20;
    else if (inputData.salesVolume === 'Medium') demandScore += 10;
    demandScore = Math.min(100, Math.max(0, demandScore));

    // 2. Profitability Score
    const profitCalc = calculateProfit(inputData);
    const profitMargin = profitCalc.margin;
    let pricingScore = 0;
    if (profitMargin > 40) pricingScore = 95;
    else if (profitMargin > 30) pricingScore = 85;
    else if (profitMargin > 20) pricingScore = 70;
    else if (profitMargin > 10) pricingScore = 50;
    else pricingScore = 30;

    // 3. Supplier Score
    let supplierScore = 50; 
    let riskLevel = 'Medium';
    let supplierReliability = 50;
    let linkedSupplier = null;
    
    if (inputData.supplierId) {
      linkedSupplier = await Supplier.findById(inputData.supplierId);
      if (linkedSupplier) {
        const supCalc = calculateSupplierScore(linkedSupplier);
        supplierReliability = supCalc.reliability;
        riskLevel = supCalc.risk;
        supplierScore = supplierReliability;
      }
    }

    const overallScore = Math.round((demandScore * 0.4) + (pricingScore * 0.4) + (supplierScore * 0.2));

    currentAnalysisSession = {
      productId: inputData.id,
      productName: inputData.name || 'Unknown Product',
      productScore: Math.round(demandScore),
      supplierScore: Math.round(supplierScore),
      pricingScore: Math.round(pricingScore),
      demandScore: Math.round(demandScore),
      profitMargin: Math.round(profitMargin),
      overallScore,
      confidenceRating: Math.round(75 + (Math.random() * 20)),
      riskLevel,
      originalInput: inputData,
      supplier: linkedSupplier
    };
    
    setTimeout(() => {
      res.json(currentAnalysisSession);
    }, 1500); // simulate delay

  } catch (error) {
    res.status(500).json({ message: 'Analysis failed' });
  }
});

router.get('/results', (req, res) => {
  if (!currentAnalysisSession) return res.status(404).json({ message: 'No active session' });
  res.json({
    ...currentAnalysisSession,
    product: currentAnalysisSession.productScore,
    supplier: currentAnalysisSession.supplierScore,
    pricing: currentAnalysisSession.pricingScore,
  });
});

router.get('/report', (req, res) => {
  if (!currentAnalysisSession) return res.status(404).json({ message: 'No active session' });
  
  const score = currentAnalysisSession.overallScore;
  let recommendation = 'Needs Review';
  let status = 'NEEDS_REVIEW';
  
  if (score >= 90) {
    recommendation = 'Strongly Recommended';
    status = 'APPROVED';
  } else if (score >= 75) {
    recommendation = 'Recommended';
    status = 'APPROVED';
  } else if (score < 55) {
    recommendation = 'Not Recommended';
    status = 'REJECTED';
  }

  const strengths = [];
  const weaknesses = [];

  if (currentAnalysisSession.originalInput.salesVolume === 'High') strengths.push('Strong sales performance');
  else if (currentAnalysisSession.originalInput.salesVolume === 'Low') weaknesses.push('Low sales volume');

  if (currentAnalysisSession.originalInput.rating >= 4.5) strengths.push('High customer rating');
  else if (currentAnalysisSession.originalInput.rating < 3.5) weaknesses.push('Low customer rating');

  if (currentAnalysisSession.profitMargin > 30) strengths.push(`Healthy profit margin (${currentAnalysisSession.profitMargin.toFixed(1)}%)`);
  else weaknesses.push(`Low profit margin (${currentAnalysisSession.profitMargin.toFixed(1)}%)`);

  if (currentAnalysisSession.supplierScore >= 85) strengths.push('Reliable supplier');
  else if (currentAnalysisSession.supplierScore < 70) weaknesses.push('Low supplier reliability');

  if (currentAnalysisSession.supplier && currentAnalysisSession.supplier.returnRate > 5) weaknesses.push('High return rate from supplier');
  else if (currentAnalysisSession.supplier && currentAnalysisSession.supplier.returnRate < 2.5) strengths.push('Low return rate');

  res.json({
    recommendation,
    status,
    overallScore: score,
    riskLevel: currentAnalysisSession.riskLevel,
    confidenceRating: currentAnalysisSession.confidenceRating,
    strengths,
    weaknesses,
    nextSteps: [
      score >= 75 ? "Proceed with product launch" : "Re-evaluate market viability",
      currentAnalysisSession.supplierScore < 80 ? "Negotiate supplier terms or find alternative" : "Establish long-term supplier contract",
      currentAnalysisSession.profitMargin < 20 ? "Optimise pricing strategy" : "Scale marketing spend"
    ]
  });
});

export default router;
