'use client';

import { useState, useEffect } from 'react';
import { Search, Star, Users, ShoppingBag, MapPin, Eye, MessageSquare, Glasses } from 'lucide-react';
import { toast } from 'sonner';

const statusStyle: Record<string, string> = {
  VIP: 'bg-amber-50 text-amber-600 border-amber-200',
  Active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  New: 'bg-blue-50 text-blue-600 border-blue-200',
  Inactive: 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const orders = await res.json();
      
      // Group orders by email to create customer profiles
      const customerMap = new Map();
      
      orders.forEach((o: any) => {
        const key = o.customerEmail || o.customerPhone;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: o.customerEmail,
            name: o.customerName,
            email: o.customerEmail,
            phone: o.customerPhone,
            city: o.shippingAddress?.city || 'Unknown',
            orders: 0,
            spent: 0,
            lastOrder: o.createdAt,
            prescriptions: 0,
            status: 'New'
          });
        }
        
        const c = customerMap.get(key);
        c.orders += 1;
        c.spent += o.totalAmount || 0;
        if (new Date(o.createdAt) > new Date(c.lastOrder)) {
          c.lastOrder = o.createdAt;
        }
        
        // Count prescriptions
        if (o.items?.some((item: any) => item.prescription)) {
          c.prescriptions += 1;
        }
        
        // Determine status
        if (c.spent > 50000) c.status = 'VIP';
        else if (c.orders > 1) c.status = 'Active';
        else c.status = 'New';
      });
      
      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => {
    const m = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const ms = statusFilter === 'All' || c.status === statusFilter;
    return m && ms;
  });

  const vip = customers.filter(c => c.status === 'VIP').length;
  const totalRevenue = customers.reduce((acc, c) => acc + c.spent, 0);
  const totalOrders = customers.reduce((a, c) => a + c.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;


  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{customers.length} total customers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'VIP Members', value: vip, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Revenue', value: `PKR ${(totalRevenue / 1000).toFixed(1)}k`, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg. Order Value', value: `PKR ${avgOrderValue.toLocaleString()}`, icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{card.label}</p>
            </div>
          );
        })}
      </div>


      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 h-10 flex-1 min-w-48 focus-within:border-blue-500/50 transition-colors">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email..." className="bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none flex-1 font-medium" />
        </div>
        {['All', 'VIP', 'Active', 'New', 'Inactive'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-4 py-2.5 rounded-xl border transition-all font-bold ${statusFilter === s ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white/50'}`}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {['Customer', 'Contact', 'Location', 'Orders', 'Total Spent', 'Last Order', 'Prescriptions', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900">{c.name}</p>
                        <p className="text-[10px] text-slate-500">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-600">{c.email}</p>
                    <p className="text-[10px] text-slate-500">{c.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />{c.city}
                    </div>
                  </td>
                  <td className="px-5 py-4"><p className="text-xs font-semibold text-slate-900">{c.orders}</p></td>
                  <td className="px-5 py-4"><p className="text-xs font-semibold text-emerald-600">PKR {c.spent.toLocaleString()}</p></td>
                  <td className="px-5 py-4"><p className="text-[10px] text-slate-500">{c.lastOrder}</p></td>
                  <td className="px-5 py-4"><p className="text-xs text-violet-600 font-semibold">{c.prescriptions}</p></td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${statusStyle[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-all"><MessageSquare className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
