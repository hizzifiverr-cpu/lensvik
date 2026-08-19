'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, Download, Eye, Printer,
  Clock, CheckCircle2, Truck, Package, XCircle, RefreshCcw, Glasses, X, MapPin, Phone, Mail, CreditCard, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';


const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Lens Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Returned', 'Cancelled'];

const statusStyle: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  Confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
  'Lens Processing': 'bg-purple-50 text-purple-600 border-purple-200',
  'Ready to Ship': 'bg-cyan-50 text-cyan-600 border-cyan-200',
  Shipped: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Returned: 'bg-orange-50 text-orange-600 border-orange-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
  Processing: 'bg-violet-50 text-violet-600 border-violet-200',
};

const statusIcon: Record<string, React.ElementType> = {
  Pending: Clock,
  Confirmed: CheckCircle2,
  'Lens Processing': Glasses,
  'Ready to Ship': Package,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Returned: RefreshCcw,
  Cancelled: XCircle,
  Processing: RefreshCcw,
};

/** Normalize prescription data across old and new order formats */
function normalizePrescription(item: any) {
  const rawRx = item.prescription || null;
  if (!rawRx) return null;
  const measurements = rawRx.measurements
    ? rawRx.measurements
    : {
        od_sph: rawRx.od?.sph, od_cyl: rawRx.od?.cyl, od_axis: rawRx.od?.axis, od_add: rawRx.od?.add,
        os_sph: rawRx.os?.sph, os_cyl: rawRx.os?.cyl, os_axis: rawRx.os?.axis, os_add: rawRx.os?.add,
        pd: rawRx.pd,
      };
  const hasRx = Object.values(measurements).some((v: any) => v !== undefined && v !== '' && v !== null) ||
    rawRx.lensCategory || rawRx.lensType;
  return hasRx ? { measurements, lensCategory: rawRx.lensCategory, lensType: rawRx.lensType } : null;
}

/** Format a prescription value, returning — if falsy */
function rxVal(v: any) {
  return v !== undefined && v !== null && v !== '' ? String(v) : '—';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${window.location.origin}/api/orders`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Status updated');
      fetchOrders();
      if (selectedOrder?._id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to delete order');
      toast.success('Order deleted successfully');
      fetchOrders();
      if (selectedOrder?._id === id) setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete order');
    }
  };


  const filteredOrders = useMemo(() => {
    const searchLower = search.toLowerCase();
    return orders.filter(o => {
      const matchSearch =
        o._id?.toLowerCase().includes(searchLower) ||
        o.customerName?.toLowerCase().includes(searchLower) ||
        o.customerPhone?.includes(searchLower) ||
        o.customerEmail?.toLowerCase().includes(searchLower) ||
        o.shippingAddress?.city?.toLowerCase().includes(searchLower);
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return STATUS_OPTIONS.slice(1).reduce((acc, s) => {
      acc[s] = orders.filter(o => o.status === s).length;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0), [orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-700">Loading orders…</p>
          <p className="text-xs text-slate-400 mt-1">Fetching from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">{orders.length} total orders recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${statusFilter === s ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white bg-white/50'}`}
          >
            {s}
            {s !== 'All' && statusCounts[s] > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {statusCounts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: statusCounts['Pending'] || 0, color: 'text-amber-600', bg: 'bg-white' },
          { label: 'Confirmed', value: statusCounts['Confirmed'] || 0, color: 'text-blue-600', bg: 'bg-white' },
          { label: 'Shipped', value: statusCounts['Shipped'] || 0, color: 'text-indigo-600', bg: 'bg-white' },
          { label: 'Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-white' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 h-10 flex-1 min-w-48 focus-within:border-blue-500/50 transition-colors">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, customer name, phone, email, or city…"
              className="bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none flex-1"
            />
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl px-4 h-10 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {['Order ID', 'Customer', 'Product / Lenses', 'Date', 'Amount', 'Payment', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcon[order.status] || Clock;
                const firstItem = order.items?.[0];
                const hasLens = order.items?.some((item: any) => normalizePrescription(item) !== null);
                return (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-blue-600 group-hover:underline cursor-pointer" onClick={() => setSelectedOrder(order)}>{order._id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{order.shippingAddress?.city || 'No City'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-900 font-bold">{order.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-800 font-bold max-w-[220px] truncate">
                        {firstItem?.name || 'Unknown Product'}
                        {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                      </p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {hasLens ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5 font-bold">
                            <Glasses className="w-2.5 h-2.5" /> WITH LENSES
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 font-bold">
                            <Package className="w-2.5 h-2.5" /> NO LENSES
                          </span>
                        )}
                        {firstItem?.prescription?.lensCategory?.name && (
                          <span className="text-[9px] text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 font-bold">
                            {firstItem.prescription.lensCategory.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-600 font-medium whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-900 whitespace-nowrap">PKR {(order.totalAmount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{order.paymentMethod}</span>
                      <p className="text-[9px] text-slate-400 font-medium capitalize">{order.paymentStatus}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${statusStyle[order.status]}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                          title="View full order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm" title="Print invoice">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-20 bg-slate-50/20">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium tracking-tight">No orders found matching your search</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Order Detail Modal ───────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between rounded-t-3xl">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-slate-900 font-black text-lg">{selectedOrder._id}</h2>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusStyle[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                  {selectedOrder.items?.some((item: any) => normalizePrescription(item)) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1 font-bold">
                      <Glasses className="w-3 h-3" /> Prescription Order
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 font-bold">
                      <Package className="w-3 h-3" /> Frame Only / No Lenses
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs font-medium mt-1">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ── Customer & Shipping ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Customer Info
                  </p>
                  <p className="text-slate-900 font-bold text-sm">{selectedOrder.customerName}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" /> {selectedOrder.customerPhone}
                    </div>
                    {selectedOrder.customerEmail && !selectedOrder.customerEmail.includes('@lensvik.com') && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Mail className="w-3 h-3 text-slate-400" /> {selectedOrder.customerEmail}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:col-span-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> Shipping Address
                  </p>
                  <p className="text-slate-900 font-bold text-sm">{selectedOrder.shippingAddress?.street || '—'}</p>
                  <p className="text-slate-600 text-xs font-medium mt-1">
                    {[selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.state, selectedOrder.shippingAddress?.zipCode].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-slate-500 text-xs font-medium">{selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>

              {/* ── Order Items ── */}
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                  Order Items ({selectedOrder.items?.length || 0})
                </p>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const rx = normalizePrescription(item);
                    return (
                      <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                        {/* Item Header */}
                        <div className="p-4 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-slate-900 font-black text-sm">{item.name}</p>
                              {rx ? (
                                <span className="inline-flex items-center gap-1 text-[9px] text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5 font-bold">
                                  <Glasses className="w-2.5 h-2.5" /> WITH LENSES
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 font-bold">
                                  <Package className="w-2.5 h-2.5" /> FRAME ONLY
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 font-medium">
                              {item.variant?.color && item.variant.color !== 'N/A' && <span>Color: <strong className="text-slate-700">{item.variant.color}</strong></span>}
                              {item.variant?.size && item.variant.size !== 'M' && <span>Size: <strong className="text-slate-700">{item.variant.size}</strong></span>}
                              <span>Qty: <strong className="text-slate-700">{item.quantity}</strong></span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-slate-900 font-black text-sm">PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                            <p className="text-slate-400 text-[10px] font-medium">PKR {(item.price || 0).toLocaleString()} each</p>
                          </div>
                        </div>

                        {/* Prescription & Lens Details */}
                        {rx && (
                          <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-4">
                            {/* Lens Category & Type */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lens Category:</span>
                                <span className="text-[11px] font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                                  {rx.lensCategory?.name || '—'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lens Type:</span>
                                <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg shadow-sm">
                                  {rx.lensType?.name || '—'}
                                </span>
                              </div>
                              {rx.lensType?.price > 0 && (
                                <span className="text-[11px] font-bold text-emerald-600 ml-auto">
                                  + PKR {rx.lensType.price.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Prescription Table */}
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Prescription Details (Rx)</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Right Eye (OD) */}
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                  <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Right Eye (OD)</span>
                                  </div>
                                  <div className="grid grid-cols-4 divide-x divide-slate-100">
                                    {[
                                      { label: 'SPH', value: rxVal(rx.measurements?.od_sph) },
                                      { label: 'CYL', value: rxVal(rx.measurements?.od_cyl) },
                                      { label: 'AXIS', value: rxVal(rx.measurements?.od_axis) },
                                      { label: 'ADD', value: rxVal(rx.measurements?.od_add) },
                                    ].map(({ label, value }) => (
                                      <div key={label} className="p-2.5 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                                        <p className="text-[12px] font-black text-slate-900 font-mono">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Left Eye (OS) */}
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Left Eye (OS)</span>
                                  </div>
                                  <div className="grid grid-cols-4 divide-x divide-slate-100">
                                    {[
                                      { label: 'SPH', value: rxVal(rx.measurements?.os_sph) },
                                      { label: 'CYL', value: rxVal(rx.measurements?.os_cyl) },
                                      { label: 'AXIS', value: rxVal(rx.measurements?.os_axis) },
                                      { label: 'ADD', value: rxVal(rx.measurements?.os_add) },
                                    ].map(({ label, value }) => (
                                      <div key={label} className="p-2.5 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                                        <p className="text-[12px] font-black text-slate-900 font-mono">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* PD Row */}
                              <div className="mt-2 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pupillary Distance (PD)</span>
                                <span className="text-sm font-black text-slate-900 font-mono">
                                  {rxVal(rx.measurements?.pd) !== '—' ? `${rxVal(rx.measurements?.pd)} mm` : '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Order Totals ── */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Payment Summary</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-slate-900 font-bold">PKR {(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="h-[1px] bg-slate-200 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900 font-black uppercase tracking-tight">Net Total</span>
                  <span className="text-blue-600 font-black text-base">PKR {(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-widest">
                    <CreditCard className="w-3.5 h-3.5" /> Payment Method
                  </div>
                  <span className="text-slate-900 font-bold">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Payment Status</span>
                  <span className={`font-bold capitalize ${selectedOrder.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Tracking #</span>
                    <span className="text-slate-900 font-bold font-mono">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Order Notes</span>
                    <p className="text-slate-700 text-xs font-medium mt-1">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* ── Status Update + Actions ── */}
              <div className="flex gap-3 pt-2 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-[150px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Update Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    disabled={updatingStatus}
                    className="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-xl py-3 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.slice(1).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex flex-col justify-end min-w-[150px]">
                  <button className="w-full bg-white text-slate-600 border border-slate-200 rounded-xl py-3 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print Invoice
                  </button>
                </div>
                <div className="flex-1 flex flex-col justify-end min-w-[150px]">
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder._id)}
                    className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 text-xs font-bold hover:bg-red-100 hover:border-red-300 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
