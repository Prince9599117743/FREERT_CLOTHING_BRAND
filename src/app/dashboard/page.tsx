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
  getOrders, getAddresses, saveAddress, deleteAddress, updateOrderDetails 
} from '@/services/database';
import type { Order, Address } from '@/types';
import { 
  Package, User, Star, Copy, Check, Edit2, Trash2, Plus, MapPin, 
  CreditCard, Calendar, Truck, Clipboard, ShieldAlert, LogOut, ArrowRight 
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
  items: OrderItemLog[];
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [orders, setOrders] = useState<OrderLog[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
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

  // Fetch active tab from URL query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'addresses' || tab === 'profile') {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Load profile inputs
  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditPhone(user.phone || '');
      fetchAddresses();
      fetchUserOrders();
    }
  }, [user]);

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
    if (!user) return;
    try {
      const data = await getOrders(user.id);
      const mapped: OrderLog[] = data.map((o: any) => ({
        id: o.order_number ? String(o.order_number) : o.id.slice(0, 8),
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
        items: o.items ? o.items.map((i: any) => ({
          name: i.variant?.product?.name || 'Garment Article',
          qty: i.qty,
          price: Number(i.unit_price || 0),
          size: i.variant?.size || 'One Size',
          color: i.variant?.color || 'Default',
          image: i.variant?.product?.images?.[0] || '/assets/trench_coat.jpg',
          slug: i.variant?.product?.slug || ''
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
      await updateOrderDetails(cancellationOrderId, {
        cancelRequested: true,
        cancelReason: finalReason,
        cancelRequestStatus: 'pending'
      });
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Navigation Links & Initials Avatar card */}
        <div className="lg:col-span-3 bg-neutral-soft/10 p-6 border border-neutral-soft/40 flex flex-col gap-6 text-left">
          <div className="flex items-center gap-3.5 pb-5 border-b border-neutral-soft/20">
            <div className="w-10 h-10 bg-fg-luxury text-bg-luxury rounded-full flex items-center justify-center font-editorial font-semibold text-sm">
              {user ? user.fullName?.charAt(0).toUpperCase() || 'U' : 'C'}
            </div>
            <div className="truncate">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-fg-luxury truncate max-w-[150px]">
                {user ? user.fullName || 'Registered client' : 'User Account'}
              </h3>
              <p className="text-[8.5px] text-text-muted lowercase truncate max-w-[150px] mt-0.5">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-4 text-[9.5px] uppercase tracking-[0.2em] text-text-muted font-light">
            <button 
              onClick={() => { setActiveTab('profile'); router.push('/dashboard?tab=profile'); }}
              className={`flex items-center gap-2.5 transition-colors cursor-pointer text-left ${activeTab === 'profile' ? 'text-accent-gold font-semibold' : 'hover:text-fg-luxury'}`}
            >
              <User size={12} strokeWidth={1.5} /> Personal Profile
            </button>
            <button 
              onClick={() => { setActiveTab('orders'); router.push('/dashboard?tab=orders'); }}
              className={`flex items-center gap-2.5 transition-colors cursor-pointer text-left ${activeTab === 'orders' ? 'text-accent-gold font-semibold' : 'hover:text-fg-luxury'}`}
            >
              <Package size={12} strokeWidth={1.5} /> My Orders ({orders.length})
            </button>
            <button 
              onClick={() => { setActiveTab('addresses'); router.push('/dashboard?tab=addresses'); }}
              className={`flex items-center gap-2.5 transition-colors cursor-pointer text-left ${activeTab === 'addresses' ? 'text-accent-gold font-semibold' : 'hover:text-fg-luxury'}`}
            >
              <MapPin size={12} strokeWidth={1.5} /> Saved Addresses ({addresses.length})
            </button>
            <button 
              onClick={handleSignOutClick}
              className="flex items-center gap-2.5 transition-colors hover:text-red-700 cursor-pointer text-left border-t border-neutral-soft/20 pt-4 mt-2"
            >
              <LogOut size={12} strokeWidth={1.5} /> Sign Out
            </button>
          </nav>
        </div>

        {/* Right Side: Dynamic Content Tab */}
        <div className="lg:col-span-9 text-left">
          
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
                        <div className="flex flex-col gap-1">
                          <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">Order #{order.id}</span>
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
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                              <img src={item.image} className="w-10 h-14 object-cover border border-neutral-soft/40" alt="" />
                              <div className="flex flex-col gap-0.5">
                                <Link href={`/product/${item.slug}`} className="text-[11px] uppercase tracking-wider font-semibold text-fg-luxury hover:text-accent-gold transition-colors">
                                  {item.name}
                                </Link>
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
                        ))}
                      </div>

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

        </div>
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
