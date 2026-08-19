'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, Eye, ArrowUpRight, BarChart3, Smartphone, Monitor, Tablet, Activity } from 'lucide-react';
import { toast } from 'sonner';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data) || 1;
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5 h-32 mt-4">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          <div className="relative w-full">
            {hovered === i && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 shadow-xl">
                PKR {(v).toFixed(0)}K
              </div>
            )}
            <div className={`w-full rounded-t-md transition-all duration-200 ${hovered === i ? 'opacity-100 shadow-lg' : 'opacity-70'}`} style={{ height: `${(v / max) * 120}px`, backgroundColor: color }} />
          </div>
          <p className="text-[9px] text-slate-500 font-bold">{labels[i]}</p>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(new Array(12).fill(0));

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      const safeOrders = Array.isArray(data) ? data : [];
      setOrders(safeOrders);

      const rev = new Array(12).fill(0);
      safeOrders.forEach((o: any) => {
        if (!o.createdAt) return;
        const month = new Date(o.createdAt).getMonth();
        if (month >= 0 && month < 12) {
          rev[month] += (o.totalAmount || 0) / 1000; // Store in K
        }
      });
      setMonthlyRevenue(rev);
      if (!res.ok) {
        toast.error(data?.error || 'Failed to load analytics');
      }
    } catch (error) {
      setOrders([]);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((a, o) => a + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;

  // Category performance
  const categoryMap = new Map();
  orders.forEach(o => {
    o.items?.forEach((item: any) => {
      // Note: Category might be missing in order items, but we can try to derive or just use product name
      const cat = item.category || 'Eyewear'; 
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + (item.price * item.quantity || 0));
    });
  });
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Regional data
  const regionalMap = new Map();
  orders.forEach(o => {
    const city = o.shippingAddress?.city || 'Unknown';
    regionalMap.set(city, (regionalMap.get(city) || 0) + (o.totalAmount || 0));
  });
  const regionalData = Array.from(regionalMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);


  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Performance overview · Lensvik.com</p>
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {['7d', '30d', '90d', '1y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`text-xs px-4 py-1.5 rounded-lg transition-all font-bold ${period === p ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `PKR ${(totalRevenue / 1000).toFixed(1)}k`, change: '+0%', up: true, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Orders', value: totalOrders.toString(), change: '+0%', up: true, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Customers', value: new Set(orders.map(o => o.customerEmail)).size.toString(), change: '+0%', up: true, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Avg. Order', value: `PKR ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0}`, change: '+0.0%', up: true, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                   <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full font-bold">
                  <ArrowUpRight className="w-3 h-3" />{card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-tight">{card.value}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-4">
          <h3 className="text-sm font-bold text-slate-900">Monthly Revenue (PKR '000)</h3>
          <span className="text-xs text-slate-500 font-medium">Real-time Data</span>
        </div>
        <BarChart data={monthlyRevenue} labels={months} color="#2563eb" />
      </div>

      {/* Regional & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category performance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 border-b border-slate-50 pb-4">Category Performance</h3>
          <div className="space-y-4">
            {categoryData.length > 0 ? categoryData.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-widest text-slate-500">
                  <span>{cat.name}</span>
                  <span className="text-slate-900">PKR {cat.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(cat.value / totalRevenue) * 100}%` }} />
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No category data available</div>
            )}
          </div>
        </div>

        {/* Regional */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 border-b border-slate-50 pb-4">Regional Sales</h3>
          <div className="space-y-4">
            {regionalData.length > 0 ? regionalData.map((reg, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs font-medium text-slate-600">{reg.name}</span>
                <span className="text-xs font-bold text-slate-900">PKR {reg.value.toLocaleString()}</span>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No regional data available</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
