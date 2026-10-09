import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, Edit, Trash2, BrainCircuit, ArrowDownUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Supplier, getProducts, getSuppliers, addProduct, updateProduct, deleteProduct, calculateProfit } from '../services/storage';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { setInputData } = useData();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cost: '',
    sellingPrice: '',
    additionalCost: '',
    rating: '',
    salesVolume: 'Medium',
    supplierId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setProducts(await getProducts());
      setSuppliers(await getSuppliers());
    };
    fetchData();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        cost: product.cost.toString(),
        sellingPrice: product.sellingPrice.toString(),
        additionalCost: product.additionalCost.toString(),
        rating: product.rating.toString(),
        salesVolume: product.salesVolume,
        supplierId: product.supplierId,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        cost: '',
        sellingPrice: '',
        additionalCost: '0',
        rating: '0',
        salesVolume: 'Medium',
        supplierId: suppliers.length > 0 ? suppliers[0].id : '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.cost || !formData.sellingPrice || !formData.supplierId) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      cost: Number(formData.cost),
      sellingPrice: Number(formData.sellingPrice),
      additionalCost: Number(formData.additionalCost),
      rating: Number(formData.rating),
      salesVolume: formData.salesVolume,
      supplierId: formData.supplierId,
    };

    if (editingProduct) {
      await updateProduct({ ...payload, id: editingProduct.id } as Product);
      showToast('Product updated successfully');
    } else {
      await addProduct(payload);
      showToast('Product added successfully');
    }

    setProducts(await getProducts());
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      setProducts(await getProducts());
      showToast('Product deleted', 'info');
    }
  };

  const handleAnalysis = (product: Product) => {
    setInputData(product);
    navigate('/analysis');
  };

  const filteredAndSortedProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'profitMargin') return calculateProfit(b).margin - calculateProfit(a).margin;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const getSupplierName = (id: string) => {
    const s = suppliers.find(sup => sup.id === id);
    return s ? s.name : 'Unknown Supplier';
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="section-title mb-1">Products Management</h2>
          <p className="text-slate-500">Manage your product catalog and run AI analysis</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="surface-card mb-6 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <ArrowDownUp className="w-5 h-5 text-slate-500" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="profitMargin">Sort by Profit Margin</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="status-panel mx-auto max-w-md my-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-slate-900">No products found</p>
          <p className="text-slate-500 mb-6 text-center">We couldn't find any products matching your search criteria.</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">Add New Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product, index) => {
            const { margin } = calculateProfit(product);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="surface-card p-5 group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(product)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Selling Price</p>
                    <p className="font-semibold text-slate-900">₹{product.sellingPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
                    <p className={`font-semibold ${margin > 30 ? 'text-emerald-600' : 'text-amber-600'}`}>{margin.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Rating</p>
                    <p className="font-semibold text-amber-500">★ {product.rating}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Sales Volume</p>
                    <p className="font-semibold text-slate-900">{product.salesVolume}</p>
                  </div>
                </div>

                <div className="mb-6 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Supplier</p>
                  <p className="text-sm font-semibold text-indigo-900">{getSupplierName(product.supplierId)}</p>
                </div>

                <div className="mt-auto">
                  <button onClick={() => handleAnalysis(product)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                    <BrainCircuit className="w-5 h-5" /> AI Analysis
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input required type="text" className="field-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Wireless Earbuds" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <input required type="text" className="field-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Electronics" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
              <select required className="field-control" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                <option value="" disabled>Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost (₹) *</label>
              <input required type="number" min="0" className="field-control" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹) *</label>
              <input required type="number" min="0" className="field-control" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Add. Cost (₹)</label>
              <input type="number" min="0" className="field-control" value={formData.additionalCost} onChange={e => setFormData({...formData, additionalCost: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" className="field-control" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sales Volume</label>
            <select className="field-control" value={formData.salesVolume} onChange={e => setFormData({...formData, salesVolume: e.target.value})}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          {formData.cost && formData.sellingPrice && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mt-4">
              <p className="text-xs text-slate-500 mb-1">Calculated Profit Margin</p>
              <p className={`font-semibold ${((Number(formData.sellingPrice) - Number(formData.cost) - Number(formData.additionalCost)) / Number(formData.sellingPrice) * 100) > 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {((Number(formData.sellingPrice) - Number(formData.cost) - Number(formData.additionalCost)) / Number(formData.sellingPrice) * 100).toFixed(1)}%
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
            <button type="submit" className="btn-primary">{editingProduct ? 'Save Changes' : 'Add Product'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
