import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { MOCK_WORKERS, CANCELLATION_FEE_RATE, COMMISSION_RATE } from '@/lib/constants';
import PaymentModal from '@/components/PaymentModal';
import {
  Calendar, Clock, MapPin, Star, CreditCard, Heart, User, FileText,
  ChevronRight, CheckCircle, AlertCircle, Loader2, Download, X,
  AlertTriangle, DollarSign, Receipt, Shield, Lock, Eye
} from 'lucide-react';

interface CustomerDashboardProps {
  onNavigate: (page: string) => void;
}

type Tab = 'overview' | 'bookings' | 'history' | 'payments' | 'favourites' | 'profile';

interface BookingItem {
  id: string;
  service: string;
  worker: typeof MOCK_WORKERS[0];
  date: string;
  time: string;
  status: string;
  address: string;
  total: number;
  workerShare: number;
  platformCommission: number;
  paymentStatus: 'unpaid' | 'paid' | 'cancelled_fee_paid';
  rated?: boolean;
  paymentId?: string;
  invoiceNumber?: string;
  cancellationFee?: number;
}

const INITIAL_BOOKINGS: BookingItem[] = [
  { id: 'b1', service: 'House Cleaning', worker: MOCK_WORKERS[0], date: '2026-03-12', time: '09:00', status: 'completed', address: '45 Main Rd, Sandton', total: 360, workerShare: 288, platformCommission: 72, paymentStatus: 'unpaid' },
  { id: 'b2', service: 'Cooking', worker: MOCK_WORKERS[1], date: '2026-03-15', time: '11:00', status: 'accepted', address: '12 Beach Rd, Cape Town', total: 600, workerShare: 480, platformCommission: 120, paymentStatus: 'unpaid' },
  { id: 'b3', service: 'Laundry', worker: MOCK_WORKERS[2], date: '2026-03-18', time: '14:00', status: 'assigned', address: '78 Palm Ave, Durban', total: 275, workerShare: 220, platformCommission: 55, paymentStatus: 'unpaid' },
];

const INITIAL_HISTORY: BookingItem[] = [
  { id: 'b4', service: 'Laundry', worker: MOCK_WORKERS[2], date: '2026-03-01', time: '10:00', status: 'completed', address: '78 Palm Ave, Durban', total: 275, workerShare: 220, platformCommission: 55, paymentStatus: 'paid', rated: true, invoiceNumber: 'INV-202603-A1B2C', paymentId: 'p1' },
  { id: 'b5', service: 'Car Washing', worker: MOCK_WORKERS[3], date: '2026-02-25', time: '08:00', status: 'completed', address: '23 Oak St, Pretoria', total: 260, workerShare: 208, platformCommission: 52, paymentStatus: 'paid', rated: false, invoiceNumber: 'INV-202602-D3E4F', paymentId: 'p2' },
  { id: 'b6', service: 'Yard Cleaning', worker: MOCK_WORKERS[3], date: '2026-02-18', time: '07:00', status: 'cancelled', address: '23 Oak St, Pretoria', total: 500, workerShare: 0, platformCommission: 0, paymentStatus: 'cancelled_fee_paid', cancellationFee: 150, invoiceNumber: 'INV-202602-G5H6I', paymentId: 'p3' },
];

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [history, setHistory] = useState<BookingItem[]>(INITIAL_HISTORY);
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [paymentModal, setPaymentModal] = useState<BookingItem | null>(null);
  const [paymentType, setPaymentType] = useState<'service' | 'cancellation'>('service');
  const [cancelModal, setCancelModal] = useState<BookingItem | null>(null);
  const [invoiceModal, setInvoiceModal] = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Calendar size={16} /> },
    { id: 'bookings', label: 'Active', icon: <Clock size={16} />, badge: bookings.filter(b => b.status !== 'completed' || b.paymentStatus === 'unpaid').length },
    { id: 'history', label: 'History', icon: <FileText size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'favourites', label: 'Favourites', icon: <Heart size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-indigo-100 text-indigo-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const paymentStatusBadge = (ps: string) => {
    switch (ps) {
      case 'paid': return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1"><CheckCircle size={10} /> Paid</span>;
      case 'cancelled_fee_paid': return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1"><AlertTriangle size={10} /> Fee Paid</span>;
      default: return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Unpaid</span>;
    }
  };

  const handlePayNow = (booking: BookingItem) => {
    setPaymentType('service');
    setPaymentModal(booking);
  };

  const handleCancelBooking = (booking: BookingItem) => {
    setCancelModal(booking);
  };

  const confirmCancellation = (booking: BookingItem, withFee: boolean) => {
    setCancelModal(null);
    if (withFee) {
      setPaymentType('cancellation');
      const cancelBooking = { ...booking, cancellationFee: booking.total * CANCELLATION_FEE_RATE };
      setPaymentModal(cancelBooking);
    } else {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setHistory(prev => [{ ...booking, status: 'cancelled', paymentStatus: 'unpaid', cancellationFee: 0 }, ...prev]);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    const pmt = data.payment;
    if (paymentModal) {
      if (paymentType === 'service') {
        setBookings(prev => prev.filter(b => b.id !== paymentModal.id));
        setHistory(prev => [{
          ...paymentModal,
          paymentStatus: 'paid',
          paymentId: pmt.id,
          invoiceNumber: pmt.invoice_number,
        }, ...prev]);
      } else {
        setBookings(prev => prev.filter(b => b.id !== paymentModal.id));
        setHistory(prev => [{
          ...paymentModal,
          status: 'cancelled',
          paymentStatus: 'cancelled_fee_paid',
          cancellationFee: pmt.cancellation_fee || paymentModal.total * CANCELLATION_FEE_RATE,
          paymentId: pmt.id,
          invoiceNumber: pmt.invoice_number,
        }, ...prev]);
      }
    }
    setPaymentModal(null);
  };

  const handleViewInvoice = async (booking: BookingItem) => {
    // Build invoice data locally for demo (in production, call generate-invoice edge function)
    const vatRate = 0.15;
    const amt = booking.status === 'cancelled' ? (booking.cancellationFee || 0) : booking.total;
    const amtExclVat = amt / (1 + vatRate);
    const vatAmt = amt - amtExclVat;

    setInvoiceModal({
      invoice_number: booking.invoiceNumber || `INV-${Date.now()}`,
      date: new Date().toISOString(),
      company: {
        name: 'Red Face Home Services (Pty) Ltd',
        registration: '2024/123456/07',
        vat_number: 'VAT 4123456789',
        address: 'Sandton City, Johannesburg, South Africa',
        phone: '+27 11 234 5678',
        email: 'billing@redface.co.za',
      },
      customer: {
        name: profile?.full_name || 'Customer',
        email: profile?.email || '',
      },
      service: booking.service,
      worker: booking.worker.name,
      booking_date: booking.date,
      address: booking.address,
      payment_type: booking.status === 'cancelled' ? 'cancellation' : 'service',
      subtotal: amtExclVat,
      vat_rate: 15,
      vat_amount: vatAmt,
      total: amt,
      worker_share: booking.workerShare,
      platform_commission: booking.platformCommission,
    });
  };

  const submitReview = () => {
    setHistory(prev => prev.map(b => b.id === reviewModal ? { ...b, rated: true } : b));
    setReviewModal(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const allPayments = [...history.filter(b => b.paymentStatus !== 'unpaid')];
  const totalSpent = allPayments.reduce((s, b) => s + (b.status === 'cancelled' ? (b.cancellationFee || 0) : b.total), 0);
  const awaitingPayment = bookings.filter(b => b.status === 'completed' && b.paymentStatus === 'unpaid');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-black text-gray-900">Welcome back, {profile?.full_name || 'Customer'}</h1>
          <p className="text-gray-500 mt-1">Manage your bookings, payments, and account</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-2 lg:sticky lg:top-24">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    activeTab === tab.id ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* ===== OVERVIEW ===== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Awaiting Payment Alert */}
                {awaitingPayment.length > 0 && (
                  <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Payment Required</h3>
                        <p className="text-red-100 text-sm">{awaitingPayment.length} completed job{awaitingPayment.length > 1 ? 's' : ''} awaiting payment</p>
                      </div>
                    </div>
                    {awaitingPayment.map(b => (
                      <div key={b.id} className="flex items-center justify-between bg-white/10 rounded-xl p-3 mb-2 last:mb-0">
                        <div>
                          <p className="font-semibold text-sm">{b.service} with {b.worker.name}</p>
                          <p className="text-red-200 text-xs">{b.date}</p>
                        </div>
                        <button
                          onClick={() => handlePayNow(b)}
                          className="px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition"
                        >
                          Pay R{b.total}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">Active Bookings</p>
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">{bookings.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">Completed</p>
                      <CheckCircle size={16} className="text-gray-400" />
                    </div>
                    <p className="text-3xl font-black text-green-600">{history.filter(h => h.status === 'completed').length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">Awaiting Payment</p>
                      <CreditCard size={16} className="text-gray-400" />
                    </div>
                    <p className="text-3xl font-black text-amber-600">{awaitingPayment.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <p className="text-3xl font-black text-red-600">R{totalSpent.toLocaleString()}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button onClick={() => onNavigate('booking')} className="flex items-center gap-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition text-left">
                      <Calendar size={20} className="text-red-600" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Book a Service</p>
                        <p className="text-xs text-gray-500">Schedule new</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 ml-auto" />
                    </button>
                    <button onClick={() => onNavigate('workers')} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-left">
                      <User size={20} className="text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Find Workers</p>
                        <p className="text-xs text-gray-500">Browse profiles</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 ml-auto" />
                    </button>
                    <button onClick={() => setActiveTab('payments')} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-left">
                      <Receipt size={20} className="text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">View Invoices</p>
                        <p className="text-xs text-gray-500">Download receipts</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 ml-auto" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ACTIVE BOOKINGS ===== */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Active Bookings</h2>
                {bookings.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No active bookings</p>
                    <button onClick={() => onNavigate('booking')} className="mt-4 px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition">Book a Service</button>
                  </div>
                )}
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{b.service}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(b.status)}`}>{b.status.replace('_', ' ')}</span>
                          {paymentStatusBadge(b.paymentStatus)}
                        </div>
                      </div>
                      <span className="text-xl font-black text-red-600">R{b.total}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={b.worker.photo} alt={b.worker.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-gray-900">{b.worker.name}</p>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-500">{b.worker.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-500"><Calendar size={14} />{b.date}</div>
                      <div className="flex items-center gap-2 text-gray-500"><Clock size={14} />{b.time}</div>
                      <div className="flex items-center gap-2 text-gray-500"><MapPin size={14} />{b.address}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                      {b.status === 'completed' && b.paymentStatus === 'unpaid' && (
                        <button
                          onClick={() => handlePayNow(b)}
                          className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200"
                        >
                          <CreditCard size={16} />
                          Pay Now — R{b.total}
                        </button>
                      )}
                      {(b.status === 'assigned' || b.status === 'accepted') && (
                        <button
                          onClick={() => handleCancelBooking(b)}
                          className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition flex items-center gap-2"
                        >
                          <AlertTriangle size={14} />
                          Cancel Booking
                        </button>
                      )}
                      {b.status === 'pending' && (
                        <button
                          onClick={() => {
                            setBookings(prev => prev.filter(bk => bk.id !== b.id));
                          }}
                          className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition"
                        >
                          Cancel (Free)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== HISTORY ===== */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Booking History</h2>
                {history.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{b.service}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(b.status)}`}>{b.status}</span>
                          {paymentStatusBadge(b.paymentStatus)}
                        </div>
                      </div>
                      <div className="text-right">
                        {b.status === 'cancelled' ? (
                          <span className="font-bold text-amber-600">R{b.cancellationFee?.toFixed(0) || 0} fee</span>
                        ) : (
                          <span className="font-bold text-gray-900">R{b.total}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={b.worker.photo} alt={b.worker.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm text-gray-700">{b.worker.name}</span>
                      <span className="text-xs text-gray-400">{b.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {b.status === 'completed' && !b.rated && (
                        <button onClick={() => setReviewModal(b.id)} className="text-sm text-red-600 font-semibold hover:underline flex items-center gap-1">
                          <Star size={14} /> Leave a Review
                        </button>
                      )}
                      {b.rated && (
                        <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle size={14} /> Reviewed</span>
                      )}
                      {b.invoiceNumber && (
                        <button onClick={() => handleViewInvoice(b)} className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
                          <Receipt size={14} /> View Invoice
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== PAYMENTS TAB ===== */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Payment History</h2>

                {/* Payment Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-black text-green-600 mt-1">R{totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{allPayments.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Cancellation Fees</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">
                      R{allPayments.filter(p => p.status === 'cancelled').reduce((s, p) => s + (p.cancellationFee || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">All Transactions</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {allPayments.map(b => (
                      <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.status === 'cancelled' ? 'bg-amber-100' : 'bg-green-100'}`}>
                            {b.status === 'cancelled' ? <AlertTriangle size={18} className="text-amber-600" /> : <CheckCircle size={18} className="text-green-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {b.status === 'cancelled' ? 'Cancellation Fee' : b.service}
                            </p>
                            <p className="text-xs text-gray-500">{b.date} · {b.worker.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-bold ${b.status === 'cancelled' ? 'text-amber-600' : 'text-green-600'}`}>
                              R{b.status === 'cancelled' ? (b.cancellationFee || 0).toFixed(0) : b.total.toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-400">{b.invoiceNumber}</p>
                          </div>
                          {b.invoiceNumber && (
                            <button
                              onClick={() => handleViewInvoice(b)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Invoice"
                            >
                              <Download size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {allPayments.length === 0 && (
                      <div className="px-6 py-12 text-center text-gray-500">No payment history yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== FAVOURITES ===== */}
            {activeTab === 'favourites' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Favourite Workers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_WORKERS.slice(0, 3).map(w => (
                    <div key={w.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                      <img src={w.photo} alt={w.name} className="w-14 h-14 rounded-full object-cover" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{w.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          {w.rating} · {w.area}
                        </div>
                      </div>
                      <button onClick={() => onNavigate('booking')} className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition">
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PROFILE ===== */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">My Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={profile?.full_name || ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" defaultValue={profile?.email || ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" defaultValue={profile?.phone || ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" placeholder="+27..." />
                  </div>
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition">Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== PAYMENT MODAL ===== */}
      {paymentModal && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPaymentModal(null)}
          bookingId={paymentModal.id}
          amount={paymentType === 'cancellation' ? (paymentModal.cancellationFee || paymentModal.total * CANCELLATION_FEE_RATE) : paymentModal.total}
          workerShare={paymentType === 'service' ? paymentModal.workerShare : 0}
          platformCommission={paymentType === 'service' ? paymentModal.platformCommission : (paymentModal.cancellationFee || paymentModal.total * CANCELLATION_FEE_RATE)}
          serviceName={paymentModal.service}
          workerName={paymentModal.worker.name}
          paymentType={paymentType}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* ===== CANCELLATION MODAL ===== */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setCancelModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white relative">
              <button onClick={() => setCancelModal(null)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
              </button>
              <AlertTriangle size={28} className="mb-2" />
              <h2 className="text-xl font-bold">Cancel Booking?</h2>
              <p className="text-amber-100 text-sm mt-1">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
                <p className="text-sm text-amber-800 font-medium mb-2">Cancellation Fee Applies</p>
                <p className="text-sm text-amber-700">
                  Since a worker has already been {cancelModal.status === 'assigned' ? 'assigned' : 'accepted'} for this booking,
                  a cancellation fee of <strong>{(CANCELLATION_FEE_RATE * 100).toFixed(0)}%</strong> will be charged.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-gray-900">{cancelModal.service}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Worker</span>
                  <span className="font-semibold text-gray-900">{cancelModal.worker.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking Total</span>
                  <span className="font-semibold text-gray-900">R{cancelModal.total}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-bold text-amber-700">Cancellation Fee ({(CANCELLATION_FEE_RATE * 100).toFixed(0)}%)</span>
                  <span className="font-black text-amber-700">R{(cancelModal.total * CANCELLATION_FEE_RATE).toFixed(0)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => confirmCancellation(cancelModal, true)}
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
                >
                  Cancel & Pay Fee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== INVOICE MODAL ===== */}
      {invoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setInvoiceModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Invoice</h2>
                <p className="text-sm text-gray-500">{invoiceModal.invoice_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = `RED FACE HOME SERVICES\nInvoice: ${invoiceModal.invoice_number}\nDate: ${new Date(invoiceModal.date).toLocaleDateString()}\nCustomer: ${invoiceModal.customer.name}\nService: ${invoiceModal.service}\nWorker: ${invoiceModal.worker}\nSubtotal: R${invoiceModal.subtotal.toFixed(2)}\nVAT (15%): R${invoiceModal.vat_amount.toFixed(2)}\nTotal: R${invoiceModal.total.toFixed(2)}`;
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${invoiceModal.invoice_number}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Download Invoice"
                >
                  <Download size={18} />
                </button>
                <button onClick={() => setInvoiceModal(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Company Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-sm">RF</span>
                    </div>
                    <span className="font-bold text-gray-900">Red Face Home Services</span>
                  </div>
                  <p className="text-xs text-gray-500">{invoiceModal.company.address}</p>
                  <p className="text-xs text-gray-500">{invoiceModal.company.phone}</p>
                  <p className="text-xs text-gray-500">{invoiceModal.company.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Reg: {invoiceModal.company.registration}</p>
                  <p className="text-xs text-gray-400">{invoiceModal.company.vat_number}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${invoiceModal.payment_type === 'cancellation' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {invoiceModal.payment_type === 'cancellation' ? 'CANCELLATION' : 'PAID'}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{new Date(invoiceModal.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
                <p className="font-semibold text-gray-900">{invoiceModal.customer.name}</p>
                <p className="text-sm text-gray-500">{invoiceModal.customer.email}</p>
              </div>

              {/* Service Details */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Service Details</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium text-gray-900">{invoiceModal.service}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Worker</span><span className="font-medium text-gray-900">{invoiceModal.worker}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{invoiceModal.booking_date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-gray-900">{invoiceModal.address}</span></div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal (excl. VAT)</span>
                  <span className="font-medium text-gray-900">R{invoiceModal.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VAT ({invoiceModal.vat_rate}%)</span>
                  <span className="font-medium text-gray-900">R{invoiceModal.vat_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total (ZAR)</span>
                  <span className="font-black text-red-600">R{invoiceModal.total.toFixed(2)}</span>
                </div>
              </div>

              {invoiceModal.payment_type !== 'cancellation' && invoiceModal.worker_share > 0 && (
                <div className="mt-4 bg-blue-50 rounded-xl p-4 text-xs text-blue-700">
                  <p className="font-medium mb-1">Payment Split</p>
                  <p>Worker Share: R{invoiceModal.worker_share.toFixed(2)} · Platform Commission: R{invoiceModal.platform_commission.toFixed(2)}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-6 text-center">
                Thank you for using Red Face Home Services. This is an electronic invoice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== REVIEW MODAL ===== */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => setReviewRating(r)}>
                  <Star size={28} className={r <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none mb-4"
              rows={4}
              placeholder="Tell us about your experience..."
            />
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              <button onClick={submitReview} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
