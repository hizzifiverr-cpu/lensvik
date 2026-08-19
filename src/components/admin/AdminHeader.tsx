'use client';

import { useState } from 'react';
import { Menu, Bell, Search, Sun, Moon, ExternalLink, ChevronDown, PanelLeftClose, PanelLeftOpen, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const breadcrumbMap: Record<string, string> = {
  '/lensvik-admin-x7k2': 'Dashboard',
  '/lensvik-admin-x7k2/orders': 'Orders',
  '/lensvik-admin-x7k2/products': 'Products',
  '/lensvik-admin-x7k2/products/add': 'Add Product',
  '/lensvik-admin-x7k2/inventory': 'Inventory',
  '/lensvik-admin-x7k2/customers': 'Customers',
  '/lensvik-admin-x7k2/payments': 'Payments',
  '/lensvik-admin-x7k2/analytics': 'Analytics',
  '/lensvik-admin-x7k2/ai-lab': 'AI Content Lab',
  '/lensvik-admin-x7k2/settings': 'Settings',
};

const notifications: any[] = [];

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onMobileMenuToggle: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({ onToggleSidebar, onMobileMenuToggle, sidebarOpen }: AdminHeaderProps) {
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const currentPage = breadcrumbMap[pathname] || 'Dashboard';
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 flex-shrink-0">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
        {/* Mobile menu btn */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>


        {/* Breadcrumbs */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          <Link href="/lensvik-admin-x7k2" className="text-slate-400 hover:text-slate-900 transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-xs font-medium text-slate-600 truncate">{currentPage}</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Search bar (desktop) */}
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 gap-2 w-64 h-9 mr-2">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none flex-1 w-full"
            />
          </div>

          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 border-2 border-white rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">{unread} unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-xs text-slate-700">{n.message}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                )}
              </div>
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-600">View All Notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">Admin</p>
            <p className="text-[10px] text-slate-500">Super User</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
