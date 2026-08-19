'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingBag, DollarSign, Users, Package,
  RefreshCcw, AlertTriangle, Eye, ArrowUpRight,
  Clock, CheckCircle2, Truck, XCircle, Zap, Activity,
  ChevronRight, MessageSquare, TrendingUp, Search, Glasses
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon: Icon, trend, color, prefix = '' }: {
  label: string; value: string; change: string; icon: React.ElementType; trend: 'up' | 'down'; color: string; prefix?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all duration-200 group shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-90" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{prefix}{value}</h3>
      </div>
    </div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function RevenueChart({ revenueData, ordersData }: { revenueData: number[], ordersData: number[] }) {
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const max = Math.max(...revenueData) || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-slate-900 font-semibold">Revenue Overview</h3>
          <p className="text-slate-500 text-xs">Monthly performance analysis</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />Revenue</span>
          <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />Orders</span>
        </div>
      </div>
      <div className="relative mt-8">
        <div className="flex items-end gap-2 h-48">
          {revenueData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" onMouseEnter={() => setActiveMonth(i)} onMouseLeave={() => setActiveMonth(null)}>
              <div className="relative w-full h-full flex items-end">
                {activeMonth === i && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap z-10 shadow-xl">
                    <p className="font-bold">PKR {(v / 1000).toFixed(0)}k</p>
                    <p className="text-slate-400">{ordersData[i]} orders</p>
                  </div>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all duration-200 ${activeMonth === i ? 'bg-blue-600' : 'bg-blue-600/20'}`}
                  style={{ height: `${(v / max) * 100}%`, minHeight: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4 border-t border-slate-100 pt-2">
          {months.map((m, i) => (
            <p key={i} className="flex-1 text-center text-[10px] text-slate-400 font-medium">{m}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueByMonth, setRevenueByMonth] = useState<number[]>(new Array(12).fill(0));
  const [ordersByMonth, setOrdersByMonth] = useState<number[]>(new Array(12).fill(0));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);
      
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      
      const safeOrders = Array.isArray(ordersData) ? ordersData : [];
      const safeProducts = Array.isArray(productsData) ? productsData : [];

      setOrders(safeOrders);
      setProducts(safeProducts);

      if (!ordersRes.ok || !productsRes.ok) {
        toast.error('API request failed. Please check MONGODB_URI on Vercel.');
      }

      // Process monthly data
      const rev = new Array(12).fill(0);
      const ord = new Array(12).fill(0);
      
      safeOrders.forEach((order: any) => {
        if (!order.createdAt) return;
        const date = new Date(order.createdAt);
        const month = date.getMonth();
        if (month >= 0 && month < 12) {
          rev[month] += order.totalAmount || 0;
          ord[month] += 1;
        }
      });
      
      setRevenueByMonth(rev);
      setOrdersByMonth(ord);

    } catch (error) {
      setOrders([]);
      setProducts([]);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const ordersToday = orders.filter(o => {
    const today = new Date().setHours(0,0,0,0);
    return new Date(o.createdAt).getTime() >= today;
  }).length;
  const uniqueCustomers = new Set(orders.map(o => o.customerEmail)).size;
  
  // Calculate low stock items across all products and variants
  const lowStockItems = products.reduce((acc, p) => {
    const isLow = (stock: number) => stock > 0 && stock <= 5;
    if (p.variants && p.variants.length > 0) {
      return acc + p.variants.filter((v: any) => isLow(v.stock)).length;
    }
    return acc + (isLow(p.stock) ? 1 : 0);
  }, 0);

  const paymentBreakdown = orders.reduce((acc: any, o) => {
    const method = o.paymentMethod || 'Other';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const orderStatusBreakdown = [
    { label: 'Delivered', status: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Shipped', status: 'Shipped', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Processing', status: 'Lens Processing', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending', status: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Cancelled', status: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back to Lensvik Control Center.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-slate-600 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Last Sync: {loading ? 'Syncing...' : 'Just now'}
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="bg-blue-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Revenue" 
          value={(totalRevenue / 1000).toFixed(1) + 'k'} 
          change="+0%" 
          icon={DollarSign} 
          trend="up" 
          color="bg-blue-50 text-blue-600" 
          prefix="PKR " 
        />
        <StatCard 
          label="Orders Today" 
          value={ordersToday.toString()} 
          change="+0%" 
          icon={ShoppingBag} 
          trend="up" 
          color="bg-indigo-50 text-indigo-600" 
        />
        <StatCard 
          label="Active Customers" 
          value={uniqueCustomers.toString()} 
          change="+0%" 
          icon={Users} 
          trend="up" 
          color="bg-violet-50 text-violet-600" 
        />
        <StatCard 
          label="Low Stock SKUs" 
          value={lowStockItems.toString()} 
          change="Alert" 
          icon={AlertTriangle} 
          trend="down" 
          color="bg-amber-50 text-amber-600" 
        />
      </div>


      {/* Revenue chart + Live feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart revenueData={revenueByMonth} ordersData={ordersByMonth} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-y-auto max-h-[400px]">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h3 className="text-slate-900 font-semibold text-sm">Live Activity</h3>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 10).map((order, i) => (
              <div key={i} className="flex items-start gap-3 border-l-2 border-slate-100 pl-4 py-1">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">New order from {order.customerName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">PKR {order.totalAmount?.toLocaleString()} · {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-20">
                <Zap className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Monitoring activity...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-slate-900 font-semibold">Recent Orders</h3>
            <Link href="/lensvik-admin-x7k2/orders" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-blue-600">{order._id}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-900">{order.customerName}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">PKR {order.totalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-white">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-20 text-slate-400 text-xs">No orders to display</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-slate-900 font-semibold text-sm">Active Products</h3>
            <Link href="/lensvik-admin-x7k2/products" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {products.slice(0, 5).map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                  <img src={product.images?.[0] || '/images/dfd.png'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-slate-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">PKR {product.price?.toLocaleString()}</p>
                  <p className="text-[9px] text-emerald-600 font-bold">{product.status}</p>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-20 text-slate-400 text-xs">No product data</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment methods */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-900 font-semibold mb-5 text-sm">Payment Methods</h3>
          <div className="space-y-4">
            {Object.keys(paymentBreakdown).map(method => {
              const count = paymentBreakdown[method];
              const pct = Math.round((count / orders.length) * 100) || 0;
              return (
                <div key={method}>
                  <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-widest text-slate-500">
                    <span>{method}</span>
                    <span className="text-slate-900">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && <p className="text-xs text-slate-400">No data</p>}
          </div>
        </div>

        {/* Traffic sources */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-900 font-semibold mb-5 text-sm">Traffic Insights</h3>
          <div className="text-center py-10">
            <Activity className="w-8 h-8 text-slate-100 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">Tracking enabled. Data will appear as users interact with the site.</p>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-900 font-semibold mb-5 text-sm">Order Status</h3>
          <div className="space-y-3">
            {orderStatusBreakdown.map(item => {
              const count = orders.filter(o => o.status === item.status).length;
              return (
                <div key={item.label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${item.bg}`}>
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                  <span className={`text-xs font-bold ${item.color}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

