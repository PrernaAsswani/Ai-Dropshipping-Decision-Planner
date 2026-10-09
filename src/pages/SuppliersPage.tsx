import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { Supplier, getSuppliers, addSupplier, updateSupplier, deleteSupplier, calculateSupplierScore } from '../services/storage';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    rating: '',
    deliveryTimeDays: '',
    returnRate: '',
    qualityScore: '',
    priceLevel: 'Medium',
  });

  useEffect(() => {
    const fetchData = async () => setSuppliers(await getSuppliers());
    fetchData();
  }, []);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        rating: supplier.rating.toString(),
        deliveryTimeDays: supplier.deliveryTimeDays.toString(),
        returnRate: supplier.returnRate.toString(),
        qualityScore: supplier.qualityScore.toString(),
        priceLevel: supplier.priceLevel,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        rating: '4.0',
        deliveryTimeDays: '7',
        returnRate: '2',
        qualityScore: '85',
        priceLevel: 'Medium',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Supplier name is required', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      rating: Number(formData.rating),
      deliveryTimeDays: Number(formData.deliveryTimeDays),
      returnRate: Number(formData.returnRate),
      qualityScore: Number(formData.qualityScore),
      priceLevel: formData.priceLevel,
    };

    if (editingSupplier) {
      await updateSupplier({ ...payload, id: editingSupplier.id } as Supplier);
      showToast('Supplier updated successfully');
    } else {
      await addSupplier(payload);
      showToast('Supplier added successfully');
    }

    setSuppliers(await getSuppliers());
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      await deleteSupplier(id);
      setSuppliers(await getSuppliers());
      showToast('Supplier deleted', 'info');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="section-title mb-1">Supplier Network</h2>
          <p className="text-slate-500">Evaluate and manage your sourcing partners</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Supplier
        </button>
      </div>

      <div className="surface-card mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search suppliers..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="status-panel mx-auto max-w-md my-12">
          <p className="text-lg font-semibold text-slate-900">No suppliers found</p>
          <button onClick={() => handleOpenModal()} className="btn-primary mt-4">Add New Supplier</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSuppliers.map((supplier, index) => {
            const { reliability, risk } = calculateSupplierScore(supplier);
            
            return (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="surface-card p-5 group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{supplier.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-amber-500">★ {supplier.rating}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">Price: {supplier.priceLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(supplier)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Delivery Time</p>
                    <p className="font-semibold text-slate-900">{supplier.deliveryTimeDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Return Rate</p>
                    <p className="font-semibold text-slate-900">{supplier.returnRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Quality Score</p>
                    <p className="font-semibold text-slate-900">{supplier.qualityScore}/100</p>
                  </div>
                </div>

                <div className="mt-auto bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      risk === 'Low' ? 'bg-emerald-100 text-emerald-600' :
                      risk === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {risk === 'High' ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Reliability Score</p>
                      <p className="font-bold text-slate-900">{reliability}% <span className={`text-xs ml-1 ${
                        risk === 'Low' ? 'text-emerald-600' :
                        risk === 'Medium' ? 'text-amber-600' : 'text-red-600'
                      }`}>({risk} Risk)</span></p>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center relative">
                    <svg className="w-full h-full absolute inset-0 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" 
                        className={
                          risk === 'Low' ? 'text-emerald-500' :
                          risk === 'Medium' ? 'text-amber-500' : 'text-red-500'
                        }
                        strokeDasharray="175" strokeDashoffset={175 - (175 * reliability) / 100} 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name *</label>
            <input required type="text" className="field-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. TechSource" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating (0-5)</label>
              <input required type="number" step="0.1" min="0" max="5" className="field-control" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Time (Days)</label>
              <input required type="number" min="1" className="field-control" value={formData.deliveryTimeDays} onChange={e => setFormData({...formData, deliveryTimeDays: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Return Rate (%)</label>
              <input required type="number" min="0" max="100" className="field-control" value={formData.returnRate} onChange={e => setFormData({...formData, returnRate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quality Score (0-100)</label>
              <input required type="number" min="0" max="100" className="field-control" value={formData.qualityScore} onChange={e => setFormData({...formData, qualityScore: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price Level</label>
            <select className="field-control" value={formData.priceLevel} onChange={e => setFormData({...formData, priceLevel: e.target.value})}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
            <button type="submit" className="btn-primary">{editingSupplier ? 'Save Changes' : 'Add Supplier'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
