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

import axios from 'axios';

router.post('/evaluate', async (req, res) => {
  try {
    const inputData = req.body;
    let linkedSupplier = null;
    if (inputData.supplierId) {
      linkedSupplier = await Supplier.findById(inputData.supplierId);
    }

    const profitCalc = calculateProfit(inputData);
    let analysisResult: any = null;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = `You are an expert e-commerce and dropshipping analyst.
Evaluate this product for dropshipping viability:
Product: ${inputData.name}
Category: ${inputData.category}
Cost: $${inputData.cost}
Selling Price: $${inputData.sellingPrice}
Additional Costs: $${inputData.additionalCost}
Customer Rating: ${inputData.rating}/5
Sales Volume: ${inputData.salesVolume}

Supplier Info:
Name: ${linkedSupplier ? linkedSupplier.name : 'Unknown'}
Rating: ${linkedSupplier ? linkedSupplier.rating : 'N/A'}
Delivery Time: ${linkedSupplier ? linkedSupplier.deliveryTimeDays : 'N/A'} days
Return Rate: ${linkedSupplier ? linkedSupplier.returnRate : 'N/A'}%
Quality Score: ${linkedSupplier ? linkedSupplier.qualityScore : 'N/A'}/100

Respond strictly in valid JSON format with the following keys (all numbers 0-100 except riskLevel which is Low/Medium/High):
{
  "demandScore": <number>,
  "pricingScore": <number>,
  "supplierScore": <number>,
  "overallScore": <number>,
  "confidenceRating": <number>,
  "riskLevel": "<Low|Medium|High>"
}`;

        const openRouterResponse = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo', // You can change this to any free/paid OpenRouter model
            messages: [{ role: 'user', content: prompt }]
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
              'X-Title': 'Droplify',
              'Content-Type': 'application/json'
            }
          }
        );

        const text = openRouterResponse.data.choices[0].message.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          analysisResult = {
            demandScore: parsed.demandScore,
            pricingScore: parsed.pricingScore,
            supplierScore: parsed.supplierScore,
            overallScore: parsed.overallScore,
            confidenceRating: parsed.confidenceRating,
            riskLevel: parsed.riskLevel,
          };
        }
      } catch (aiError) {
        console.error("OpenRouter AI Generation failed, falling back to heuristic:", aiError);
      }
    }

    // Fallback heuristic if AI fails or is not configured
    if (!analysisResult) {
      let demandScore = (inputData.rating / 5) * 80;
      if (inputData.salesVolume === 'High') demandScore += 20;
      else if (inputData.salesVolume === 'Medium') demandScore += 10;
      demandScore = Math.min(100, Math.max(0, demandScore));

      let pricingScore = 0;
      if (profitCalc.margin > 40) pricingScore = 95;
      else if (profitCalc.margin > 30) pricingScore = 85;
      else if (profitCalc.margin > 20) pricingScore = 70;
      else if (profitCalc.margin > 10) pricingScore = 50;
      else pricingScore = 30;

      let supplierScore = 50; 
      let riskLevel = 'Medium';
      
      if (linkedSupplier) {
        const supCalc = calculateSupplierScore(linkedSupplier);
        supplierScore = supCalc.reliability;
        riskLevel = supCalc.risk;
      }

      analysisResult = {
        demandScore: Math.round(demandScore),
        pricingScore: Math.round(pricingScore),
        supplierScore: Math.round(supplierScore),
        overallScore: Math.round((demandScore * 0.4) + (pricingScore * 0.4) + (supplierScore * 0.2)),
        confidenceRating: Math.round(75 + (Math.random() * 20)),
        riskLevel
      };
    }

    currentAnalysisSession = {
      productId: inputData.id,
      productName: inputData.name || 'Unknown Product',
      productScore: analysisResult.demandScore,
      supplierScore: analysisResult.supplierScore,
      pricingScore: analysisResult.pricingScore,
      demandScore: analysisResult.demandScore,
      profitMargin: Math.round(profitCalc.margin),
      overallScore: analysisResult.overallScore,
      confidenceRating: analysisResult.confidenceRating,
      riskLevel: analysisResult.riskLevel,
      originalInput: inputData,
      supplier: linkedSupplier
    };
    
    res.json(currentAnalysisSession);
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
