import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, Loader2, AlertCircle, Play, ArrowRight, Save } from 'lucide-react';
import { getWorkflowPlan } from '../services/api';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { logActivity, saveWorkflowForProduct, WorkflowStep } from '../services/storage';
import { useData } from '../context/DataContext';

export default function WorkflowPage() {
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { inputData } = useData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!inputData) {
          setError('Please select a product to manage its workflow.');
          setLoading(false);
          return;
        }

        const data = await getWorkflowPlan(inputData.id) as WorkflowStep[];
        setWorkflow(data);
        setIsComplete(data.every(s => s.status === 'COMPLETED'));
      } catch (err: any) {
        console.error(err);
        setError('Failed to load workflow plan.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [inputData]);

  const startWorkflow = () => {
    if (isProcessing || isComplete || !inputData) return;
    setIsProcessing(true);
    showToast('Starting workflow...', 'info');
    logActivity(`Started workflow for ${inputData.name}`);

    // Find the first non-completed step
    let currentStepIndex = workflow.findIndex(s => s.status !== 'COMPLETED');
    if (currentStepIndex === -1) currentStepIndex = 0;

    const processStep = async () => {
      if (currentStepIndex >= workflow.length) {
        setIsProcessing(false);
        setIsComplete(true);
        // Save final state
        await saveWorkflowForProduct(inputData.id, workflow.map(s => ({...s, status: 'COMPLETED', progress: 100})), 'Completed');
        showToast('Workflow completed successfully!');
        logActivity(`Workflow completed for ${inputData.name}`);
        return;
      }

      // Update current step to IN_PROGRESS
      setWorkflow(prev => {
        const updated = prev.map((step, idx) => {
          if (idx === currentStepIndex) return { ...step, status: 'IN_PROGRESS' as const, progress: 50 };
          return step;
        });
        saveWorkflowForProduct(inputData.id, updated, 'In Progress').catch(console.error);
        return updated;
      });

      setTimeout(() => {
        // Complete current step
        setWorkflow(prev => {
          const updated = prev.map((step, idx) => {
            if (idx === currentStepIndex) return { ...step, status: 'COMPLETED' as const, progress: 100 };
            return step;
          });
          saveWorkflowForProduct(inputData.id, updated, 'In Progress').catch(console.error);
          return updated;
        });
        currentStepIndex++;
        
        // Short delay before starting next step
        setTimeout(processStep, 1000);
      }, 1500); // Time to process a single step
    };

    processStep();
  };

  if (loading) {
    return (
      <div className="status-panel mx-auto max-w-md my-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading Workflow...</p>
      </div>
    );
  }

  if (error || !inputData) {
    return (
      <div className="status-panel mx-auto max-w-lg my-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">No Product Selected</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">{error || 'Please select a product first.'}</p>
        <Link to="/products" className="btn-primary">
          Go to Products
        </Link>
      </div>
    );
  }

  const normalizeStatus = (status: string) =>
    status?.toString().toLowerCase().replace('_', '-');

  const getStatusIcon = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-indigo-500 animate-pulse" />;
      default:
        return <Circle className="w-6 h-6 text-slate-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'completed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'in-progress':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const getCardClasses = (status: string) => {
    const s = normalizeStatus(status);
    if (s === 'completed') {
      return 'border-emerald-200 bg-emerald-50/80';
    }
    if (s === 'in-progress') {
      return 'border-indigo-200 bg-indigo-50/80 shadow-md shadow-indigo-100';
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="section-title mb-1">Workflow: {inputData.name}</h2>
          <p className="text-slate-500">Track execution steps from product selection to final launch</p>
        </div>
        
        {!isProcessing && !isComplete && (
          <button onClick={startWorkflow} className="btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" /> Start Workflow
          </button>
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold border border-indigo-100">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </div>
        )}
        
        {isComplete && (
          <button onClick={() => navigate('/analysis')} className="btn-secondary flex items-center gap-2">
            Return to Analysis <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative mt-8">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-slate-100" />

        <div className="space-y-12">
          {workflow.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
              className="relative flex items-start gap-5 md:gap-6 group"
            >
              {/* Icon Bubble */}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-4 border-slate-50 flex items-center justify-center shrink-0 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                {getStatusIcon(step.status)}
              </div>

              {/* Content Card */}
              <div
                className={`flex-1 surface-card p-5 md:p-6 transition-colors duration-300 ${getCardClasses(
                  step.status
                )}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold tracking-tight text-slate-950">{step.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border transition-colors duration-300 ${getStatusColor(step.status)}`}>
                    {step.status}
                  </span>
                </div>

                {typeof step.progress === 'number' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm font-semibold text-slate-900">{step.progress}%</span>
                    </div>
                    <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden ring-1 ring-slate-200/70">
                      <div
                        style={{ width: `${step.progress}%` }}
                        className={`h-full rounded-full transition-all duration-700 ${
                          normalizeStatus(step.status) === 'completed'
                            ? 'bg-emerald-500'
                            : normalizeStatus(step.status) === 'in-progress'
                            ? 'bg-indigo-500'
                            : 'bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Workflow Completed Successfully</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">All steps in the analysis pipeline have finished and are saved to local storage.</p>
          <button onClick={() => navigate('/charts')} className="btn-primary px-8">
            View Analytics
          </button>
        </motion.div>
      )}
    </div>
  );
}
