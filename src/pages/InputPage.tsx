import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { evaluateProduct } from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function InputPage() {
  const navigate = useNavigate();
  const { setInputData, setAnalysisResults } = useData(); // We still use context to store data if needed, but API drives the flow
  const [formData, setFormData] = useState({
    niche: '',
    budget: '',
    marketplace: 'Amazon',
    riskTolerance: 'Medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.niche.trim()) newErrors.niche = 'Niche is required';
    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
    } else if (Number(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);
    
    try {
      // Prepare payload
      const payload = {
        ...formData,
        budget: Number(formData.budget)
      };

      // 1. Call API
      const response = await evaluateProduct(payload);
      
      // 2. Update Context (optional, if you want to cache it)
      setInputData(payload);
      // If the POST returns immediate results, we could set them here:
      // setAnalysisResults(response);

      // 3. Navigate to results
      navigate('/analysis');
    } catch (error: any) {
      console.error(error);
      setApiError(error.message || 'Failed to connect to the server. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="surface-card p-6 md:p-8"
      >
        <h2 className="section-title mb-2">Input Analysis Parameters</h2>
        <p className="muted-text mb-8">Set the market context for the next dropshipping decision run.</p>
        
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-100 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Market Niche / Product Category
            </label>
            <input
              type="text"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              className={`field-control ${
                errors.niche ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : ''
              }`}
              placeholder="e.g. Home Office Furniture"
            />
            {errors.niche && <p className="mt-1 text-sm text-red-600">{errors.niche}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Budget (INR)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className={`field-control ${
                errors.budget ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : ''
              }`}
              placeholder="5000"
            />
            {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="marketplace" className="block text-sm font-medium text-slate-700 mb-1">
                Target Marketplace
              </label>
              <select
                id="marketplace"
                value={formData.marketplace}
                onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                className="field-control"
              >
                <option value="Amazon">Amazon</option>
                <option value="Shopify">Shopify</option>
                <option value="eBay">eBay</option>
                <option value="Walmart">Walmart</option>
              </select>
            </div>

            <div>
              <label htmlFor="riskTolerance" className="block text-sm font-medium text-slate-700 mb-1">
                Risk Tolerance
              </label>
              <select
                id="riskTolerance"
                value={formData.riskTolerance}
                onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                className="field-control"
              >
                <option value="Low">Low (Conservative)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="High">High (Aggressive)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
