import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { evaluateProduct, getDecisionReport } from '../services/api';
import { Loader2, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { getSuppliers, calculateSupplierScore, Supplier, logActivity } from '../services/storage';
import { useToast } from '../context/ToastContext';

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  let colorClass = 'bg-red-500';
  if (score >= 75) colorClass = 'bg-emerald-500';
  else if (score >= 50) colorClass = 'bg-amber-500';

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-950">{score}/100</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden ring-1 ring-slate-200/70">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
};

const LOADING_MESSAGES = [
  "Analyzing product data...",
  "Evaluating demand...",
  "Analyzing supplier reliability...",
  "Calculating profitability...",
  "Generating recommendation..."
];

export default function AnalysisPage() {
  const [results, setResults] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { inputData } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Cycle through loading messages
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
      }, 500); // Faster cycle to match 2.5s load
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!inputData) {
          setError('No product selected for analysis.');
          setLoading(false);
          return;
        }

        const data = await evaluateProduct(inputData);
        setResults(data);
        
        const reportData = await getDecisionReport();
        setReport(reportData);

        showToast('Analysis completed successfully');
        logActivity(`AI analysis completed for ${data.productName}`);
        
        // Load suppliers and sort them to show the connected supplier first
        let allSuppliers = await getSuppliers();
        allSuppliers.sort((a, b) => {
          if (a.id === inputData.supplierId) return -1;
          if (b.id === inputData.supplierId) return 1;
          return calculateSupplierScore(b).reliability - calculateSupplierScore(a).reliability;
        });
        
        setSuppliers(allSuppliers);

      } catch (err: any) {
        console.error(err);
        setError('Failed to load analysis results. Please select a product first.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [inputData, showToast]);

  if (loading) {
    return (
      <div className="status-panel mx-auto max-w-md my-20">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingMessageIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-600 font-medium text-lg"
            >
              {LOADING_MESSAGES[loadingMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (error || !results || !report) {
    return (
      <div className="status-panel mx-auto max-w-lg my-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Analysis Unavailable</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
        <Link to="/products" className="btn-primary">
          Go to Products
        </Link>
      </div>
    );
  }

  const scores = {
    product: results.productScore ?? 0,
    supplier: results.supplierScore ?? 0,
    pricing: results.pricingScore ?? 0,
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Analysis Report: ${results.productName}`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Recommendation: ${report.recommendation}`, 14, 32);
    doc.text(`Overall Score: ${report.overallScore}/100`, 14, 40);
    doc.text(`Confidence: ${report.confidenceRating}%`, 14, 48);

    doc.text('Performance Metrics:', 14, 60);
    autoTable(doc, {
      startY: 65,
      head: [['Metric', 'Score']],
      body: [
        ['Demand Score', scores.product],
        ['Profitability Score', scores.pricing],
        ['Supplier Score', scores.supplier],
        ['Profit Margin', `${results.profitMargin}%`],
        ['Overall Risk', results.riskLevel],
      ],
    });

    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('AI Summary (Strengths):', 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Strength']],
      body: report.strengths.map((s: string) => [s]),
    });

    const currentY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.text('AI Summary (Weaknesses):', 14, currentY2);
    autoTable(doc, {
      startY: currentY2 + 5,
      head: [['Weakness']],
      body: report.weaknesses.map((s: string) => [s]),
    });

    doc.save(`${results.productName.replace(/\s+/g, '_')}_Analysis.pdf`);
    showToast('PDF downloaded successfully', 'info');
  };

  const exportExcel = () => {
    const wsData = [
      ['Product Name', results.productName],
      ['Recommendation', report.recommendation],
      ['Overall Score', report.overallScore],
      ['Confidence Rating', `${report.confidenceRating}%`],
      ['', ''],
      ['Metric', 'Score'],
      ['Demand Score', scores.product],
      ['Profitability Score', scores.pricing],
      ['Supplier Score', scores.supplier],
      ['Profit Margin', `${results.profitMargin}%`],
      ['Overall Risk', results.riskLevel],
      ['', ''],
      ['Strengths', ''],
      ...report.strengths.map((s: string) => [s, '']),
      ['', ''],
      ['Weaknesses', ''],
      ...report.weaknesses.map((s: string) => [s, ''])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analysis');
    XLSX.writeFile(wb, `${results.productName.replace(/\s+/g, '_')}_Analysis.xlsx`);
    showToast('Excel downloaded successfully', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="section-title mb-1">Product Analysis</h2>
          <p className="text-slate-500 text-lg font-medium text-indigo-900">{results.productName}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 mr-4 border-r border-slate-200 pr-4">
            <button onClick={exportPDF} className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button onClick={exportExcel} className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Recommendation</p>
            <p className={`font-bold text-lg ${
              report.status === 'APPROVED' && report.overallScore >= 90 ? 'text-emerald-600' :
              report.status === 'APPROVED' ? 'text-indigo-600' :
              report.status === 'NEEDS_REVIEW' ? 'text-amber-500' : 'text-red-600'
            }`}>
              {report.recommendation.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-6 md:p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950 mb-6 border-b border-slate-100 pb-3">Performance Scores</h3>
            <ScoreBar label="Demand Score" score={scores.product} />
            <ScoreBar label="Profitability Score" score={scores.pricing} />
            <ScoreBar label="Supplier Score" score={scores.supplier} />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
              <p className={`font-bold text-lg ${results.profitMargin > 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {results.profitMargin}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Overall Risk</p>
              <p className={`font-bold text-lg ${results.riskLevel === 'Low' ? 'text-emerald-600' : results.riskLevel === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>
                {results.riskLevel}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="surface-card p-6 md:p-8"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">AI Summary</h3>
            <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Confidence: {report.confidenceRating}%
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide text-xs">Reasons</h4>
            
            {report.strengths.map((strength: string, i: number) => (
              <div key={`s-${i}`} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-slate-700">{strength}</p>
              </div>
            ))}
            
            {report.weaknesses.map((weakness: string, i: number) => (
              <div key={`w-${i}`} className="flex items-start gap-2 mt-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-slate-700">{weakness}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md ${
              report.overallScore >= 75 ? 'bg-indigo-600 shadow-indigo-600/30' :
              report.overallScore >= 55 ? 'bg-amber-500 shadow-amber-500/30' : 'bg-red-500 shadow-red-500/30'
            }`}>
              Overall Score: {report.overallScore}/100
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4">Supplier Evaluation</h3>
        <p className="text-sm text-slate-500 mb-6">Evaluating the supplier currently attached to this product, and alternatives.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {suppliers.slice(0, 3).map((supplier, idx) => {
            const { reliability, risk } = calculateSupplierScore(supplier);
            const isBest = idx === 0 && supplier.id === inputData.supplierId; 
            
            return (
              <div key={supplier.id} className={`p-5 rounded-2xl border-2 transition-all ${isBest ? 'border-emerald-500 bg-emerald-50/30 shadow-md shadow-emerald-500/10' : 'border-slate-100 bg-white'}`}>
                {isBest ? (
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Current & Best
                  </div>
                ) : (
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    Alternative
                  </div>
                )}
                <h4 className="font-bold text-slate-900 mb-2">{supplier.name}</h4>
                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reliability</span>
                    <span className="font-semibold text-slate-900">{reliability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rating</span>
                    <span className="font-semibold text-slate-900">★ {supplier.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery</span>
                    <span className="font-semibold text-slate-900">{supplier.deliveryTimeDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Return Rate</span>
                    <span className="font-semibold text-slate-900">{supplier.returnRate}%</span>
                  </div>
                </div>
                
                <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg inline-block ${
                  risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : 
                  risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {risk} Risk
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
      
      <div className="flex justify-between items-center border-t border-slate-200 pt-8 mt-4">
        <Link to="/charts" className="btn-secondary">
          View Analytics
        </Link>
        <button 
          onClick={() => {
            navigate('/workflow');
          }}
          className="btn-primary flex items-center gap-2"
        >
          Start Workflow <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
