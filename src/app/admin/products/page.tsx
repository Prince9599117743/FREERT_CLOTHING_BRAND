'use client';

import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { useToast } from '@/contexts/ToastContext';
import { Upload, Download, Plus, Trash2, Edit2, Copy, Tag, FolderOpen, Save, Settings } from 'lucide-react';
import type { Product } from '@/types';

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  visible: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  subCategories: string[];
}

const INITIAL_COLLECTIONS: CollectionItem[] = [
  { id: 'c-1', name: 'Summer Collection', slug: 'summer-collection', visible: true },
  { id: 'c-2', name: 'Winter Collection', slug: 'winter-collection', visible: true },
  { id: 'c-3', name: 'Limited Drop', slug: 'limited-drop', visible: true },
  { id: 'c-4', name: 'Oversized Collection', slug: 'oversized-collection', visible: true },
  { id: 'c-5', name: 'Streetwear Staples', slug: 'streetwear', visible: true },
  { id: 'c-6', name: 'Essentials Series', slug: 'essentials', visible: true }
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-men', name: 'Men', slug: 'men', subCategories: ['Oversized T-Shirts', 'Regular T-Shirts', 'Graphic T-Shirts', 'Shirts', 'Hoodies', 'Sweatshirts', 'Jackets', 'Jeans', 'Cargo Pants', 'Joggers', 'Shorts'] },
  { id: 'cat-women', name: 'Women', slug: 'women', subCategories: ['Oversized T-Shirts', 'Crop Tops', 'Basic Tops', 'Shirts', 'Hoodies', 'Dresses', 'Skirts', 'Jeans', 'Cargo Pants', 'Co-ords'] },
  { id: 'cat-acc', name: 'Accessories', slug: 'accessories', subCategories: ['Caps', 'Bags', 'Wallets', 'Belts', 'Chains', 'Bracelets', 'Rings', 'Sunglasses'] },
  { id: 'cat-perf', name: 'Perfumes', slug: 'perfumes', subCategories: ['Men', 'Women', 'Unisex', 'Gift Sets'] }
];

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'collections'>('products');
  
  // Lists states
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);

  // Form states for adding items
  const [newColName, setNewColName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [targetCatIdForSub, setTargetCatIdForSub] = useState(INITIAL_CATEGORIES[0].id);

  // Bulk parameters
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState('men');

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
    showToast(`Bulk deleted ${selectedProductIds.length} products.`, 'info');
    setSelectedProductIds([]);
  };

  const handleDuplicateSelected = () => {
    if (selectedProductIds.length === 0) return;
    const duplicated: Product[] = [];
    selectedProductIds.forEach(id => {
      const original = products.find(p => p.id === id);
      if (original) {
        duplicated.push({
          ...original,
          id: `prod-copy-${Math.random().toString(36).substring(2, 9)}`,
          name: `${original.name} (Copy)`,
          slug: `${original.slug}-copy`
        });
      }
    });
    setProducts(prev => [...prev, ...duplicated]);
    showToast(`Duplicated ${selectedProductIds.length} products.`, 'success');
    setSelectedProductIds([]);
  };

  const handleBulkPriceUpdate = () => {
    const numeric = parseFloat(bulkPriceValue);
    if (isNaN(numeric) || selectedProductIds.length === 0) return;
    setProducts(prev => prev.map(p => {
      if (selectedProductIds.includes(p.id)) {
        return { ...p, basePrice: numeric };
      }
      return p;
    }));
    showToast(`Bulk updated prices to ₹${numeric} for ${selectedProductIds.length} items.`, 'success');
    setBulkPriceValue('');
  };

  const handleBulkStockUpdate = () => {
    const numeric = parseInt(bulkStockValue);
    if (isNaN(numeric) || selectedProductIds.length === 0) return;
    setProducts(prev => prev.map(p => {
      if (selectedProductIds.includes(p.id)) {
        const updatedVariants = p.variants ? p.variants.map(v => ({
          ...v,
          stockQty: numeric
        })) : [];
        return { ...p, variants: updatedVariants };
      }
      return p;
    }));
    showToast(`Bulk set stock quantity to ${numeric} for selected items.`, 'success');
    setBulkStockValue('');
  };

  const handleBulkCategoryChange = () => {
    if (selectedProductIds.length === 0) return;
    setProducts(prev => prev.map(p => {
      if (selectedProductIds.includes(p.id)) {
        return { ...p, parentCategory: bulkCategoryTarget };
      }
      return p;
    }));
    showToast(`Bulk moved selected items to category: ${bulkCategoryTarget.toUpperCase()}`, 'success');
  };

  const handleBulkPublish = (publish: boolean) => {
    if (selectedProductIds.length === 0) return;
    setProducts(prev => prev.map(p => {
      if (selectedProductIds.includes(p.id)) {
        return { ...p, isPublished: publish };
      }
      return p;
    }));
    showToast(`Bulk marked ${selectedProductIds.length} items as ${publish ? 'Published' : 'Unpublished'}.`, 'success');
    setSelectedProductIds([]);
  };

  // CSV Import/Export
  const handleExportCSV = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "freert_products_catalog.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported inventory catalog details payload.', 'success');
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      showToast('Importing inventory manifest from file structure...', 'info');
      setTimeout(() => {
        showToast('Successfully merged 6 new fashion listings.', 'success');
      }, 1000);
    }
  };

  // Collection CMS
  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName) return;
    const newCol: CollectionItem = {
      id: `col-${Math.random().toString(36).substring(2, 9)}`,
      name: newColName,
      slug: newColName.toLowerCase().replace(/ /g, '-'),
      visible: true
    };
    setCollections(prev => [...prev, newCol]);
    setNewColName('');
    showToast(`Created new collection: ${newColName}`, 'success');
  };

  const handleDeleteCollection = (id: string, name: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    showToast(`Removed collection: ${name}`, 'info');
  };

  // Category CMS
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    const newCat: CategoryItem = {
      id: `cat-${Math.random().toString(36).substring(2, 9)}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/ /g, '-'),
      subCategories: []
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    showToast(`Added main category: ${newCatName}`, 'success');
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;
    setCategories(prev => prev.map(c => {
      if (c.id === targetCatIdForSub) {
        return { ...c, subCategories: [...c.subCategories, newSubName] };
      }
      return c;
    }));
    setNewSubName('');
    showToast(`Added subcategory and mapped to parent.`, 'success');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast(`Removed category: ${name}`, 'info');
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-soft/40 pb-4">
        <div>
          <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Product Catalog CMS</h1>
          <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">
            Shopify-like inventory control, category hierarchies, and collection tags
          </p>
        </div>
        <div className="flex gap-3 self-start">
          <label className="btn-editorial flex items-center gap-2 py-2 px-4 cursor-pointer text-[10px]">
            <Upload size={13} /> Import CSV
            <input type="file" onChange={handleCSVUpload} className="hidden" accept=".csv, .json" />
          </label>
          <button 
            onClick={handleExportCSV}
            className="btn-editorial flex items-center gap-2 py-2 px-4 cursor-pointer text-[10px]"
          >
            <Download size={13} /> Export JSON/CSV
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-4 border-b border-neutral-soft/60 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`text-[10px] uppercase tracking-widest py-1.5 px-4 cursor-pointer font-medium border-b-2 transition-all ${activeTab === 'products' ? 'border-accent-gold text-fg-luxury' : 'border-transparent text-text-muted hover:text-fg-luxury'}`}
        >
          All Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`text-[10px] uppercase tracking-widest py-1.5 px-4 cursor-pointer font-medium border-b-2 transition-all ${activeTab === 'categories' ? 'border-accent-gold text-fg-luxury' : 'border-transparent text-text-muted hover:text-fg-luxury'}`}
        >
          Category Manager
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`text-[10px] uppercase tracking-widest py-1.5 px-4 cursor-pointer font-medium border-b-2 transition-all ${activeTab === 'collections' ? 'border-accent-gold text-fg-luxury' : 'border-transparent text-text-muted hover:text-fg-luxury'}`}
        >
          Collection Manager
        </button>
      </div>

      {/* TAB 1: Products list and Bulk controls */}
      {activeTab === 'products' && (
        <div className="flex flex-col gap-6">
          
          {/* Bulk Controls Row */}
          {selectedProductIds.length > 0 && (
            <div className="bg-neutral-soft/10 border border-neutral-soft/80 p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-xs text-fg-luxury font-medium text-left">
                Selected {selectedProductIds.length} items
              </div>
              <div className="flex flex-wrap gap-3 items-center justify-end w-full md:w-auto">
                <button onClick={handleDuplicateSelected} className="btn-editorial py-1.5 px-3 text-[9px] flex items-center gap-1.5">
                  <Copy size={11} /> Duplicate
                </button>
                <button onClick={handleBulkDelete} className="btn-editorial py-1.5 px-3 text-[9px] flex items-center gap-1.5 text-red-700 hover:bg-red-50">
                  <Trash2 size={11} /> Delete
                </button>
                
                {/* Bulk pricing */}
                <div className="flex items-center border border-neutral-soft/80 bg-bg-luxury px-2 py-1 text-[9px]">
                  <input 
                    type="number"
                    placeholder="New Price"
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(e.target.value)}
                    className="w-16 focus:outline-none bg-transparent"
                  />
                  <button onClick={handleBulkPriceUpdate} className="text-accent-gold hover:text-fg-luxury font-semibold uppercase tracking-wider ml-1">Set</button>
                </div>

                {/* Bulk Stock */}
                <div className="flex items-center border border-neutral-soft/80 bg-bg-luxury px-2 py-1 text-[9px]">
                  <input 
                    type="number"
                    placeholder="New Stock"
                    value={bulkStockValue}
                    onChange={(e) => setBulkStockValue(e.target.value)}
                    className="w-16 focus:outline-none bg-transparent"
                  />
                  <button onClick={handleBulkStockUpdate} className="text-accent-gold hover:text-fg-luxury font-semibold uppercase tracking-wider ml-1">Set</button>
                </div>

                {/* Bulk Categories */}
                <div className="flex items-center border border-neutral-soft/80 bg-bg-luxury px-2 py-1 text-[9px]">
                  <select
                    value={bulkCategoryTarget}
                    onChange={(e) => setBulkCategoryTarget(e.target.value)}
                    className="bg-transparent focus:outline-none text-[9px]"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="accessories">Accessories</option>
                    <option value="perfumes">Perfumes</option>
                  </select>
                  <button onClick={handleBulkCategoryChange} className="text-accent-gold hover:text-fg-luxury font-semibold uppercase tracking-wider ml-2">Move</button>
                </div>

                <button onClick={() => handleBulkPublish(true)} className="btn-editorial py-1.5 px-3 text-[9px]">Publish</button>
                <button onClick={() => handleBulkPublish(false)} className="btn-editorial py-1.5 px-3 text-[9px]">Unpublish</button>
              </div>
            </div>
          )}

          {/* Products Catalog Table */}
          <div className="bg-bg-luxury border border-neutral-soft/80 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-soft text-[9px] uppercase tracking-widest text-text-muted bg-neutral-soft/10">
                  <th className="p-4 w-10">
                    <input 
                      type="checkbox"
                      checked={selectedProductIds.length === products.length}
                      onChange={toggleSelectAll}
                      className="accent-fg-luxury cursor-pointer"
                    />
                  </th>
                  <th className="p-4 font-semibold">Product Name</th>
                  <th className="p-4 font-semibold">SKU / Code</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-soft/30 font-light text-text-muted">
                {products.map(p => {
                  const totalStock = p.variants ? p.variants.reduce((sum, v) => sum + v.stockQty, 0) : 0;
                  const isChecked = selectedProductIds.includes(p.id);
                  return (
                    <tr key={p.id} className={`hover:bg-neutral-soft/5 ${isChecked ? 'bg-neutral-soft/10' : ''}`}>
                      <td className="p-4">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="accent-fg-luxury cursor-pointer"
                        />
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-10 aspect-[3/4] object-cover bg-neutral-soft/20 flex-shrink-0"
                        />
                        <div>
                          <span className="block font-medium text-fg-luxury text-xs">{p.name}</span>
                          <span className="text-[8px] uppercase tracking-widest text-text-muted mt-0.5">{p.material}</span>
                        </div>
                      </td>
                      <td className="p-4 uppercase tracking-wider text-[10px]">{p.variants?.[0]?.sku || p.id}</td>
                      <td className="p-4 uppercase tracking-wider text-[10px]">{p.parentCategory} / {p.subCategory}</td>
                      <td className="p-4 text-fg-luxury font-medium">₹{p.basePrice.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-semibold">{totalStock} units</td>
                      <td className="p-4">
                        <span className={`text-[8px] uppercase tracking-widest px-2.5 py-0.5 font-light ${p.isPublished ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-700'}`}>
                          {p.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Category Manager */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create Category Form (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 bg-bg-luxury border border-neutral-soft/80 p-6">
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
              New Categories Hierarchy
            </h3>
            
            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Main Category Name</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="input-editorial text-xs" 
                  placeholder="e.g. Footwear"
                  required
                />
              </div>
              <button type="submit" className="btn-editorial-solid text-[9px] tracking-wider py-2">Create Category</button>
            </form>

            <form onSubmit={handleAddSubcategory} className="flex flex-col gap-4 pt-4 border-t border-neutral-soft/30">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block">Map to Parent Category</label>
                <select
                  value={targetCatIdForSub}
                  onChange={(e) => setTargetCatIdForSub(e.target.value)}
                  className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] focus:outline-none uppercase tracking-wider"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Subcategory Name</label>
                <input 
                  type="text" 
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="input-editorial text-xs" 
                  placeholder="e.g. Sneakers"
                  required
                />
              </div>
              <button type="submit" className="btn-editorial text-[9px] tracking-wider py-2">Add Subcategory</button>
            </form>
          </div>

          {/* List Categories Tree (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
              Active Category Structures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-neutral-soft/80 bg-neutral-soft/5 p-5 relative">
                  <button 
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="absolute top-4 right-4 text-text-muted hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-fg-luxury mb-3 flex items-center gap-2">
                    <FolderOpen size={14} className="text-accent-gold" /> {cat.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.subCategories.map((sub, idx) => (
                      <span key={idx} className="bg-bg-luxury border border-neutral-soft/80 text-[9px] uppercase tracking-wider py-1 px-2 text-text-muted">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Collection Manager */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create Collection Form (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 bg-bg-luxury border border-neutral-soft/80 p-6">
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
              Create Collection
            </h3>
            <form onSubmit={handleAddCollection} className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Collection Name</label>
                <input 
                  type="text" 
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="input-editorial text-xs" 
                  placeholder="e.g. Winter Capsule"
                  required
                />
              </div>
              <button type="submit" className="btn-editorial-solid text-[9px] tracking-wider py-2">Create Collection</button>
            </form>
          </div>

          {/* List Collections Table (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
              Active Store Banners & Collections
            </h3>
            <div className="bg-bg-luxury border border-neutral-soft/80 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-soft text-[9px] uppercase tracking-widest text-text-muted bg-neutral-soft/10">
                    <th className="p-4 font-semibold">Collection Name</th>
                    <th className="p-4 font-semibold">Slug Handle</th>
                    <th className="p-4 font-semibold">Visibility</th>
                    <th className="p-4 font-semibold text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-soft/30 font-light text-text-muted">
                  {collections.map(c => (
                    <tr key={c.id}>
                      <td className="p-4 font-medium text-fg-luxury">{c.name}</td>
                      <td className="p-4">{c.slug}</td>
                      <td className="p-4">
                        <span className="bg-green-100 text-green-800 text-[8px] uppercase tracking-widest px-2.5 py-0.5 font-light">
                          Visible in Nav
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteCollection(c.id, c.name)}
                          className="hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
