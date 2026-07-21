'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tag, Image as ImageIcon, ClipboardList, Percent, Users, PenTool, Settings, Home } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={14} /> },
    { name: 'Products Catalog', path: '/admin/products', icon: <Tag size={14} /> },
    { name: 'Media Library', path: '/admin/media', icon: <ImageIcon size={14} /> },
    { name: 'Orders Logs', path: '/admin/orders', icon: <ClipboardList size={14} /> },
    { name: 'Discounts / Coupons', path: '/admin/discounts', icon: <Percent size={14} /> },
    { name: 'Customers Base', path: '/admin/customers', icon: <Users size={14} /> },
    { name: 'Homepage CMS', path: '/admin/cms', icon: <PenTool size={14} /> },
    { name: 'Brand Settings', path: '/admin/settings', icon: <Settings size={14} /> },
    { name: 'Return to Store', path: '/', icon: <Home size={14} /> }
  ];

  const linkStyle = (path: string) => {
    const base = 'flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest font-light transition-colors';
    const active = pathname === path ? 'bg-fg-luxury text-bg-luxury font-medium' : 'text-text-muted hover:text-fg-luxury hover:bg-neutral-soft/30';
    return `${base} ${active}`;
  };

  return (
    <div className="min-h-screen bg-bg-luxury flex flex-col md:flex-row">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-bg-luxury border-b md:border-b-0 md:border-r border-neutral-soft/60 flex flex-col pt-10 pb-6">
        <div className="px-6 mb-10 text-left">
          <Link href="/admin" className="text-lg font-editorial tracking-[0.25em] font-semibold text-fg-luxury">
            FREERT CORE
          </Link>
          <p className="text-[8px] uppercase tracking-widest text-text-muted mt-1 font-medium">Control Operations System</p>
        </div>

        <nav className="flex flex-col gap-1 w-full text-left">
          {links.map((link) => (
            <Link key={link.path} href={link.path} className={linkStyle(link.path)}>
              {link.icon} {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
