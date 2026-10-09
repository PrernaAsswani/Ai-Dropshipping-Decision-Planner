import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';
import { getAnalysisResults } from '../services/api';
import { getProducts, getSuppliers, calculateProfit, calculateSupplierScore } from '../services/storage';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function ChartsPage() {
  const [results, setResults] = useState<any>(null);
  const [averages, setAverages] = useState({ product: 0, supplier: 0, pricing: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlySales, setMonthlySales] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calculate real averages from demo data
        const products = await getProducts();
        const suppliers = await getSuppliers();

        let avgDemand = 0;
        let avgProfitScore = 0;
        
        products.forEach(p => {
          let demand = (p.rating / 5) * 80;
          if (p.salesVolume === 'High') demand += 20;
          if (p.salesVolume === 'Medium') demand += 10;
          avgDemand += Math.min(100, Math.max(0, demand));

          const { margin } = calculateProfit(p);
          if (margin > 40) avgProfitScore += 95;
          else if (margin > 30) avgProfitScore += 85;
          else if (margin > 20) avgProfitScore += 70;
          else if (margin > 10) avgProfitScore += 50;
          else avgProfitScore += 30;
        });

        let avgSupplier = 0;
        suppliers.forEach(s => {
          avgSupplier += calculateSupplierScore(s).reliability;
        });

        const pCount = products.length || 1;
        const sCount = suppliers.length || 1;

        setAverages({
          product: Math.round(avgDemand / pCount),
          pricing: Math.round(avgProfitScore / pCount),
          supplier: Math.round(avgSupplier / sCount)
        });

        // Generate realistic sales data
        // Base it on the total profit margin roughly
        const baseSales = pCount * 12000;
        const sales = [
          baseSales * 0.8,
          baseSales * 0.9,
          baseSales * 0.95,
          baseSales * 1.1,
          baseSales * 1.25,
          baseSales * 1.4
        ];
        setMonthlySales(sales);

        try {
          const data = await getAnalysisResults();
          setResults(data);
        } catch (err) {
          // It's okay if there is no active analysis session, we will just not show the current analysis line
          setResults(null);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load chart data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="status-panel mx-auto max-w-md my-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-panel mx-auto max-w-lg my-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Data</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
        <Link to="/products" className="btn-primary">
          Go to Products
        </Link>
      </div>
    );
  }

  const radarData = {
    labels: ['Demand Score', 'Supplier Score', 'Profitability Score'],
    datasets: [
      {
        label: 'Market Average (Your Catalog)',
        data: [averages.product, averages.supplier, averages.pricing],
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: 'rgba(148, 163, 184, 1)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 3,
        pointBackgroundColor: 'rgba(148, 163, 184, 1)',
      }
    ]
  };

  if (results) {
    radarData.datasets.unshift({
      label: `Current Analysis: ${results.productName}`,
      data: [results.productScore, results.supplierScore, results.pricingScore],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
      borderDash: []
    });
  }

  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(100, 116, 139, 0.14)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        grid: {
          color: 'rgba(100, 116, 139, 0.14)',
        },
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          color: '#64748b',
        },
        pointLabels: {
          color: '#334155',
          font: {
            size: 13,
            weight: 600 as const,
          },
        }
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          color: '#475569',
          usePointStyle: true,
          padding: 18,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const lineData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Monthly Sales Revenue (₹)',
        data: monthlySales,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(16, 185, 129, 1)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#475569',
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '₹' + Math.round(context.parsed.y).toLocaleString('en-IN');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
        ticks: {
          color: '#64748b',
          callback: function(value: any) {
            return '₹' + (value / 1000) + 'k';
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h2 className="section-title mb-8">Business Analytics</h2>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-5 md:p-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Comparison</h3>
          <div className="h-[350px] w-full flex items-center justify-center">
            <Radar data={radarData} options={radarOptions} />
          </div>
          <div className="mt-6 text-center text-slate-500 text-sm">
            {results 
              ? 'Comparing your active analysis scores against your catalog averages.' 
              : 'Showing your catalog average performance scores.'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card p-5 md:p-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Sales Trend (H1 2026)</h3>
          <div className="h-[350px] w-full flex items-center justify-center">
            <Line data={lineData} options={lineOptions} />
          </div>
          <div className="mt-6 text-center text-slate-500 text-sm">
            Simulated revenue trends based on current catalog health.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
