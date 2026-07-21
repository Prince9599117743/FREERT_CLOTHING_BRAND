'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Folder, FileText, Search, Grid, List, Trash2, Plus, Download, Image as ImageIcon, Video, Star } from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: string;
  folder: string;
  type: 'image' | 'video' | 'asset';
  createdAt: string;
}

const INITIAL_MEDIA: MediaFile[] = [
  { id: 'm-1', name: 'trench_coat.jpg', url: '/assets/trench_coat.jpg', size: '240 KB', folder: 'Campaign Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-2', name: 'slip_dress.jpg', url: '/assets/slip_dress.jpg', size: '185 KB', folder: 'Product Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-3', name: 'kimono_shirt.jpg', url: '/assets/kimono_shirt.jpg', size: '310 KB', folder: 'Product Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-4', name: 'silk_trouser.jpg', url: '/assets/silk_trouser.jpg', size: '140 KB', folder: 'Campaign Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-5', name: 'knit_hoodie.jpg', url: '/assets/knit_hoodie.jpg', size: '290 KB', folder: 'Product Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-6', name: 'cap_1784646670746.png', url: '/assets/cap_1784646670746.png', size: '95 KB', folder: 'Hero Banners', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-7', name: 'sneakers_1784646656235.png', url: '/assets/sneakers_1784646656235.png', size: '178 KB', folder: 'Product Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-8', name: 'cargo_pants_1784646641064.png', url: '/assets/cargo_pants_1784646641064.png', size: '112 KB', folder: 'Product Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-9', name: 'hoodie_black_1784646596372.png', url: '/assets/hoodie_black_1784646596372.png', size: '160 KB', folder: 'Hero Banners', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-10', name: 'jacket_neon_1784646612273.png', url: '/assets/jacket_neon_1784646612273.png', size: '215 KB', folder: 'Product Images', type: 'image', createdAt: '2026-07-21' },
  { id: 'm-11', name: 'brand_logo_dark.png', url: '/assets/tee_white.jpg', size: '12 KB', folder: 'Brand Assets', type: 'image', createdAt: '2026-07-21' }
];

const FOLDERS = [
  'Hero Banners',
  'Collection Banners',
  'Product Images',
  'Campaign Images',
  'Videos',
  'Brand Assets',
  'Icons'
];

export default function MediaLibraryPage() {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState<MediaFile[]>(INITIAL_MEDIA);
  const [selectedFolder, setSelectedFolder] = useState<string>('Product Images');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Filtered files
  const filteredFiles = mediaList.filter(f => 
    f.folder === selectedFolder && 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteFile = (id: string, name: string) => {
    setMediaList(prev => prev.filter(f => f.id !== id));
    showToast(`Removed file: ${name}`, 'info');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newFile: MediaFile = {
        id: `m-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        url: '/assets/tee_white.jpg', // simulate local uploaded reference
        size: `${(file.size / 1024).toFixed(0)} KB`,
        folder: selectedFolder,
        type: file.type.includes('video') ? 'video' : 'image',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setMediaList(prev => [newFile, ...prev]);
      showToast(`Uploaded file: ${file.name} to ${selectedFolder}`, 'success');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const newFile: MediaFile = {
        id: `m-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        url: '/assets/tee_white.jpg',
        size: `${(file.size / 1024).toFixed(0)} KB`,
        folder: selectedFolder,
        type: 'image',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setMediaList(prev => [newFile, ...prev]);
      showToast(`Dropped & uploaded: ${file.name} to ${selectedFolder}`, 'success');
    }
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Media Library</h1>
          <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Upload and manage reusable visual assets</p>
        </div>
        <label className="btn-editorial-solid text-[10px] tracking-widest py-3 px-8 flex items-center gap-2 cursor-pointer font-medium">
          <Plus size={14} /> Upload Asset
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Folders Menu (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-3.5 bg-bg-luxury border border-neutral-soft/80 p-5">
          <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold pb-2 border-b border-neutral-soft/30">
            Navigation Folders
          </span>
          <div className="flex flex-col gap-1">
            {FOLDERS.map((f) => {
              const fileCount = mediaList.filter(file => file.folder === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  className={`w-full flex justify-between items-center text-[10.5px] uppercase tracking-wider py-2 px-3 transition-colors ${selectedFolder === f ? 'bg-fg-luxury text-bg-luxury font-medium' : 'text-text-muted hover:text-fg-luxury hover:bg-neutral-soft/20'}`}
                >
                  <span className="flex items-center gap-2">
                    <Folder size={13} /> {f}
                  </span>
                  <span className="text-[9px] opacity-80">({fileCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Files Workspace (Col span 9) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Header controls bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-bg-luxury border border-neutral-soft/80 p-4 gap-4">
            <div className="relative w-full sm:max-w-xs flex items-center border-b border-neutral-soft pb-1">
              <Search size={14} className="text-text-muted mr-2" />
              <input 
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[11px] focus:outline-none w-full text-fg-luxury font-light placeholder-neutral-400"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[9px] uppercase tracking-widest text-text-muted">
                Showing {filteredFiles.length} files in {selectedFolder}
              </span>
              <div className="flex border border-neutral-soft/80">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-fg-luxury text-bg-luxury' : 'text-text-muted hover:text-fg-luxury'}`}
                >
                  <Grid size={13} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-fg-luxury text-bg-luxury' : 'text-text-muted hover:text-fg-luxury'}`}
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Drag and Drop Zone Container */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`min-h-[350px] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-colors ${dragActive ? 'border-accent-gold bg-accent-gold/5' : 'border-neutral-soft/80 bg-neutral-soft/5'}`}
          >
            {filteredFiles.length === 0 ? (
              <div className="text-center flex flex-col items-center gap-3">
                <ImageIcon size={36} className="text-neutral-400 stroke-[1.2]" />
                <p className="text-xs text-text-muted uppercase tracking-wider font-light">Drag files here or select upload</p>
              </div>
            ) : (
              viewMode === 'grid' ? (
                /* Grid view display */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full text-left">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="group bg-bg-luxury border border-neutral-soft/80 p-3 relative flex flex-col gap-2.5">
                      <div className="aspect-square bg-neutral-soft/30 overflow-hidden relative">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-1.5 bg-red-800 text-white rounded-full hover:bg-red-900 cursor-pointer"
                            aria-label={`Delete ${file.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] uppercase font-semibold text-fg-luxury truncate">{file.name}</p>
                        <span className="text-[8px] text-text-muted uppercase tracking-wider">{file.size} · {file.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List view display */
                <div className="flex flex-col gap-2 w-full text-left">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex justify-between items-center text-xs border border-neutral-soft/80 bg-bg-luxury p-3 text-text-muted">
                      <div className="flex items-center gap-3">
                        <Folder size={14} className="text-accent-gold" />
                        <span className="font-semibold text-fg-luxury">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span>{file.size}</span>
                        <span>{file.createdAt}</span>
                        <button 
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
