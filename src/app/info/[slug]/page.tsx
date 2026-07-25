'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useToast } from '@/contexts/ToastContext';
import { Mail, Phone, Compass, HelpCircle } from 'lucide-react';

interface InfoPageContent {
  title: string;
  content: string;
}

const DEFAULT_PAGES: Record<string, InfoPageContent> = {
  about: {
    title: 'About FREERT',
    content: 'FREERT is a contemporary luxury design house founded on the principles of structural minimalism and organic materiality. We curate architectural clothing cut from organic flax linen, handspun cotton weaves, and raw mulberry silks. Every silhouette is designed in-house, balancing fluid geometries with clean, structured forms. Designed for the modern wardrobe workspace, our garments are manufactured in small, slow-batch runs of under 50 articles per design, eliminating excessive retail waste. Our mission is pure form, zero clutter. Be you. Be bold. Be FREERT.'
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: 'We take data integrity seriously. This policy describes how we collect, store, and manage your contact parameters during site navigation. We only capture standard logs needed to process delivery dispatches and secure checkout payments. Your data is encrypted using SSL handshakes and is never shared. For data queries, contact us at freertofficial@gmail.com.'
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    content: 'All visual lookbooks, product designs, textiles, photography, codebases, and brand graphics on this platform are protected under intellectual property and copyright laws. All rights reserved by FREERT. Orders are processed based on available batch inventory limits. We reserve the right to configure or terminate links at our discretion.'
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    content: 'All orders are dispatched from our regional fulfillment centers. We provide complimentary express shipping for all orders. Packages are typically dispatched within 48 hours and arrive within 3 to 5 business days. A tracking number will be sent to your registered coordinates as soon as the courier partner scans the parcel.'
  },
  'refund-policy': {
    title: 'Refund Policy',
    content: 'We offer a strict 7-day return and exchange window from the date of consignment delivery. In order to process an exchange or refund, the customer must coordinate and schedule the return shipping back to our logistics hub. Items must be returned in their original, pristine condition: unworn, unwashed, with all original security tags intact, and in their original packaging box. Any products that are returned damaged, worn, or with missing tags will not be eligible for a refund. To initiate a return, email us at freertofficial@gmail.com or call +91 84680 17123.'
  },
  'return-exchange': {
    title: 'Return & Exchange Policy',
    content: 'We offer a strict 7-day return and exchange window. To submit a return request, navigate to your order history panel in the dashboard or contact our concierge. Return packages must be unworn, unwashed, and in their original packaging. The customer must coordinate the return delivery back to our Delhi headquarters.'
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    content: 'Orders can be cancelled directly from the user dashboard before dispatch operations begin (typically within 12 hours of placing the order). Once an order has been marked as shipped, cancellations are no longer possible, and the standard 7-day return protocol must be followed.'
  },
  'care-guide': {
    title: 'Garment Care Guide',
    content: 'Our linens and raw silks are made to last. We recommend cold hand washing or machine washing on a delicate cycle using mild, organic detergents. Avoid tumble dryers; instead, line dry in the shade to maintain organic flax textures. Iron on medium heat while slightly damp.'
  }
};

export default function InfoPage() {
  const { slug } = useParams();
  const { showToast } = useToast();
  const router = useRouter();
  
  const pageKey = typeof slug === 'string' ? slug : 'about';
  const [page, setPage] = useState<InfoPageContent | null>(null);

  // Form states (For contact page)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  useEffect(() => {
    // Read from localStorage to check for CMS edits first
    const savedCMS = localStorage.getItem('freert_cms_pages');
    let pages = DEFAULT_PAGES;
    if (savedCMS) {
      try {
        const parsed = JSON.parse(savedCMS);
        pages = { ...DEFAULT_PAGES, ...parsed };
      } catch (e) {
        pages = DEFAULT_PAGES;
      }
    }

    if (pages[pageKey]) {
      setPage(pages[pageKey]);
    } else if (pageKey === 'contact') {
      setPage({ title: 'Contact Us', content: 'Get in touch with our concierge team.' });
    } else if (pageKey === 'faq') {
      setPage({ title: 'Frequently Asked Questions', content: 'Common inquiries regarding collections, shipping, and customization.' });
    } else if (pageKey === 'size-guide') {
      setPage({ title: 'Size Guide', content: 'Sizing matrix for our structured, relaxed silhouetted garments.' });
    } else {
      setPage({ title: 'Page Not Found', content: 'The requested policy node could not be loaded.' });
    }
  }, [pageKey]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Thank you. Your message has been sent successfully.`, 'success');
    setContactName('');
    setContactEmail('');
    setContactMsg('');
  };

  if (!page) return null;

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20 text-left">
        {/* Back link */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted hover:text-fg-luxury mb-8 transition-colors cursor-pointer"
        >
          &larr; Back to Shop
        </button>

        <h1 className="text-3xl font-light uppercase tracking-widest mb-10 text-fg-luxury">{page.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Main Description */}
          <div className="lg:col-span-8 flex flex-col gap-6 text-sm text-text-muted leading-relaxed font-light">
            <p className="whitespace-pre-line">{page.content}</p>

            {/* Special layouts depending on page key */}
            {pageKey === 'contact' && (
              <div className="mt-8 border border-neutral-soft/80 p-8 bg-neutral-soft/10">
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Name Identifier</label>
                    <input 
                      type="text" 
                      required 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input-editorial"
                      placeholder=" Aryan Dev"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Comms Address</label>
                    <input 
                      type="email" 
                      required 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="input-editorial"
                      placeholder="aryan@dev.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Message Payload</label>
                    <textarea 
                      required 
                      rows={4}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="input-editorial h-28 resize-none"
                      placeholder="Detail your parameters enquiry..."
                    />
                  </div>
                  <button 
                    type="submit"
                    className="btn-editorial-solid w-full text-xs tracking-[0.2em] font-medium py-3.5 cursor-pointer"
                  >
                    Submit Message
                  </button>
                </form>
              </div>
            )}

            {pageKey === 'faq' && (
              <div className="mt-8 flex flex-col gap-6">
                {[
                  { q: 'How do clothing batches work?', a: 'To prevent excess inventory waste, each garment edit is limited to a batch production run of 50 units. Once a batch sells out, we configure waitlists for the next release.' },
                  { q: 'What are your shipping times?', a: 'Orders are processed and dispatched within 24-48 hours. Standard delivery takes 3-5 business days, while Express shipping delivers in 1-2 business days.' },
                  { q: 'How do returns work?', a: 'Returns are complimentary within 14 days. Simply log a return in your account dashboard and our logistics partner will arrange a doorstep pick-up.' }
                ].map((item, idx) => (
                  <div key={idx} className="border-b border-neutral-soft/40 pb-5">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-fg-luxury mb-2">{item.q}</h4>
                    <p className="text-xs text-text-muted font-light leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            )}

            {pageKey === 'size-guide' && (
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-neutral-soft/80">
                  <thead>
                    <tr className="bg-neutral-soft/10 text-[9px] uppercase tracking-widest text-text-muted border-b border-neutral-soft/80">
                      <th className="p-4 border-r border-neutral-soft/80">Size</th>
                      <th className="p-4 border-r border-neutral-soft/80">Chest (Inches)</th>
                      <th className="p-4 border-r border-neutral-soft/80">Waist (Inches)</th>
                      <th className="p-4">Sleeve Length (Inches)</th>
                    </tr>
                  </thead>
                  <tbody className="font-light divide-y divide-neutral-soft/40 text-text-muted">
                    <tr>
                      <td className="p-4 border-r border-neutral-soft/80 font-medium text-fg-luxury">S</td>
                      <td className="p-4 border-r border-neutral-soft/80">35 - 37</td>
                      <td className="p-4 border-r border-neutral-soft/80">29 - 31</td>
                      <td className="p-4">32.5</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-r border-neutral-soft/80 font-medium text-fg-luxury">M</td>
                      <td className="p-4 border-r border-neutral-soft/80">38 - 40</td>
                      <td className="p-4 border-r border-neutral-soft/80">32 - 34</td>
                      <td className="p-4">33.5</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-r border-neutral-soft/80 font-medium text-fg-luxury">L</td>
                      <td className="p-4 border-r border-neutral-soft/80">41 - 43</td>
                      <td className="p-4 border-r border-neutral-soft/80">35 - 37</td>
                      <td className="p-4">34.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar coordinates info */}
          <div className="lg:col-span-4 flex flex-col gap-6 text-xs text-text-muted">
            <div className="p-6 border border-neutral-soft/60">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
                Operations Coordinates
              </h4>
              <ul className="space-y-4 font-light leading-relaxed">
                <li className="flex items-start gap-3">
                  <Compass size={16} className="text-accent-gold mt-0.5 flex-shrink-0" />
                  <span>FREERT Headquarters, New Delhi, India</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-accent-gold mt-0.5 flex-shrink-0" />
                  <span>freertofficial@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={16} className="text-accent-gold mt-0.5 flex-shrink-0" />
                  <span>+91 84680 17123</span>
                </li>
              </ul>
            </div>
            
            {/* Quick links */}
            <div className="p-6 border border-neutral-soft/60">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
                Policy Directory
              </h4>
              <ul className="space-y-2.5 font-light uppercase tracking-wider text-[9px]">
                <li><Link href="/info/privacy-policy" className="hover:text-accent-gold transition-colors">Privacy Policy</Link></li>
                <li><Link href="/info/terms-conditions" className="hover:text-accent-gold transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/info/shipping-policy" className="hover:text-accent-gold transition-colors">Shipping Policy</Link></li>
                <li><Link href="/info/refund-policy" className="hover:text-accent-gold transition-colors">Refund Policy</Link></li>
                <li><Link href="/info/return-exchange" className="hover:text-accent-gold transition-colors">Return Policy</Link></li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
