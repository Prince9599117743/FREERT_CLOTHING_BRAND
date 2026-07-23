'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Home, LayoutDashboard, Tag, FolderTree, Image, ClipboardList, Users, Percent, Star, Settings, HelpCircle, Mail, Bell
} from 'lucide-react';

const links = [
  { name: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard size={13} /> },
  { name: 'Products', view: 'products', icon: <Tag size={13} /> },
  { name: 'Categories', view: 'categories', icon: <FolderTree size={13} /> },
  { name: 'Homepage', view: 'homepage', icon: <Image size={13} /> },
  { name: 'Orders', view: 'orders', icon: <ClipboardList size={13} /> },
  { name: 'Customers', view: 'customers', icon: <Users size={13} /> },
  { name: 'Coupons', view: 'coupons', icon: <Percent size={13} /> },
  { name: 'Reviews', view: 'reviews', icon: <Star size={13} /> },
  { name: 'Enquiries', view: 'enquiries', icon: <Mail size={13} /> },
  { name: 'Subscribers', view: 'subscribers', icon: <Mail size={13} /> },
  { name: 'Restock Alerts', view: 'restock_alerts', icon: <Bell size={13} /> },
  { name: 'Store Settings', view: 'settings', icon: <Settings size={13} /> },
  { name: 'Help', view: 'help', icon: <HelpCircle size={13} /> }
];

function SidebarNav() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';

  const linkStyle = (viewKey: string) => {
    const base = 'flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest font-light transition-colors';
    const active = currentView === viewKey ? 'bg-fg-luxury text-bg-luxury font-medium' : 'text-text-muted hover:text-fg-luxury hover:bg-neutral-soft/30';
    return `${base} ${active}`;
  };

  return (
    <nav className="flex-1 overflow-y-auto flex flex-col gap-0.5 w-full text-left max-h-[75vh] pr-1">
      {links.map((link) => (
        <Link key={link.view} href={`/admin?view=${link.view}`} className={linkStyle(link.view)}>
          {link.icon} {link.name}
        </Link>
      ))}
      <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest font-light text-red-800 hover:bg-red-50 border-t border-neutral-soft/30 mt-2">
        <Home size={13} /> Return to Storefront
      </Link>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-luxury flex flex-col md:flex-row">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-bg-luxury border-b md:border-b-0 md:border-r border-neutral-soft/60 flex flex-col pt-10 pb-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="px-6 mb-8 text-left">
          <Link href="/admin?view=dashboard" className="text-base font-editorial tracking-[0.25em] font-semibold text-fg-luxury uppercase">
            FREERT STORE
          </Link>
          <p className="text-[7.5px] uppercase tracking-widest text-text-muted mt-1 font-medium">Store Management</p>
        </div>

        <Suspense fallback={<div className="text-[9px] uppercase tracking-widest text-text-muted p-4 text-left">Loading Navigation...</div>}>
          <SidebarNav />
        </Suspense>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
