'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  getOrders, getAddresses, saveAddress, deleteAddress, updateOrderDetails, getCleanOrderNumber, getCoupons, getUserSupportTickets
} from '@/services/database';
import type { Order, Address } from '@/types';
import { 
  Package, User, Star, Copy, Check, Edit2, Trash2, Plus, MapPin, 
  CreditCard, Calendar, Truck, Clipboard, ShieldAlert, LogOut, ArrowRight, ChevronRight, Tag, Gift, Printer, HelpCircle, MessageSquare
} from 'lucide-react';

interface OrderItemLog {
  name: string;
  qty: number;
  price: number;
  size: string;
  color: string;
  image: string;
  slug: string;
}

interface OrderLog {
  id: string;
  rawId: string;
  date: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  trackingNumber?: string;
  courierName?: string;
  expectedDeliveryDate?: string;
  cancelRequested?: boolean;
  cancelReason?: string;
  cancelRequestStatus?: string;
  cancelAdminNotes?: string;
  items: OrderItemLog[];
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'coupons' | 'payments' | 'support'>('profile');
  const [orders, setOrders] = useState<OrderLog[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [dbError, setDbError] = useState(false);

  // Profile Edit fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Add Form fields
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newAddressType, setNewAddressType] = useState<'shipping' | 'billing'>('shipping');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Cancellation Modal states
  const [cancellationOrderId, setCancellationOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Changed my mind');
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingCancellation, setIsSubmittingCancellation] = useState(false);

  // Coupon copying state
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  // Saved payments states
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);

  useEffect(() => {
    const localCards = localStorage.getItem('freert_saved_cards');
    if (localCards) {
      try {
        setSavedCards(JSON.parse(localCards));
      } catch (e) {}
    } else {
      const defaults = [
        { id: '1', number: '•••• •••• •••• 4242', brand: 'Visa', holder: 'HARSH SHARMA', expiry: '12/28' },
        { id: '2', number: '•••• •••• •••• 9876', brand: 'Mastercard', holder: 'HARSH SHARMA', expiry: '08/29' }
      ];
      setSavedCards(defaults);
      localStorage.setItem('freert_saved_cards', JSON.stringify(defaults));
    }

    const loadCoupons = async () => {
      try {
        const couponsList = await getCoupons();
        const activeOnly = couponsList.filter(c => c.isActive);
        setActiveCoupons(activeOnly);
      } catch (err) {
        console.error('Failed to load active coupons:', err);
      }
    };
    loadCoupons();
  }, []);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      showToast('Please fill all card details.', 'error');
      return;
    }
    const cleanedNumber = cardNumber.replace(/\s+/g, '');
    if (cleanedNumber.length < 12) {
      showToast('Invalid card number.', 'error');
      return;
    }

    setIsSavingCard(true);
    setTimeout(() => {
      const newCard = {
        id: String(Date.now()),
        number: `•••• •••• •••• ${cleanedNumber.substring(cleanedNumber.length - 4)}`,
        brand: cleanedNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        holder: cardHolder.toUpperCase(),
        expiry: cardExpiry
      };

      const updated = [...savedCards, newCard];
      setSavedCards(updated);
      localStorage.setItem('freert_saved_cards', JSON.stringify(updated));
      setIsAddingCard(false);
      
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
      
      setIsSavingCard(false);
      showToast('Card saved successfully.', 'success');
    }, 800);
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = savedCards.filter(c => c.id !== cardId);
    setSavedCards(updated);
    localStorage.setItem('freert_saved_cards', JSON.stringify(updated));
    showToast('Card removed successfully.', 'info');
  };

  // Fetch active tab from URL query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'addresses' || tab === 'profile' || tab === 'coupons' || tab === 'payments' || tab === 'support') {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Load profile inputs
  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditPhone(user.phone || '');
      fetchAddresses();
      fetchUserSupportTickets();
    }
    fetchUserOrders();
  }, [user]);

  const fetchUserSupportTickets = async () => {
    if (!user || !user.email) return;
    try {
      const response = await fetch(`/api/support/user-tickets?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('API_ERROR');
      const ticketsList = await response.json();
      setSupportTickets(ticketsList || []);
    } catch (e) {
      console.error('Failed to load user support tickets:', e);
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const data = await getAddresses(user.id);
      setAddresses(data);
    } catch (e) {
      console.error('Failed to load user addresses:', e);
    }
  };

  const fetchUserOrders = async () => {
    if (!user) {
      const saved = localStorage.getItem('freert_orders_log');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setOrders(list.map((o: any) => ({
            id: o.order_number ? String(o.order_number) : o.id,
            rawId: o.id,
            date: o.date,
            totalAmount: o.totalAmount,
            status: o.status,
            paymentMethod: o.paymentMethod,
            cancelRequested: o.cancelRequested || o.cancel_requested || false,
            cancelReason: o.cancelReason || o.cancel_reason || '',
            cancelRequestStatus: o.cancelRequestStatus || o.cancel_request_status || 'none',
            items: o.items ? o.items.map((i: any) => ({
              name: i.name,
              qty: i.qty,
              price: i.price,
              size: i.size,
              color: i.color,
              image: i.image || '/assets/trench_coat.jpg',
              slug: i.slug || ''
            })) : []
          })));
        } catch (e) {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
      return;
    }
    try {
      const data = await getOrders(user.id);
      const mapped: OrderLog[] = data.map((o: any) => ({
        id: getCleanOrderNumber(o.id).replace('#', ''),
        rawId: o.id,
        date: o.created_at?.split('T')[0] || '—',
        totalAmount: Number(o.total_amount || 0),
        status: o.status,
        paymentMethod: o.payment?.provider || 'COD',
        trackingNumber: o.tracking_number,
        courierName: o.courier_name,
        expectedDeliveryDate: o.expected_delivery_date,
        cancelRequested: o.cancel_requested,
        cancelReason: o.cancel_reason,
        cancelRequestStatus: o.cancel_request_status,
        cancelAdminNotes: o.cancel_admin_notes,
        items: o.items ? o.items.map((i: any) => ({
          name: i.product?.name || i.variant?.product?.name || 'Garment Article',
          qty: i.qty,
          price: Number(i.unit_price || 0),
          size: i.size || i.variant?.size || 'One Size',
          color: i.color || i.variant?.color || 'Default',
          image: i.product?.images?.[0] || i.variant?.product?.images?.[0] || '/assets/trench_coat.jpg',
          slug: i.product?.slug || i.variant?.product?.slug || ''
        })) : []
      }));
      setOrders(mapped);
    } catch (e: any) {
      if (e.message === 'DATABASE_CONNECTION_ERROR') {
        setDbError(true);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name is required.', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile(editName.trim(), editPhone.trim());
      showToast('Profile coordinates updated.', 'success');
      setIsEditingProfile(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newState.trim() || !newPostalCode.trim()) {
      showToast('Please populate all address details.', 'error');
      return;
    }
    if (!user) return;

    setIsSavingAddress(true);
    try {
      await saveAddress({
        userId: user.id,
        addressType: newAddressType,
        street: newStreet.trim(),
        city: newCity.trim(),
        state: newState.trim(),
        country: newCountry.trim(),
        postalCode: newPostalCode.trim(),
        isDefault: newIsDefault
      });
      showToast('Address coordinates registered.', 'success');
      setIsAddingAddress(false);
      // Clear inputs
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewPostalCode('');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to save address details.', 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddr = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to remove this address?');
    if (!confirm) return;

    try {
      await deleteAddress(id);
      showToast('Address details removed.', 'success');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to delete address.', 'error');
    }
  };

  const handleSubmitCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellationOrderId) return;

    const finalReason = cancellationReason === 'Other' ? customReason.trim() : cancellationReason;
    if (!finalReason) {
      showToast('Please enter a cancellation reason.', 'error');
      return;
    }

    setIsSubmittingCancellation(true);
    try {
      if (!user) {
        // Guest user: Update local storage log
        const localLogs = localStorage.getItem('freert_orders_log');
        if (localLogs) {
          const list = JSON.parse(localLogs);
          const updated = list.map((item: any) => {
            if (String(item.id) === cancellationOrderId || String(item.rawId) === cancellationOrderId) {
              return { 
                ...item, 
                cancelRequested: true, 
                cancelReason: finalReason, 
                cancelRequestStatus: 'pending' 
              };
            }
            return item;
          });
          localStorage.setItem('freert_orders_log', JSON.stringify(updated));
        }
      } else {
        await updateOrderDetails(cancellationOrderId, {
          cancelRequested: true,
          cancelReason: finalReason,
          cancelRequestStatus: 'pending'
        });
      }
      showToast('Cancellation request submitted.', 'success');
      setCancellationOrderId(null);
      setCustomReason('');
      fetchUserOrders();
    } catch (err) {
      showToast('Failed to request cancellation.', 'error');
    } finally {
      setIsSubmittingCancellation(false);
    }
  };

  const handleSignOutClick = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    router.push('/');
  };

  const getTimelineSteps = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') {
      return [
        { label: 'Ordered', done: true },
        { label: 'Packed', done: true },
        { label: 'Shipped', done: true },
        { label: 'Delivered', done: true }
      ];
    } else if (s === 'shipped') {
      return [
        { label: 'Ordered', done: true },
        { label: 'Packed', done: true },
        { label: 'Shipped', done: true },
        { label: 'Delivered', done: false }
      ];
    } else if (s === 'cancelled') {
      return [
        { label: 'Ordered', done: false },
        { label: 'Packed', done: false },
        { label: 'Cancelled', done: true, isCancel: true }
      ];
    } else {
      return [
        { label: 'Ordered', done: true },
        { label: 'Packed', done: true },
        { label: 'Shipped', done: false },
        { label: 'Delivered', done: false }
      ];
    }
  };

  if (dbError) {
    return (
      <div style={{ background: '#0a0a0a', color: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0, padding: 20, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontSize: 16 }}>System Maintenance</h2>
        <p style={{ color: '#888', fontSize: 12, maxWidth: 320, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>We are currently carrying out system updates. Services will resume shortly.</p>
        <div style={{ width: 20, height: 20, border: '1px solid #333', borderTop: '1px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <main className="flex-1 container-editorial py-12 md:py-20">
      <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-left mb-12 text-fg-luxury">My Account</h1>
      <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-neutral-soft/20 pb-4 mb-10 text-[9.5px] uppercase tracking-[0.2em] text-text-muted font-light justify-start">
        {[
          { key: 'profile', label: 'Personal Profile', icon: <User size={12} strokeWidth={1.5} /> },
          { key: 'orders', label: `My Orders (${orders.length})`, icon: <Package size={12} strokeWidth={1.5} /> },
          { key: 'addresses', label: `Saved Addresses (${addresses.length})`, icon: <MapPin size={12} strokeWidth={1.5} /> },
          { key: 'coupons', label: 'My Coupons', icon: <Tag size={12} strokeWidth={1.5} /> },
          { key: 'support', label: `My Enquiries (${supportTickets.length})`, icon: <MessageSquare size={12} strokeWidth={1.5} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActiveTab(tab.key as any); router.push(`/dashboard?tab=${tab.key}`); }}
            className={`flex items-center gap-2 pb-2 transition-all duration-300 border-b cursor-pointer whitespace-nowrap ${
              activeTab === tab.key 
                ? 'border-fg-luxury text-fg-luxury font-semibold' 
                : 'border-transparent hover:text-fg-luxury'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Dynamic Content area */}
      <div className="w-full text-left">
          
          {/* TAB 1: PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="border border-neutral-soft/50 p-6 md:p-8 bg-bg-luxury flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-center border-b border-neutral-soft/20 pb-3">
                <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">Personal Profile</h2>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-[9px] uppercase tracking-widest text-accent-gold hover:text-fg-luxury flex items-center gap-1 cursor-pointer transition-colors font-semibold"
                  >
                    <Edit2 size={10} /> Edit Coordinates
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 max-w-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-editorial text-xs py-2 px-3"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Phone coordinates (Optional)</label>
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="input-editorial text-xs py-2 px-3"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="flex gap-3 justify-end mt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProfile(false)}
                      className="btn-editorial py-2 px-4 text-[9px] uppercase tracking-widest border border-neutral-soft"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSavingProfile}
                      className="btn-editorial-solid py-2 px-6 text-[9px] uppercase tracking-widest font-semibold"
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs uppercase tracking-wider text-fg-luxury font-light">
                  <div className="border-b border-neutral-soft/10 pb-3">
                    <span className="text-[9px] text-text-muted font-normal block normal-case tracking-wider mb-1">Full Name</span> 
                    <span className="font-medium text-fg-luxury">{user?.fullName || 'N/A'}</span>
                  </div>
                  <div className="border-b border-neutral-soft/10 pb-3">
                    <span className="text-[9px] text-text-muted font-normal block normal-case tracking-wider mb-1">Email Coordinates</span> 
                    <span className="lowercase tracking-normal text-fg-luxury font-medium">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="border-b border-neutral-soft/10 pb-3 md:col-span-2">
                    <span className="text-[9px] text-text-muted font-normal block normal-case tracking-wider mb-1">Registered Phone</span> 
                    <span className="font-medium text-fg-luxury">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury border-b border-neutral-soft/40 pb-3 mb-2">Order History</h2>

              {orders.length === 0 ? (
                <div className="py-16 border border-dashed border-neutral-soft text-center text-xs text-text-muted uppercase tracking-widest font-light">
                  You have not placed any orders yet.
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {orders.map(order => (
                    <div key={order.rawId} className="border border-neutral-soft/50 p-6 flex flex-col gap-5 bg-bg-luxury hover:border-neutral-soft transition-colors duration-300">
                      
                      {/* Order Card header */}
                      <div className="flex justify-between items-start flex-wrap gap-4 pb-3 border-b border-neutral-soft/15">
                        <div className="flex flex-col gap-1 text-left">
                          <Link href={`/order/${order.rawId || order.id}`} className="text-xs uppercase tracking-wider font-semibold text-fg-luxury hover:text-accent-gold transition-colors flex items-center gap-1">
                            Order #{order.id} <ChevronRight size={12} />
                          </Link>
                          <span className="text-[8.5px] text-text-muted uppercase tracking-wider font-light flex items-center gap-1">
                            <Calendar size={10} /> Date: {order.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[8.5px] uppercase tracking-widest font-semibold py-1 px-3 border border-neutral-soft ${
                            order.status === 'delivered' 
                              ? 'bg-green-50 text-green-800' 
                              : order.status === 'cancelled' 
                              ? 'bg-red-50 text-red-800' 
                              : 'bg-amber-50 text-amber-800'
                          }`}>
                            {order.cancelRequested && order.cancelRequestStatus === 'pending' ? 'Cancellation Pending' : order.status}
                          </span>
                          
                          <button 
                             onClick={() => window.open(`/order/${order.rawId || order.id}/invoice`, '_blank')}
                             className="text-[8.5px] text-fg-luxury hover:text-accent-gold uppercase font-semibold border border-neutral-soft px-2.5 py-1 cursor-pointer transition-colors flex items-center gap-1"
                           >
                             <Printer size={10} /> Invoice
                           </button>

                          {/* Cancel Request Trigger button */}
                          {!order.cancelRequested && order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'shipped' && (
                            <button
                              type="button"
                              onClick={() => setCancellationOrderId(order.rawId)}
                              className="text-[8.5px] text-red-700 hover:text-red-800 uppercase font-semibold border border-red-200 px-2 py-1 cursor-pointer transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items details nested list (with photos) */}
                      <div className="flex flex-col gap-4">
                        {order.items.map((item, idx) => {
                          const itemLink = item.slug ? `/product/${item.slug}` : '';
                          
                          const ImageMarkup = () => (
                            <img 
                              src={item.image} 
                              className="w-10 h-14 object-cover border border-neutral-soft/40 hover:opacity-85 transition-opacity" 
                              alt={item.name} 
                            />
                          );

                          return (
                            <div key={idx} className="flex justify-between items-center gap-6">
                              <div className="flex items-center gap-4">
                                {itemLink ? (
                                  <Link href={itemLink} className="cursor-pointer">
                                    <ImageMarkup />
                                  </Link>
                                ) : (
                                  <ImageMarkup />
                                )}
                                <div className="flex flex-col gap-0.5">
                                  {itemLink ? (
                                    <Link href={itemLink} className="text-[11px] uppercase tracking-wider font-semibold text-fg-luxury hover:text-accent-gold transition-colors">
                                      {item.name}
                                    </Link>
                                  ) : (
                                    <span className="text-[11px] uppercase tracking-wider font-semibold text-fg-luxury">{item.name}</span>
                                  )}
                                  <span className="text-[8px] uppercase text-text-muted tracking-widest font-light">
                                    Size: {item.size} · Color: {item.color}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-xs font-semibold text-fg-luxury">₹{item.price.toLocaleString('en-IN')}</span>
                                <span className="text-[8.5px] uppercase tracking-widest text-text-muted font-light">Qty: {item.qty}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cancellation status display (Amazon/Flipkart style) */}
                      {order.cancelRequested && (
                        <div className="border border-red-700/60 bg-red-50/5 p-4 text-left flex flex-col gap-2 rounded animate-[fadeIn_0.3s_ease-out] mt-2">
                          <div className="flex justify-between items-center border-b border-red-200/20 pb-1.5">
                            <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-red-700">Cancellation Request Info</span>
                            <span className={`text-[8.5px] uppercase tracking-widest font-bold ${
                              order.cancelRequestStatus === 'approved' 
                                ? 'text-green-700' 
                                : order.cancelRequestStatus === 'rejected' 
                                ? 'text-red-700' 
                                : 'text-amber-700 animate-pulse'
                            }`}>
                              Status: {order.cancelRequestStatus || 'Pending'}
                            </span>
                          </div>
                          <div className="text-[10px] text-text-muted leading-relaxed flex flex-col gap-1">
                            <p>
                              <strong className="text-fg-luxury">Reason:</strong> &ldquo;{order.cancelReason || 'Client initiated'}&rdquo;
                            </p>
                            {order.cancelAdminNotes && (
                              <p className="border-l border-red-200 pl-2 mt-1 italic text-red-700 bg-red-50/10 py-1 px-2 rounded">
                                <strong className="text-fg-luxury not-italic uppercase tracking-widest text-[8px] block mb-0.5">Admin Response Note:</strong>
                                {order.cancelAdminNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tracking timeline details (if dispatch setup) */}
                      {order.status !== 'cancelled' && (
                        <div className="border-t border-neutral-soft/10 pt-4">
                          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                            <span className="text-[8.5px] uppercase tracking-widest text-text-muted font-semibold">Consignment Track Timeline</span>
                            {order.trackingNumber && (
                              <div className="flex gap-4 text-[8px] uppercase text-text-muted font-light">
                                <span>Courier: {order.courierName}</span>
                                <span>Awb: {order.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-4 text-center relative items-center max-w-md mx-auto py-2">
                            <div className="absolute top-[8px] left-[12.5%] right-[12.5%] h-[1.5px] bg-neutral-soft z-0" />
                            {getTimelineSteps(order.status).map((pt, idx) => (
                              <div key={idx} className="z-10 flex flex-col items-center gap-1.5">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] transition-all duration-300 ${
                                  pt.done 
                                    ? 'bg-fg-luxury text-bg-luxury border-fg-luxury font-semibold' 
                                    : 'bg-bg-luxury text-text-muted border-neutral-soft'
                                }`}>
                                  ✓
                                </div>
                                <span className={`text-[7px] uppercase tracking-widest font-semibold ${pt.done ? 'text-fg-luxury' : 'text-text-muted'}`}>
                                  {pt.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment and Billing footer details */}
                      <div className="border-t border-neutral-soft/15 pt-4 flex justify-between items-center flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.1em] text-fg-luxury">
                        <div className="flex items-center gap-1.5 text-[8.5px] text-text-muted font-light normal-case">
                          <CreditCard size={12} /> Paid via: <span className="uppercase font-medium text-fg-luxury">{order.paymentMethod}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[9.5px] font-light">Total Billing</span>
                          <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-center border-b border-neutral-soft/40 pb-3 mb-2">
                <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">Saved Addresses</h2>
                {!isAddingAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(true)}
                    className="text-[9px] uppercase tracking-widest text-accent-gold hover:text-fg-luxury flex items-center gap-1.5 cursor-pointer transition-colors font-semibold"
                  >
                    <Plus size={11} /> Add Coordinates
                  </button>
                )}
              </div>

              {/* Add Address Form Box */}
              {isAddingAddress && (
                <form onSubmit={handleCreateAddress} className="border border-neutral-soft/80 p-6 bg-neutral-soft/5 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out] mb-4">
                  <div className="flex justify-between items-center border-b border-neutral-soft/15 pb-2">
                    <span className="text-[9px] uppercase tracking-widest text-fg-luxury font-semibold">New Delivery Address</span>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingAddress(false)}
                      className="text-[8px] uppercase tracking-widest text-text-muted hover:text-fg-luxury font-bold"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-widest text-text-muted">Street / Locality</label>
                      <input 
                        type="text" 
                        required 
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        className="input-editorial text-xs py-1.5"
                        placeholder="House / Office number, Street Name"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-widest text-text-muted">City</label>
                      <input 
                        type="text" 
                        required 
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="input-editorial text-xs py-1.5"
                        placeholder="City / District"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-widest text-text-muted">State</label>
                      <input 
                        type="text" 
                        required 
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="input-editorial text-xs py-1.5"
                        placeholder="State"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-widest text-text-muted">Postal Zip Code</label>
                      <input 
                        type="text" 
                        required 
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                        className="input-editorial text-xs py-1.5"
                        placeholder="110001"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-widest text-text-muted">Country</label>
                      <input 
                        type="text" 
                        required 
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className="input-editorial text-xs py-1.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-widest text-text-muted">Address Type</label>
                      <select
                        value={newAddressType}
                        onChange={(e) => setNewAddressType(e.target.value as any)}
                        className="input-editorial text-xs py-1.5 bg-bg-luxury"
                      >
                        <option value="shipping">Shipping Address</option>
                        <option value="billing">Billing/Corporate</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-2 text-[9px] uppercase tracking-wider text-text-muted select-none">
                    <input 
                      type="checkbox" 
                      checked={newIsDefault}
                      onChange={(e) => setNewIsDefault(e.target.checked)}
                      className="accent-fg-luxury"
                    />
                    <span>Establish as Primary Default Address</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="btn-editorial-solid w-full text-xs py-3 mt-2 uppercase tracking-widest font-semibold"
                  >
                    {isSavingAddress ? 'Saving Address...' : 'Register Address'}
                  </button>
                </form>
              )}

              {/* Saved Addresses list */}
              {addresses.length === 0 ? (
                <div className="py-12 border border-dashed border-neutral-soft text-center text-xs text-text-muted uppercase tracking-widest font-light">
                  No saved delivery coordinates found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="border border-neutral-soft/50 p-5 bg-bg-luxury flex flex-col gap-3 justify-between relative hover:border-neutral-soft transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 bg-neutral-soft/20 border border-neutral-soft/30 text-fg-luxury">
                          {addr.addressType}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[7.5px] uppercase font-bold text-accent-gold tracking-widest">DEFAULT</span>
                        )}
                      </div>

                      <div className="text-[11px] text-fg-luxury leading-relaxed font-light text-left mt-2">
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="text-[9.5px] text-text-muted font-normal mt-0.5">{addr.country}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddr(addr.id)}
                        className="text-red-700 hover:text-red-800 text-[9px] uppercase tracking-widest font-semibold flex items-center gap-1 mt-3 border border-red-200/50 py-1.5 px-3 self-end cursor-pointer transition-colors"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="border border-neutral-soft/50 p-6 md:p-8 bg-bg-luxury flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-center border-b border-neutral-soft/20 pb-3">
                <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">Active Coupon Codes</h2>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest leading-relaxed">
                Apply these codes during checkout to avail exclusive brand discounts and promotions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {activeCoupons.length === 0 ? (
                  <div className="border border-dashed border-neutral-soft/50 py-12 px-6 text-center rounded-[12px] flex flex-col items-center justify-center gap-3 col-span-1 md:col-span-2 w-full">
                    <Tag size={24} className="text-neutral-300" strokeWidth={1.2} />
                    <p className="text-[10px] text-text-muted uppercase tracking-widest leading-relaxed max-w-sm">
                      No active discount coupons available currently.
                    </p>
                  </div>
                ) : (
                  activeCoupons.map((coupon) => {
                    const discountText = coupon.discountType === 'flat' 
                      ? `₹${coupon.discountValue} OFF` 
                      : `${coupon.discountValue}% OFF`;
                    const minOrderText = coupon.minOrderAmount > 0 
                      ? `Min order value ₹${coupon.minOrderAmount.toLocaleString('en-IN')}` 
                      : 'No minimum order required';

                    return (
                      <div key={coupon.id || coupon.code} className="border border-neutral-soft/40 p-5 rounded-[12px] bg-[#FFFCF8] flex flex-col justify-between shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFF9F2] rounded-full -mr-8 -mt-8 -z-10 group-hover:scale-110 transition-transform duration-500" />
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-accent-gold font-semibold bg-[#FFF9F2] px-2 py-0.5 border border-accent-gold/20 rounded-full">
                              {discountText}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.code);
                                setCopiedCoupon(coupon.code);
                                showToast(`Coupon ${coupon.code} copied!`, 'success');
                                setTimeout(() => setCopiedCoupon(null), 2000);
                              }}
                              className="text-[9px] uppercase tracking-wider text-text-muted hover:text-fg-luxury flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-soft/30 py-1 px-2.5 rounded-full hover:bg-neutral-50"
                            >
                              {copiedCoupon === coupon.code ? (
                                <>
                                  <Check size={10} className="text-green-600" /> COPIED
                                </>
                              ) : (
                                <>
                                  <Copy size={10} /> COPY CODE
                                </>
                              )}
                            </button>
                          </div>
                          <h4 className="font-mono text-sm font-semibold tracking-widest text-neutral-900 mt-3">{coupon.code}</h4>
                          <p className="text-[10px] text-neutral-600 font-light mt-1.5 leading-relaxed">
                            Use code {coupon.code} at checkout to receive discount benefits. Valid for active items.
                          </p>
                        </div>
                        <div className="border-t border-neutral-200/50 mt-4 pt-3 flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider text-neutral-400">
                          <Gift size={10} className="text-neutral-400" />
                          <span>{minOrderText}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT TICKETS STATUS TAB */}
          {activeTab === 'support' && (
            <div className="border border-neutral-soft/50 p-6 md:p-8 bg-bg-luxury flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="border-b border-neutral-soft/20 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">My Enquiries & Requests</h2>
                  <p className="text-[8.5px] uppercase tracking-widest text-text-muted mt-1">Track status of returns, shipping queries, and complaints</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {supportTickets.length === 0 ? (
                  <div className="py-12 border border-dashed border-neutral-soft/40 rounded flex flex-col items-center justify-center text-center p-6 bg-neutral-soft/5">
                    <MessageSquare size={24} className="text-neutral-400 mb-2.5 stroke-1" />
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium">No enquiries registered yet</p>
                    <p className="text-[9.5px] text-neutral-500 font-light mt-1 max-w-xs leading-normal">
                      Submit support coordinates or return requests via the Contact Support link in footer.
                    </p>
                    <Link href="/support" className="btn-editorial-solid text-[9.5px] py-2 px-6 tracking-widest uppercase mt-4">
                      Submit Enquiry
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {supportTickets.map((ticket) => {
                      const statusColor = 
                        ticket.status?.toLowerCase() === 'resolved' || ticket.status?.toLowerCase() === 'closed'
                          ? 'text-green-700 bg-green-50 border-green-200' 
                          : ticket.status?.toLowerCase() === 'in progress' || ticket.status?.toLowerCase() === 'read'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200 animate-pulse';

                      return (
                        <div key={ticket.id} className="border border-neutral-soft/50 p-5 rounded-[4px] bg-bg-luxury/50 flex flex-col gap-3.5 hover:border-neutral-soft transition-all duration-300">
                          <div className="flex flex-wrap justify-between items-start gap-2 border-b border-neutral-soft/10 pb-2.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-text-muted uppercase tracking-widest font-mono">
                                Ticket ID: #{ticket.id.slice(0, 8).toUpperCase()}
                              </span>
                              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-fg-luxury mt-0.5">
                                {ticket.subject || 'General Enquiry'}
                              </h4>
                            </div>
                            <span className={`text-[8px] uppercase tracking-widest font-bold border px-2 py-0.5 rounded-sm ${statusColor}`}>
                              Status: {ticket.status || 'New'}
                            </span>
                          </div>

                          <div className="text-[10.5px] font-light text-neutral-600 leading-relaxed text-left whitespace-pre-wrap">
                            <span className="text-[8.5px] uppercase tracking-wider text-text-muted font-semibold block mb-0.5">Your Message Thread:</span>
                            {ticket.message}
                          </div>

                          {ticket.admin_reply && (
                            <div className="bg-[#FFFDFB] border border-accent-gold/20 p-3.5 flex flex-col gap-1.5 rounded-sm text-left whitespace-pre-wrap">
                              <span className="text-[8.5px] uppercase tracking-widest font-bold text-accent-gold">Official Response:</span>
                              <p className="text-[10.5px] text-neutral-800 leading-relaxed font-light">{ticket.admin_reply}</p>
                            </div>
                          )}

                          {/* Customer Reply back block when ticket is open */}
                          {ticket.status !== 'Closed' ? (
                            <div className="mt-2 pt-2 border-t border-neutral-soft/10 flex gap-2">
                              <input 
                                type="text"
                                id={`customer-reply-${ticket.id}`}
                                placeholder="Reply to this enquiry..."
                                className="flex-1 bg-neutral-soft/5 border border-neutral-soft/60 py-1.5 px-3 text-[10px] focus:outline-none text-fg-luxury"
                              />
                              <button
                                onClick={async () => {
                                  const input = document.getElementById(`customer-reply-${ticket.id}`) as HTMLInputElement;
                                  const text = input?.value?.trim();
                                  if (!text) {
                                    showToast('Please enter message text.', 'error');
                                    return;
                                  }
                                  try {
                                    // Append customer message to thread
                                    const dateStr = new Date().toLocaleString('en-IN');
                                    const updatedMessage = `${ticket.message}\n\n[Customer reply (${dateStr})]:\n${text}`;
                                    
                                    const res = await fetch('/api/support/user-tickets', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ticketId: ticket.id, message: updatedMessage, status: 'New' })
                                    });
                                    if (!res.ok) throw new Error('API_ERROR');
                                    
                                    setSupportTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, message: updatedMessage, status: 'New' } : t));
                                    showToast('Reply added to ticket thread.', 'success');
                                    if (input) input.value = '';
                                  } catch (err) {
                                    showToast('Failed to submit reply.', 'error');
                                  }
                                }}
                                className="btn-editorial-solid text-[9px] px-4 py-1.5 uppercase font-medium cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          ) : (
                            <p className="text-[8.5px] text-neutral-400 uppercase tracking-widest text-left italic mt-1 bg-neutral-100 p-2">This enquiry is closed. Please submit a new ticket for further queries.</p>
                          )}

                          <div className="flex flex-wrap justify-between items-center text-[8.5px] uppercase tracking-widest text-text-muted font-light pt-2.5 border-t border-neutral-soft/10 mt-1">
                            <span>Submitted: {new Date(ticket.created_at || ticket.createdAt).toLocaleString('en-IN')}</span>
                            <span>Updated: {new Date(ticket.updated_at || ticket.updatedAt).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

      {/* Payments tab removed */}

        </div>

      {/* Cancellation Request Modal dialog popup */}
      {cancellationOrderId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-full max-w-md bg-bg-luxury border border-neutral-soft/90 p-6 md:p-8 flex flex-col gap-6 text-left animate-[slideDownFade_0.3s_ease-out]">
            <div className="border-b border-neutral-soft/20 pb-3 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">Request Order Cancellation</h3>
              <button 
                onClick={() => { setCancellationOrderId(null); setCustomReason(''); }}
                className="text-text-muted hover:text-fg-luxury text-xs cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <form onSubmit={handleSubmitCancellation} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Select Reason</label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="input-editorial text-xs py-2 px-3 bg-bg-luxury"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Incorrect size/color ordered">Incorrect size/color ordered</option>
                  <option value="Found better pricing elsewhere">Found better pricing elsewhere</option>
                  <option value="Delivery timelines too delayed">Delivery timelines too delayed</option>
                  <option value="Other">Other (Write reason below)</option>
                </select>
              </div>

              {cancellationReason === 'Other' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Specify Reason</label>
                  <textarea
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                    className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-xs focus:outline-none text-fg-luxury uppercase tracking-wider"
                    placeholder="Describe why you want to cancel this order..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingCancellation}
                className="btn-editorial-solid w-full text-xs py-3 mt-2 uppercase tracking-widest font-semibold"
              >
                {isSubmittingCancellation ? 'Submitting request...' : 'Confirm Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <Suspense fallback={
        <div className="flex-1 flex flex-col items-center justify-center py-32">
          <div className="w-6 h-6 border border-neutral-soft border-t-fg-luxury rounded-full animate-spin mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium">Synchronizing Account Coordinates...</p>
        </div>
      }>
        <DashboardContent />
      </Suspense>

      <CartDrawer />
      <Footer />
    </div>
  );
}
