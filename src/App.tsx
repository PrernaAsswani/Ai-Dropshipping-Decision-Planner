import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InputPage from './pages/InputPage';
import AnalysisPage from './pages/AnalysisPage';
import ChartsPage from './pages/ChartsPage';
import WorkflowPage from './pages/WorkflowPage';
import DecisionPage from './pages/DecisionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductsPage from './pages/ProductsPage';
import SuppliersPage from './pages/SuppliersPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="input" element={<InputPage />} />
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="charts" element={<ChartsPage />} />
              <Route path="workflow" element={<WorkflowPage />} />
              <Route path="report" element={<DecisionPage />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
    </ToastProvider>
  );
}
