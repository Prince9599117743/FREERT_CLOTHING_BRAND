'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories, getCollections } from '@/services/database';
import { Category, Collection } from '@/types';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAllCategories([]);
      setAllCollections([]);
      
      getCategories()
        .then(list => setAllCategories(list))
        .catch(err => console.error('Error fetching categories in MegaMenu:', err));

      getCollections()
        .then(list => setAllCollections(list))
        .catch(err => console.error('Error fetching collections in MegaMenu:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Top-level departments (no parent)
  const departments = allCategories.filter(c => !c.parentCategory);

  // Fallback if DB not populated yet
  const fallbackDepts = [
    { id: 'men', name: 'Men', slug: 'men', createdAt: '' },
    { id: 'women', name: 'Women', slug: 'women', createdAt: '' },
    { id: 'accessories', name: 'Accessories', slug: 'accessories', createdAt: '' },
    { id: 'perfumes', name: 'Perfumes', slug: 'perfumes', createdAt: '' },
  ] as Category[];

  const activeDepts = departments.length > 0 ? departments : fallbackDepts;

  // Get subcategories for a department slug
  const getSubsForDept = (deptSlug: string) => {
    const subs = allCategories.filter(c => c.parentCategory === deptSlug);
    return subs.length > 0 ? subs : [];
  };

  return (
    <div 
      onMouseLeave={onClose}
      className="absolute left-0 w-full bg-bg-luxury border-b border-neutral-soft/50 shadow-sm z-40 py-16 px-12 md:px-24 flex justify-center animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="max-w-7xl w-full grid gap-12 text-left"
        style={{ gridTemplateColumns: `repeat(${Math.min(activeDepts.length + (allCollections.length > 0 ? 2 : 1), 6)}, 1fr)` }}
      >
        {activeDepts.map(dept => {
          const subs = getSubsForDept(dept.slug);
          return (
            <div key={dept.id}>
              <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 pb-1.5 border-b border-neutral-soft/30">
                <Link href={`/shop/${dept.slug}`} onClick={onClose} className="hover:text-accent-gold transition-colors">
                  {dept.name}
                </Link>
              </h4>
              <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
                {subs.length > 0 ? (
                  subs.map(sub => (
                    <li key={sub.id}>
                      <Link href={`/shop/${dept.slug}/${sub.slug}`} onClick={onClose} className="hover:text-accent-gold transition-colors block">
                        {sub.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link href={`/shop/${dept.slug}`} onClick={onClose} className="hover:text-accent-gold transition-colors block">
                      View All
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          );
        })}

        {/* Dynamic Collections Column */}
        {allCollections.length > 0 && (
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 pb-1.5 border-b border-neutral-soft/30">
              Collections
            </h4>
            <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
              {allCollections.map(coll => (
                <li key={coll.id}>
                  <Link href={`/shop?collection=${coll.slug}`} onClick={onClose} className="hover:text-accent-gold transition-colors block font-medium">
                    {coll.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Campaign banner — always last */}
        <div className="bg-neutral-soft/10 p-6 flex flex-col justify-between border border-neutral-soft/60 aspect-[4/5] max-w-[220px]">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-2 font-medium">Spotlight Edit</p>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">The Tailoring Craft</h5>
          </div>
          <Link 
            href="/shop" 
            onClick={onClose}
            className="text-[9px] uppercase tracking-[0.2em] font-medium text-fg-luxury border-b border-fg-luxury pb-1 self-start hover:text-accent-gold hover:border-accent-gold transition-all"
          >
            Explore
          </Link>
        </div>

      </div>
    </div>
  );
};
