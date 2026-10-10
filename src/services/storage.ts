import axios from 'axios';

const isProd = import.meta.env.PROD;
export const API_URL = isProd 
  ? (import.meta.env.VITE_API_URL || 'https://droplify-fof1.onrender.com/api')
  : 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const pendingGets = new Map();

export const dedupedGet = async (url: string) => {
  if (pendingGets.has(url)) {
    return pendingGets.get(url);
  }
  const promise = api.get(url).finally(() => {
    pendingGets.delete(url);
  });
  pendingGets.set(url, promise);
  return promise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      // Only retry once and only if Retry-After is provided and reasonable (< 10 seconds for UX)
      if (!error.config._retryCount && retryAfter) {
        const delay = parseInt(retryAfter, 10) * 1000;
        if (delay > 0 && delay <= 10000) {
          error.config._retryCount = 1;
          await new Promise(resolve => setTimeout(resolve, delay));
          return api(error.config);
        }
      }
      return Promise.reject(new Error("The server is temporarily rate-limiting requests. Please try again shortly."));
    }
    return Promise.reject(error);
  }
);

export interface Product {
  id: string;
  name: string;
  category: string;
  cost: number;
  sellingPrice: number;
  additionalCost: number;
  rating: number;
  salesVolume: string; // High, Medium, Low
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  rating: number;
  deliveryTimeDays: number;
  returnRate: number;
  qualityScore: number;
  priceLevel: string; // Low, Medium, High
}

export interface Activity {
  id: string;
  message: string;
  timestamp: number;
}

export interface WorkflowStep {
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
}

export interface Workflow {
  id: string;
  productId: string;
  status: 'In Progress' | 'Completed' | 'Needs Review';
  steps: WorkflowStep[];
  updatedAt: number;
}

export const resetDemoData = async () => {
  // Can be implemented on backend to re-seed, for now no-op or clear
};

export const getProducts = async (): Promise<Product[]> => {
  const res = await dedupedGet('/products');
  return res.data;
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const res = await api.post('/products', product);
  return res.data;
};

export const updateProduct = async (product: Product) => {
  const res = await api.put(`/products/${product.id}`, product);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  await api.delete(`/products/${id}`);
};

export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await dedupedGet('/suppliers');
  return res.data;
};

export const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
  const res = await api.post('/suppliers', supplier);
  return res.data;
};

export const updateSupplier = async (supplier: Supplier) => {
  const res = await api.put(`/suppliers/${supplier.id}`, supplier);
  return res.data;
};

export const deleteSupplier = async (id: string) => {
  await api.delete(`/suppliers/${id}`);
};

export const getWorkflows = async (): Promise<Workflow[]> => {
  const res = await dedupedGet('/workflows');
  return res.data;
};

export const getWorkflowForProduct = async (productId: string): Promise<Workflow | null> => {
  try {
    const res = await api.get(`/workflows/product/${productId}`);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const saveWorkflowForProduct = async (productId: string, steps: WorkflowStep[], status: Workflow['status']) => {
  const res = await api.post(`/workflows/product/${productId}`, { status, steps });
  return res.data;
};

export const getActivities = async (): Promise<Activity[]> => {
  const res = await dedupedGet('/activities');
  return res.data;
};

export const logActivity = async (message: string) => {
  // Activity is logged automatically by the backend in most cases now.
  // but we can expose an endpoint if needed
};

export const calculateProfit = (product: Product) => {
  const profit = product.sellingPrice - product.cost - product.additionalCost;
  const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;
  return { profit, margin };
};

export const calculateSupplierScore = (supplier: Supplier) => {
  const ratingScore = (supplier.rating / 5) * 100;
  const deliveryScore = Math.max(0, 100 - (supplier.deliveryTimeDays * 5)); 
  const qualityScore = supplier.qualityScore;
  const reliability = (ratingScore * 0.4) + (qualityScore * 0.3) + (deliveryScore * 0.3);
  
  let risk = 'Low';
  if (reliability < 70) risk = 'High';
  else if (reliability < 85) risk = 'Medium';

  return { reliability: Math.round(reliability), risk };
};
