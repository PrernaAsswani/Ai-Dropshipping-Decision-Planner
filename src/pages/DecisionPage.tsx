import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Printer, AlertTriangle, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { getDecisionReport } from '../services/api';
import { motion } from 'motion/react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function DecisionPage() {
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDecisionReport();
        setDecision(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load decision report. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="status-panel mx-auto max-w-md">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Generating Decision Report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-panel mx-auto max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Report</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
        <Link to="/input" className="btn-primary">
          Go to Input Page
        </Link>
      </div>
    );
  }

  const getDecisionBadge = (decision: string) => {
    if (decision === 'Go') return <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm"><CheckCircle className="w-5 h-5" /> GO</div>;
    if (decision === 'No-Go') return <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm"><XCircle className="w-5 h-5" /> NO-GO</div>;
    return <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm"><AlertTriangle className="w-5 h-5" /> {decision.toUpperCase()}</div>;
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet([
        { Metric: 'Recommendation', Value: decision.recommendation },
        { Metric: 'Overall Score', Value: decision.overallScore },
        { Metric: 'Risk Level', Value: decision.riskLevel },
        { Metric: 'Confidence Rating', Value: decision.confidenceRating + '%' },
        { Metric: 'Strengths', Value: decision.strengths.join(', ') },
        { Metric: 'Weaknesses', Value: decision.weaknesses.join(', ') },
        { Metric: 'Next Steps', Value: decision.nextSteps.join(', ') }
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Analysis Report");
      XLSX.writeFile(wb, "Droplify_Report.xlsx");
    } else if (type === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text('Droplify - Decision Report', 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Recommendation: ${decision.recommendation}`, 14, 34);
      doc.text(`Overall Score: ${decision.overallScore}/100`, 14, 42);
      doc.text(`Risk Level: ${decision.riskLevel}`, 14, 50);
      doc.text(`Confidence Rating: ${decision.confidenceRating}%`, 14, 58);

      autoTable(doc, {
        startY: 68,
        head: [['Category', 'Details']],
        body: [
          ['Strengths', decision.strengths.join('\n')],
          ['Weaknesses', decision.weaknesses.join('\n')],
          ['Actionable Next Steps', decision.nextSteps.join('\n')]
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { cellPadding: 6, fontSize: 11, valign: 'middle' },
        columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } }
      });

      doc.save('Droplify_Report.pdf');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="section-title">Final Decision Report</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => handleExport('pdf')}
            className="btn-secondary px-4 py-2"
          >
            <Printer className="w-4 h-4" /> Export PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="btn-primary px-4 py-2"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/70 p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Recommendation</h3>
            <div className="text-3xl font-bold tracking-tight text-slate-950">{decision.recommendation}</div>
          </div>
          {getDecisionBadge(decision.recommendation)}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100">
          <div className="p-6 text-center">
            <div className="text-sm text-slate-500 mb-1">Overall Score</div>
            <div className="text-3xl font-bold text-indigo-600">{decision.overallScore}/100</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm text-slate-500 mb-1">Risk Level</div>
            <div className={`text-3xl font-bold ${decision.riskLevel === 'High' ? 'text-red-600' : decision.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {decision.riskLevel}
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm text-slate-500 mb-1">Confidence Rating</div>
            <div className="text-3xl font-bold text-slate-900">{decision.confidenceRating}%</div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Key Strengths
            </h4>
            <ul className="space-y-2">
              {decision.strengths.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Weaknesses & Risks
            </h4>
            <ul className="space-y-2">
              {decision.weaknesses.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-indigo-50/70 p-6 md:p-8 border-t border-slate-100">
          <h4 className="font-bold text-indigo-900 mb-4">Actionable Next Steps</h4>
          <div className="space-y-3">
            {decision.nextSteps.map((step: string, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-white/90 p-3 rounded-xl border border-indigo-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {i + 1}
                </div>
                <span className="text-indigo-900 font-medium text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
