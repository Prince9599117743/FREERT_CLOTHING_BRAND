'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, ClipboardList, Tag, FolderTree, PackageOpen, Inbox, 
  Users, Star, Percent, PenTool, Image, Sliders, PlayCircle, BookOpen, 
  FileText, Menu, Megaphone, Share2, BarChart3, LineChart, HelpCircle, 
  Bell, Globe, Settings, ShieldAlert, FileClock, Database, Home 
} from 'lucide-react';

const links = [
  { name: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard size={13} /> },
  { name: 'Orders', view: 'orders', icon: <ClipboardList size={13} /> },
  { name: 'Products', view: 'products', icon: <Tag size={13} /> },
  { name: 'Categories', view: 'categories', icon: <FolderTree size={13} /> },
  { name: 'Collections', view: 'collections', icon: <PackageOpen size={13} /> },
  { name: 'Inventory', view: 'inventory', icon: <Inbox size={13} /> },
  { name: 'Customers', view: 'customers', icon: <Users size={13} /> },
  { name: 'Reviews', view: 'reviews', icon: <Star size={13} /> },
  { name: 'Coupons', view: 'coupons', icon: <Percent size={13} /> },
  { name: 'Homepage CMS', view: 'cms', icon: <PenTool size={13} /> },
  { name: 'Hero Manager', view: 'hero', icon: <Sliders size={13} /> },
  { name: 'Media Library', view: 'media', icon: <Image size={13} /> },
  { name: 'Lookbook', view: 'lookbook', icon: <PlayCircle size={13} /> },
  { name: 'Blogs', view: 'blogs', icon: <BookOpen size={13} /> },
  { name: 'Pages', view: 'pages', icon: <FileText size={13} /> },
  { name: 'Navigation Menu', view: 'navigation', icon: <Menu size={13} /> },
  { name: 'Announcements', view: 'announcements', icon: <Megaphone size={13} /> },
  { name: 'Marketing', view: 'marketing', icon: <Share2 size={13} /> },
  { name: 'Analytics', view: 'analytics', icon: <BarChart3 size={13} /> },
  { name: 'Reports', view: 'reports', icon: <LineChart size={13} /> },
  { name: 'Support Tickets', view: 'tickets', icon: <HelpCircle size={13} /> },
  { name: 'Notifications', view: 'notifications', icon: <Bell size={13} /> },
  { name: 'SEO Settings', view: 'seo', icon: <Globe size={13} /> },
  { name: 'Brand Settings', view: 'settings', icon: <Settings size={13} /> },
  { name: 'Admins & Roles', view: 'admins', icon: <ShieldAlert size={13} /> },
  { name: 'System Logs', view: 'logs', icon: <FileClock size={13} /> },
  { name: 'Backups', view: 'backups', icon: <Database size={13} /> }
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
      <aside className="w-full md:w-64 bg-bg-luxury border-b md:border-b-0 md:border-r border-neutral-soft/60 flex flex-col pt-10 pb-6">
        <div className="px-6 mb-8 text-left">
          <Link href="/admin?view=dashboard" className="text-base font-editorial tracking-[0.25em] font-semibold text-fg-luxury uppercase">
            FREERT CORE
          </Link>
          <p className="text-[7.5px] uppercase tracking-widest text-text-muted mt-1 font-medium">Control Operations System</p>
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
