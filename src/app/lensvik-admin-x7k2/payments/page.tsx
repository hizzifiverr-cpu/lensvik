'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, CheckCircle2, XCircle, Search, Download } from 'lucide-react';
import { toast } from 'sonner';

const statusStyle: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  Refunded: 'bg-orange-50 text-orange-600 border-orange-200',
  Failed: 'bg-red-50 text-red-600 border-red-200',
};

const statusIcon: Record<string, React.ElementType> = {
  Completed: CheckCircle2,
  Pending: AlertCircle,
  Refunded: AlertCircle,
  Failed: XCircle,
};

const methodColor: Record<string, string> = {
  JazzCash: 'text-red-600',
  EasyPaisa: 'text-emerald-600',
  'Bank Transfer': 'text-blue-600',
  COD: 'text-amber-600',
};

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const orders = await res.json();
      
      const txns = orders.map((o: any) => ({
        id: o._id.substring(o._id.length - 8).toUpperCase(),
        order: o._id.substring(0, 8),
        customer: o.customerName,
        amount: o.totalAmount || 0,
        tax: Math.round((o.totalAmount || 0) * 0.05), // Estimated tax
        method: o.paymentMethod || 'COD',
        ref: o.paymentDetails?.transactionId || 'N/A',
        status: o.paymentStatus === 'Paid' ? 'Completed' : o.paymentStatus || 'Pending',
        date: new Date(o.createdAt).toLocaleDateString(),
        fullOrderId: o._id
      }));
      
      setTransactions(txns);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(t => {
    const m = t.id.toLowerCase().includes(search.toLowerCase()) || t.customer.toLowerCase().includes(search.toLowerCase()) || t.order.toLowerCase().includes(search.toLowerCase());
    const mm = methodFilter === 'All' || t.method === methodFilter;
    const ms = statusFilter === 'All' || t.status === statusFilter;
    return m && mm && ms;
  });

  const totalRevenue = transactions.filter(t => t.status === 'Completed').reduce((a, t) => a + t.amount, 0);
  const totalTax = transactions.filter(t => t.status === 'Completed').reduce((a, t) => a + t.tax, 0);
  const totalRefunded = transactions.filter(t => t.status === 'Refunded').reduce((a, t) => a + t.amount, 0);
  const failed = transactions.filter(t => t.status === 'Failed').length;

  const methods = ['JazzCash', 'EasyPaisa', 'COD', 'Bank Transfer'];
  const methodStats = methods.map(m => {
    const amt = transactions.filter(t => t.method === m).reduce((a, t) => a + t.amount, 0);
    const pct = totalRevenue > 0 ? Math.round((amt / transactions.reduce((a, t) => a + t.amount, 0)) * 100) : 0;
    return { method: m, amount: amt, pct };
  });


  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editMethod, setEditMethod] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');

  const handleUpdateTransaction = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          totalAmount: editAmount,
          paymentMethod: editMethod,
          paymentStatus: editStatus === 'Completed' ? 'Paid' : editStatus
        })
      });
      
      if (res.ok) {
        toast.success('Transaction updated');
        setEditingId(null);
        fetchPayments();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'Paid' })
      });
      
      if (res.ok) {
        toast.success('Order marked as paid');
        fetchPayments();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{transactions.length} transactions recorded</p>
        </div>
        <button className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-xl px-3 py-2 hover:bg-white transition-all shadow-sm">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `PKR ${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tax Collected', value: `PKR ${(totalTax / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Refunded', value: `PKR ${(totalRefunded / 1000).toFixed(0)}K`, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Failed Payments', value: failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
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

      {/* Payment method breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {methodStats.map(item => (
          <div key={item.method} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{item.method}</p>
              <span className="text-xs font-bold text-slate-900">{item.pct}%</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-2">PKR {item.amount.toLocaleString()}</p>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>


      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-9 flex-1 min-w-48 focus-within:border-blue-500/50 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search TXN ID, order, customer..." className="bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none flex-1" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'JazzCash', 'EasyPaisa', 'COD', 'Bank Transfer'].map(m => (
            <button key={m} onClick={() => setMethodFilter(m)} className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-bold ${methodFilter === m ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white/50'}`}>{m}</button>
          ))}
        </div>
        <div className="w-px h-6 bg-slate-200 mx-1 hidden lg:block" />
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Completed', 'Pending', 'Refunded', 'Failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-bold ${statusFilter === s ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white/50'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['TXN ID', 'Order', 'Customer', 'Amount', 'Tax', 'Method', 'Reference', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t, i) => {
                const StatusIcon = statusIcon[t.status];
                const isEditing = editingId === t.id;

                return (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4"><p className="text-[10px] font-mono text-slate-400">{t.id}</p></td>
                    <td className="px-5 py-4"><p className="text-xs font-bold text-blue-600">{t.order}</p></td>
                    <td className="px-5 py-4"><p className="text-xs text-slate-900 font-medium">{t.customer}</p></td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editAmount} 
                          onChange={e => setEditAmount(parseInt(e.target.value) || 0)}
                          className="w-24 bg-white border border-blue-300 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                        />
                      ) : (
                        <p className="text-xs font-bold text-slate-900">PKR {t.amount.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-5 py-4"><p className="text-xs text-slate-500 font-mono">PKR {t.tax.toLocaleString()}</p></td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select 
                          value={editMethod} 
                          onChange={e => setEditMethod(e.target.value)}
                          className="text-xs border border-blue-300 rounded px-2 py-1 outline-none"
                        >
                          {['JazzCash', 'EasyPaisa', 'COD', 'Bank Transfer'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <p className={`text-xs font-bold ${methodColor[t.method]}`}>{t.method}</p>
                      )}
                    </td>
                    <td className="px-5 py-4"><p className="text-[10px] font-mono text-slate-400">{t.ref}</p></td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select 
                          value={editStatus} 
                          onChange={e => setEditStatus(e.target.value)}
                          className="text-xs border border-blue-300 rounded px-2 py-1 outline-none"
                        >
                          {['Completed', 'Pending', 'Refunded', 'Failed'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${statusStyle[t.status]}`}>
                          <StatusIcon className="w-2.5 h-2.5" />{t.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4"><p className="text-[10px] text-slate-500 font-mono">{t.date}</p></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={() => handleUpdateTransaction(t.fullOrderId)}
                              className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 hover:bg-emerald-100"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                setEditingId(t.id);
                                setEditAmount(t.amount);
                                setEditMethod(t.method);
                                setEditStatus(t.status);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg px-2 py-1"
                            >
                              Edit
                            </button>
                            {t.status === 'Pending' && (
                              <button 
                                onClick={() => handleMarkAsPaid(t.fullOrderId)}
                                className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 hover:bg-blue-100 transition-all"
                              >
                                Mark as Paid
                              </button>
                            )}
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
