'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Boxes, Users, CreditCard,
  BarChart3, HeadphonesIcon, RefreshCcw,
  UserCog, Settings, Plug, ChevronRight, Glasses, LogOut, X, Sparkles
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/lensvik-admin-x7k2', icon: LayoutDashboard, group: 'main' },
  { label: 'Orders', href: '/lensvik-admin-x7k2/orders', icon: ShoppingBag, group: 'main' },
  { label: 'Products', href: '/lensvik-admin-x7k2/products', icon: Package, group: 'main' },
  { label: 'Inventory', href: '/lensvik-admin-x7k2/inventory', icon: Boxes, group: 'main' },
  { label: 'Customers', href: '/lensvik-admin-x7k2/customers', icon: Users, group: 'commerce' },
  { label: 'Payments', href: '/lensvik-admin-x7k2/payments', icon: CreditCard, group: 'commerce' },
  { label: 'AI Content Lab', href: '/lensvik-admin-x7k2/ai-lab', icon: Sparkles, group: 'commerce' },
  { label: 'Analytics', href: '/lensvik-admin-x7k2/analytics', icon: BarChart3, group: 'commerce' },
  { label: 'Website Settings', href: '/lensvik-admin-x7k2/settings', icon: Settings, group: 'system' },
];

const groups = [
  { id: 'main', label: 'Core' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'system', label: 'System' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ isOpen, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('lensvik_admin_auth');
    router.push('/lensvik-admin-x7k2/login');
  };

  const isActive = (href: string) => {
    if (href === '/lensvik-admin-x7k2') return pathname === href;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100 flex-shrink-0 bg-white">
        <Link href="/lensvik-admin-x7k2" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Glasses className="w-4 h-4 text-white" />
          </div>
          {isOpen && (
            <div>
              <span className="text-slate-900 font-bold text-sm tracking-wide">LENSVIK</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Admin Console</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar bg-white">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group.id);
          return (
            <div key={group.id} className="mb-4">
              {isOpen && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {group.label}
                </p>
              )}
              {items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative mb-0.5
                      ${active
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {isOpen && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {active && <ChevronRight className="w-3 h-3 text-blue-600" />}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
        {isOpen && (
          <div className="mt-2 px-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">A</div>
              <div>
                <p className="text-xs text-slate-900 font-bold">Super Admin</p>
                <p className="text-[10px] text-slate-500">admin@lensvik.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10">
            <button onClick={onMobileClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
