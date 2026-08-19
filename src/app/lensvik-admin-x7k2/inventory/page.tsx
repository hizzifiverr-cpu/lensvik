'use client';

import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Package, TrendingDown, RefreshCw, Filter, Trash2, Edit3, Check, X } from 'lucide-react';
import { toast } from 'sonner';

function getStockStatus(stock: number, reorder: number) {
  if (stock === 0) return { label: 'Out of Stock', style: 'bg-red-50 text-red-600 border-red-200' };
  if (stock <= reorder) return { label: 'Low Stock', style: 'bg-amber-50 text-amber-600 border-amber-200' };
  return { label: 'In Stock', style: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const products = await res.json();
      const safeProducts = Array.isArray(products) ? products : [];
      
      const items: any[] = [];
      safeProducts.forEach((p: any) => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v: any, vIdx: number) => {
            items.push({
              id: `${p._id}-${vIdx}`,
              productId: p._id,
              variantIndex: vIdx,
              sku: v.sku || p.sku || 'NO-SKU',
              name: p.name,
              variant: `${v.color} / ${v.size} / ${v.lensType}`,
              stock: v.stock || 0,
              reorderPoint: 5,
              reserved: 0,
              available: v.stock || 0,
              location: 'Main Warehouse',
              cost: p.price * 0.6,
            });
          });
        } else {
          items.push({
            id: p._id,
            productId: p._id,
            variantIndex: -1,
            sku: p.sku || 'NO-SKU',
            name: p.name,
            variant: 'Standard',
            stock: p.stock || 0,
            reorderPoint: 5,
            reserved: 0,
            available: p.stock || 0,
            location: 'Main Warehouse',
            cost: p.price * 0.6,
          });
        }
      });
      
      setInventory(items);
      if (!res.ok) {
        toast.error('Failed to fetch inventory from server');
      }
    } catch (error) {
      setInventory([]);
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (item: any) => {
    try {
      // Use dot-notation for MongoDB $set — lightweight payload, no base64 images
      let payload: any;
      
      if (item.variantIndex === -1) {
        // Update top-level stock
        payload = { stock: editValue };
      } else {
        // Update variant stock at specific index
        payload = { [`variants.${item.variantIndex}.stock`]: editValue };
      }
      
      const updateRes = await fetch(`/api/products/${item.productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (updateRes.ok) {
        toast.success('Stock updated');
        setEditingId(null);
        fetchInventory();
      } else {
        const err = await updateRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update');
      }
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will remove all its variants.')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        fetchInventory();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('DANGER: This will delete ALL products in your inventory. Are you sure?')) return;
    const pwd = prompt('Type "DELETE ALL" to confirm:');
    if (pwd !== 'DELETE ALL') return;

    try {
      setLoading(true);
      const res = await fetch('/api/products', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear inventory');

      
      toast.success('Inventory cleared');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to clear inventory');
    } finally {
      setLoading(false);
    }
  };

  const filtered = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'low' && item.stock > 0 && item.stock <= item.reorderPoint) || (filter === 'out' && item.stock === 0) || (filter === 'ok' && item.stock > item.reorderPoint);
    return matchSearch && matchFilter;
  });

  const outOfStock = inventory.filter(i => i.stock === 0).length;
  const lowStock = inventory.filter(i => i.stock > 0 && i.stock <= i.reorderPoint).length;
  const totalValue = inventory.reduce((acc, i) => acc + i.stock * i.cost, 0);

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm mt-0.5">{inventory.length} SKUs tracked · Value: PKR {(totalValue / 1000000).toFixed(1)}M</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleClearAll}
            disabled={loading || inventory.length === 0}
            className="flex items-center gap-2 text-xs font-bold text-red-600 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Empty Inventory
          </button>
          <button 
            onClick={fetchInventory}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Stock
          </button>
        </div>
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', value: inventory.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Low Stock', value: lowStock, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Out of Stock', value: outOfStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Inventory Value', value: `PKR ${(totalValue / 1000).toFixed(0)}k`, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-tight">{card.value}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter + Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-9 flex-1 min-w-48 focus-within:border-blue-500/50 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU, product..." className="bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none flex-1" />
        </div>
        {['all', 'ok', 'low', 'out'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-4 py-2.5 rounded-xl border transition-all capitalize font-bold ${filter === f ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white/50'}`}>
            {f === 'all' ? 'All' : f === 'ok' ? 'In Stock' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['SKU', 'Product / Variant', 'Stock', 'Reserved', 'Available', 'Reorder', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => {
                const status = getStockStatus(item.stock, item.reorderPoint);
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.variant}</p>
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={editValue} 
                            onChange={e => setEditValue(parseInt(e.target.value) || 0)}
                            className="w-16 bg-white border border-blue-300 rounded px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <p className={`text-sm font-bold ${item.stock === 0 ? 'text-red-600' : item.stock <= item.reorderPoint ? 'text-amber-600' : 'text-slate-900'}`}>{item.stock}</p>
                      )}
                    </td>
                    <td className="px-5 py-4"><p className="text-xs text-slate-500">{item.reserved}</p></td>
                    <td className="px-5 py-4"><p className="text-xs font-bold text-emerald-600">{item.available}</p></td>
                    <td className="px-5 py-4"><p className="text-xs text-slate-500">{item.reorderPoint}</p></td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.style}`}>{status.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleUpdateStock(item)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingId(item.id); setEditValue(item.stock); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Stock"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.productId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
