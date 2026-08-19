'use client';

import { useState } from 'react';
import { Settings, Globe, Truck, DollarSign, Mail, Bell, Key, Search as SearchIcon, Save, ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'tax', label: 'Tax & Currency', icon: DollarSign },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-all duration-200 ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function Field({ label, placeholder, value, type = 'text', hint }: { label: string; placeholder?: string; value?: string; type?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <input defaultValue={value} type={type} placeholder={placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all" />
      {hint && <p className="text-[10px] text-slate-500 mt-1 font-medium italic">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('website');
  const [notifications, setNotifications] = useState({
    newOrder: true, lowStock: true, newReview: false, refundRequest: true, paymentFailed: true, newCustomer: false,
  });
  const [shipping, setShipping] = useState({ freeShippingEnabled: true, codEnabled: true, expressEnabled: true });

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure your store preferences and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 h-fit shadow-sm">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-1 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-bold flex-1 text-left">{section.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">
          {activeSection === 'website' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Website Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Store Name" value="LENSVIK" />
                <Field label="Store Email" value="hello@lensvik.com" type="email" />
                <Field label="Phone Number" value="+92 300 1234567" />
                <Field label="Store URL" value="https://lensvik.com" />
              </div>
              <Field label="Store Description" value="Pakistan's premium eyewear destination with AI virtual try-on." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Address Line 1" value="3rd Floor, Packages Mall" />
                <Field label="City" value="Lahore" />
                <Field label="Country" value="Pakistan" />
                <Field label="Timezone" value="Asia/Karachi (PKT +5:00)" />
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {[
                  { label: 'Maintenance Mode', key: 'maintenance', enabled: false },
                  { label: 'Show "New" badges on products', key: 'newBadge', enabled: true },
                  { label: 'Enable product reviews', key: 'reviews', enabled: true },
                  { label: 'Enable Virtual Try-On', key: 'vto', enabled: true },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2.5">
                    <p className="text-sm text-slate-700 font-medium">{item.label}</p>
                    <Toggle enabled={item.enabled} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'shipping' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Shipping Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Free Shipping', desc: 'Offer free shipping on qualifying orders', key: 'freeShippingEnabled' as keyof typeof shipping },
                  { label: 'Cash on Delivery (COD)', desc: 'Allow customers to pay on delivery', key: 'codEnabled' as keyof typeof shipping },
                  { label: 'Express Delivery', desc: 'Same-day / next-day delivery option', key: 'expressEnabled' as keyof typeof shipping },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <Toggle enabled={shipping[item.key]} onChange={() => setShipping(s => ({ ...s, [item.key]: !s[item.key] }))} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Standard Rate (PKR)" value="250" />
                <Field label="Free Shipping Threshold (PKR)" value="5000" />
                <Field label="Express Rate (PKR)" value="500" />
                <Field label="COD Handling Fee (PKR)" value="100" />
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Supported Cities</h4>
                <div className="flex flex-wrap gap-2">
                  {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'].map(city => (
                    <span key={city} className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 font-medium">{city}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tax' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Tax & Currency</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Default Currency" value="PKR (Pakistani Rupee)" />
                <Field label="Currency Symbol" value="PKR" />
                <Field label="Tax Rate (%)" value="16" hint="Standard GST rate in Pakistan" />
                <Field label="Tax ID / NTN" value="1234567-8" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-900">Display Prices Including Tax</p>
                  <p className="text-xs text-slate-500">Show tax-inclusive prices on the storefront</p>
                </div>
                <Toggle enabled={true} onChange={() => {}} />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-900">Apply Tax to Shipping</p>
                  <p className="text-xs text-slate-500">Include GST on shipping charges</p>
                </div>
                <Toggle enabled={false} onChange={() => {}} />
              </div>
            </div>
          )}

          {activeSection === 'email' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Email Templates</h3>
              <div className="space-y-3">
                {[
                  { name: 'Order Confirmation', status: 'Active', lastEdited: '3 days ago' },
                  { name: 'Order Shipped', status: 'Active', lastEdited: '1 week ago' },
                  { name: 'Order Delivered', status: 'Active', lastEdited: '2 weeks ago' },
                  { name: 'Refund Processed', status: 'Active', lastEdited: '1 month ago' },
                  { name: 'Welcome Email', status: 'Active', lastEdited: '2 months ago' },
                  { name: 'Abandoned Cart', status: 'Draft', lastEdited: '5 days ago' },
                  { name: 'Password Reset', status: 'Active', lastEdited: '1 month ago' },
                ].map(template => (
                  <div key={template.name} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{template.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Last edited {template.lastEdited}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${template.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{template.status}</span>
                      <button className="text-xs text-blue-600 font-bold border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-all">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Notification Preferences</h3>
              <div className="space-y-1">
                {[
                  { key: 'newOrder' as keyof typeof notifications, label: 'New Order Placed', desc: 'Get notified for every new order' },
                  { key: 'lowStock' as keyof typeof notifications, label: 'Low Stock Alert', desc: 'When product stock drops below reorder point' },
                  { key: 'newReview' as keyof typeof notifications, label: 'New Review Submitted', desc: 'Customer posts a product review' },
                  { key: 'refundRequest' as keyof typeof notifications, label: 'Refund Request', desc: 'New return or refund request submitted' },
                  { key: 'paymentFailed' as keyof typeof notifications, label: 'Payment Failed', desc: 'Online payment failure detected' },
                  { key: 'newCustomer' as keyof typeof notifications, label: 'New Customer Signup', desc: 'New account registered on site' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm text-slate-900 font-bold">{item.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <Toggle enabled={notifications[item.key]} onChange={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))} />
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Save button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
