import React, { useState } from 'react';
import { MOCK_WORKERS, COMMISSION_RATE, CANCELLATION_FEE_RATE } from '@/lib/constants';
import { Users, Calendar, DollarSign, Shield, CheckCircle, XCircle, Eye, Search, BarChart3, Settings, AlertTriangle, TrendingUp, FileText, BadgeCheck, Star, CreditCard, Lock, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Tab = 'overview' | 'workers' | 'bookings' | 'payments' | 'services' | 'analytics';

const PENDING_WORKERS = [
  { id: 'w1', name: 'Mandla Ngcobo', email: 'mandla@email.com', services: ['Yard Cleaning', 'Waste Removal'], idUploaded: true, policeUploaded: true, cookingCert: false, appliedDate: '2026-03-08' },
  { id: 'w2', name: 'Precious Mokoena', email: 'precious@email.com', services: ['Cooking', 'House Cleaning'], idUploaded: true, policeUploaded: true, cookingCert: true, appliedDate: '2026-03-07' },
  { id: 'w3', name: 'David Naidoo', email: 'david@email.com', services: ['Car Washing'], idUploaded: true, policeUploaded: false, cookingCert: false, appliedDate: '2026-03-06' },
];

const ALL_BOOKINGS = [
  { id: 'b1', customer: 'Sarah van der Merwe', worker: 'Thandi Nkosi', service: 'House Cleaning', date: '2026-03-12', status: 'accepted', total: 360, paymentStatus: 'unpaid', paymentRef: '' },
  { id: 'b2', customer: 'James Pillay', worker: 'Sipho Dlamini', service: 'Cooking', date: '2026-03-15', status: 'pending', total: 600, paymentStatus: 'unpaid', paymentRef: '' },
  { id: 'b3', customer: 'Lisa Fourie', worker: 'Lerato Molefe', service: 'Laundry', date: '2026-03-09', status: 'in_progress', total: 275, paymentStatus: 'unpaid', paymentRef: '' },
  { id: 'b4', customer: 'Anele Mbeki', worker: 'Bongani Zulu', service: 'Car Washing', date: '2026-03-05', status: 'completed', total: 260, paymentStatus: 'paid', paymentRef: 'RF-1741234567-A1B2C3' },
  { id: 'b5', customer: 'Sarah van der Merwe', worker: 'Thandi Nkosi', service: 'House Cleaning', date: '2026-03-01', status: 'completed', total: 360, paymentStatus: 'paid', paymentRef: 'RF-1741123456-D4E5F6' },
  { id: 'b6', customer: 'James Pillay', worker: 'Nomsa Mthembu', service: 'Laundry', date: '2026-02-28', status: 'cancelled', total: 275, paymentStatus: 'cancelled_fee_paid', paymentRef: 'RF-1741012345-G7H8I9', cancellationFee: 82.5 },
  { id: 'b7', customer: 'Lisa Fourie', worker: 'Zanele Khumalo', service: 'Cooking', date: '2026-02-20', status: 'completed', total: 560, paymentStatus: 'paid', paymentRef: 'RF-1740901234-J0K1L2' },
];

const PAYMENT_TRANSACTIONS = [
  { id: 'p1', ref: 'RF-1741234567-A1B2C3', invoice: 'INV-202603-A1B2C', customer: 'Anele Mbeki', worker: 'Bongani Zulu', service: 'Car Washing', date: '2026-03-05', amount: 260, workerShare: 208, commission: 52, type: 'service', card: 'Visa ****4321', status: 'completed' },
  { id: 'p2', ref: 'RF-1741123456-D4E5F6', invoice: 'INV-202603-D3E4F', customer: 'Sarah van der Merwe', worker: 'Thandi Nkosi', service: 'House Cleaning', date: '2026-03-01', amount: 360, workerShare: 288, commission: 72, type: 'service', card: 'Mastercard ****8765', status: 'completed' },
  { id: 'p3', ref: 'RF-1741012345-G7H8I9', invoice: 'INV-202602-G5H6I', customer: 'James Pillay', worker: 'Nomsa Mthembu', service: 'Laundry', date: '2026-02-28', amount: 82.5, workerShare: 0, commission: 82.5, type: 'cancellation', card: 'Visa ****1234', status: 'completed' },
  { id: 'p4', ref: 'RF-1740901234-J0K1L2', invoice: 'INV-202602-M3N4O', customer: 'Lisa Fourie', worker: 'Zanele Khumalo', service: 'Cooking', date: '2026-02-20', amount: 560, workerShare: 448, commission: 112, type: 'service', card: 'Visa ****5678', status: 'completed' },
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [workerSearch, setWorkerSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'service' | 'cancellation'>('all');
  const [commissionRate, setCommissionRate] = useState(20);
  const [cancellationRate, setCancellationRate] = useState(30);
  const [rulesSaved, setRulesSaved] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'workers', label: 'Workers', icon: <Users size={16} /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'services', label: 'Services', icon: <Settings size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
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

  const paymentStatusColor = (ps: string) => {
    switch (ps) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'cancelled_fee_paid': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredBookings = ALL_BOOKINGS.filter(b => bookingFilter === 'all' || b.status === bookingFilter);
  const filteredPayments = PAYMENT_TRANSACTIONS.filter(p => paymentFilter === 'all' || p.type === paymentFilter);
  const totalRevenue = PAYMENT_TRANSACTIONS.filter(p => p.type === 'service').reduce((s, p) => s + p.amount, 0);
  const totalWorkerPayouts = PAYMENT_TRANSACTIONS.filter(p => p.type === 'service').reduce((s, p) => s + p.workerShare, 0);
  const totalCommission = PAYMENT_TRANSACTIONS.reduce((s, p) => s + p.commission, 0);
  const totalCancellationFees = PAYMENT_TRANSACTIONS.filter(p => p.type === 'cancellation').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage Red Face Home Services platform</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 shrink-0">
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
                  {tab.id === 'workers' && PENDING_WORKERS.length > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{PENDING_WORKERS.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* ===== OVERVIEW ===== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `R${totalRevenue.toLocaleString()}`, color: 'text-green-600', icon: <DollarSign size={20} />, sub: `${PAYMENT_TRANSACTIONS.filter(p => p.type === 'service').length} transactions` },
                    { label: 'Platform Income', value: `R${totalCommission.toFixed(0)}`, color: 'text-blue-600', icon: <TrendingUp size={20} />, sub: 'Commission + fees' },
                    { label: 'Active Workers', value: MOCK_WORKERS.filter(w => w.available).length.toString(), color: 'text-purple-600', icon: <Users size={20} />, sub: `${PENDING_WORKERS.length} pending approval` },
                    { label: 'Cancellation Fees', value: `R${totalCancellationFees.toFixed(0)}`, color: 'text-amber-600', icon: <AlertTriangle size={20} />, sub: `${PAYMENT_TRANSACTIONS.filter(p => p.type === 'cancellation').length} cancellations` },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <div className="text-gray-400">{stat.icon}</div>
                      </div>
                      <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Payments */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Recent Payments</h3>
                      <button onClick={() => setActiveTab('payments')} className="text-xs text-red-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                      {PAYMENT_TRANSACTIONS.slice(0, 4).map(p => (
                        <div key={p.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.type === 'cancellation' ? 'bg-amber-100' : 'bg-green-100'}`}>
                              {p.type === 'cancellation' ? <AlertTriangle size={14} className="text-amber-600" /> : <CheckCircle size={14} className="text-green-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.customer}</p>
                              <p className="text-xs text-gray-500">{p.service} · {p.card}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${p.type === 'cancellation' ? 'text-amber-600' : 'text-green-600'}`}>R{p.amount.toFixed(0)}</p>
                            <p className="text-xs text-gray-400">{p.ref.slice(0, 15)}...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Worker Approvals */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Worker Approvals Pending</h3>
                    <div className="space-y-3">
                      {PENDING_WORKERS.map(w => (
                        <div key={w.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{w.name}</p>
                            <p className="text-xs text-gray-500">{w.services.join(', ')}</p>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"><CheckCircle size={14} /></button>
                            <button className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"><XCircle size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Revenue Split Visualization */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Revenue Split</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                        <div className="bg-blue-500 transition-all" style={{ width: `${(totalWorkerPayouts / (totalRevenue + totalCancellationFees)) * 100}%` }} />
                        <div className="bg-red-500 transition-all" style={{ width: `${(totalCommission / (totalRevenue + totalCancellationFees)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Worker Payouts</p>
                      <p className="font-bold text-blue-600">R{totalWorkerPayouts.toFixed(0)}</p>
                    </div>
                    <div>
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Platform Commission</p>
                      <p className="font-bold text-red-600">R{(totalCommission - totalCancellationFees).toFixed(0)}</p>
                    </div>
                    <div>
                      <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Cancellation Fees</p>
                      <p className="font-bold text-amber-600">R{totalCancellationFees.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== WORKERS ===== */}
            {activeTab === 'workers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Worker Management</h2>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={workerSearch} onChange={e => setWorkerSearch(e.target.value)} placeholder="Search workers..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-yellow-500" /> Pending Approvals ({PENDING_WORKERS.length})</h3>
                  <div className="space-y-4">
                    {PENDING_WORKERS.map(w => (
                      <div key={w.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div><h4 className="font-semibold text-gray-900">{w.name}</h4><p className="text-sm text-gray-500">{w.email} · Applied {w.appliedDate}</p></div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">{w.services.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s}</span>)}</div>
                        <div className="flex flex-wrap gap-3 mb-4 text-sm">
                          <span className={`flex items-center gap-1 ${w.idUploaded ? 'text-green-600' : 'text-red-500'}`}>{w.idUploaded ? <CheckCircle size={14} /> : <XCircle size={14} />} ID Document</span>
                          <span className={`flex items-center gap-1 ${w.policeUploaded ? 'text-green-600' : 'text-red-500'}`}>{w.policeUploaded ? <CheckCircle size={14} /> : <XCircle size={14} />} Police Clearance</span>
                          {w.services.includes('Cooking') && <span className={`flex items-center gap-1 ${w.cookingCert ? 'text-green-600' : 'text-red-500'}`}>{w.cookingCert ? <CheckCircle size={14} /> : <XCircle size={14} />} Cooking Certificate</span>}
                        </div>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-1"><CheckCircle size={14} /> Approve</button>
                          <button className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition flex items-center gap-1"><XCircle size={14} /> Reject</button>
                          <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition flex items-center gap-1"><Eye size={14} /> View Docs</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BadgeCheck size={18} className="text-blue-600" /> Active Workers ({MOCK_WORKERS.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100"><th className="text-left py-3 px-2 font-semibold text-gray-500">Worker</th><th className="text-left py-3 px-2 font-semibold text-gray-500">Services</th><th className="text-left py-3 px-2 font-semibold text-gray-500">Rating</th><th className="text-left py-3 px-2 font-semibold text-gray-500">Jobs</th><th className="text-left py-3 px-2 font-semibold text-gray-500">Status</th><th className="text-left py-3 px-2 font-semibold text-gray-500">Actions</th></tr></thead>
                      <tbody>
                        {MOCK_WORKERS.filter(w => w.name.toLowerCase().includes(workerSearch.toLowerCase())).map(w => (
                          <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-2"><div className="flex items-center gap-3"><img src={w.photo} alt={w.name} className="w-8 h-8 rounded-full object-cover" /><span className="font-medium text-gray-900">{w.name}</span></div></td>
                            <td className="py-3 px-2 text-gray-600">{w.services.join(', ')}</td>
                            <td className="py-3 px-2"><div className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" />{w.rating}</div></td>
                            <td className="py-3 px-2 text-gray-600">{w.reviews}</td>
                            <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{w.available ? 'Active' : 'Offline'}</span></td>
                            <td className="py-3 px-2"><button className="text-xs text-red-600 font-medium hover:underline">Suspend</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== BOOKINGS ===== */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(f => (
                      <button key={f} onClick={() => setBookingFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${bookingFilter === f ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f === 'all' ? 'All' : f.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Service</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Worker</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Total</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{b.service}</td>
                            <td className="py-3 px-4 text-gray-600">{b.customer}</td>
                            <td className="py-3 px-4 text-gray-600">{b.worker}</td>
                            <td className="py-3 px-4 text-gray-600">{b.date}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900">R{b.total}</td>
                            <td className="py-3 px-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(b.status)}`}>{b.status}</span></td>
                            <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusColor(b.paymentStatus)}`}>{b.paymentStatus === 'cancelled_fee_paid' ? 'Fee Paid' : b.paymentStatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== PAYMENTS (ENHANCED) ===== */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Management</h2>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <ArrowUpRight size={16} className="text-green-500" />
                    </div>
                    <p className="text-2xl font-black text-green-600">R{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{PAYMENT_TRANSACTIONS.filter(p => p.type === 'service').length} service payments</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-500">Worker Payouts</p>
                      <ArrowDownRight size={16} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-black text-blue-600">R{totalWorkerPayouts.toFixed(0)}</p>
                    <p className="text-xs text-gray-400 mt-1">80% of service revenue</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-500">Platform Commission</p>
                      <TrendingUp size={16} className="text-purple-500" />
                    </div>
                    <p className="text-2xl font-black text-purple-600">R{totalCommission.toFixed(0)}</p>
                    <p className="text-xs text-gray-400 mt-1">20% commission + fees</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-500">Cancellation Fees</p>
                      <AlertTriangle size={16} className="text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-amber-600">R{totalCancellationFees.toFixed(0)}</p>
                    <p className="text-xs text-gray-400 mt-1">{PAYMENT_TRANSACTIONS.filter(p => p.type === 'cancellation').length} cancellation{PAYMENT_TRANSACTIONS.filter(p => p.type === 'cancellation').length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Transaction Filter */}
                <div className="flex gap-2">
                  {(['all', 'service', 'cancellation'] as const).map(f => (
                    <button key={f} onClick={() => setPaymentFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${paymentFilter === f ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {f === 'all' ? 'All Transactions' : f === 'service' ? 'Service Payments' : 'Cancellation Fees'}
                    </button>
                  ))}
                </div>

                {/* Transaction Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Reference</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Worker</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Service</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Split</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-500">Card</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map(p => (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <p className="font-mono text-xs text-gray-900">{p.ref.slice(0, 18)}</p>
                              <p className="font-mono text-xs text-gray-400">{p.invoice}</p>
                            </td>
                            <td className="py-3 px-4 text-gray-700">{p.customer}</td>
                            <td className="py-3 px-4 text-gray-700">{p.worker}</td>
                            <td className="py-3 px-4 text-gray-700">{p.service}</td>
                            <td className="py-3 px-4 text-gray-600">{p.date}</td>
                            <td className="py-3 px-4 font-bold text-gray-900">R{p.amount.toFixed(0)}</td>
                            <td className="py-3 px-4">
                              {p.type === 'service' ? (
                                <div className="text-xs">
                                  <span className="text-blue-600">W: R{p.workerShare}</span>
                                  <span className="text-gray-400 mx-1">|</span>
                                  <span className="text-red-600">P: R{p.commission}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-amber-600">Platform: R{p.commission}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.type === 'cancellation' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {p.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-500">{p.card}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SERVICES ===== */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Service & Pricing Management</h2>

                {/* Pricing Rules */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign size={18} className="text-red-600" />
                    <h3 className="font-bold text-gray-900">Payment & Pricing Rules</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission Rate</label>
                      <p className="text-xs text-gray-400 mb-2">Percentage taken from each service payment</p>
                      <div className="flex items-center gap-2">
                        <input type="number" value={commissionRate} onChange={e => { setCommissionRate(Number(e.target.value)); setRulesSaved(false); }} className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold" min={0} max={100} />
                        <span className="text-sm text-gray-500 font-medium">%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Worker receives {100 - commissionRate}% of service total</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Fee Rate</label>
                      <p className="text-xs text-gray-400 mb-2">Charged when customer cancels after worker assigned</p>
                      <div className="flex items-center gap-2">
                        <input type="number" value={cancellationRate} onChange={e => { setCancellationRate(Number(e.target.value)); setRulesSaved(false); }} className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold" min={0} max={100} />
                        <span className="text-sm text-gray-500 font-medium">% of booking total</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Rules */}
                  <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Cancellation Policy Rules</h4>
                    <div className="space-y-2 text-sm text-amber-700">
                      <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                        <div>
                          <p className="font-medium">Before Worker Assigned</p>
                          <p className="text-xs text-amber-600">Customer can cancel freely</p>
                        </div>
                        <span className="font-bold text-green-600">Free</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                        <div>
                          <p className="font-medium">After Worker Assigned</p>
                          <p className="text-xs text-amber-600">Cancellation fee applies</p>
                        </div>
                        <span className="font-bold text-amber-700">{cancellationRate}%</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                        <div>
                          <p className="font-medium">Worker En Route</p>
                          <p className="text-xs text-amber-600">Higher cancellation fee</p>
                        </div>
                        <span className="font-bold text-red-600">{Math.min(cancellationRate + 20, 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setRulesSaved(true)}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${rulesSaved ? 'bg-green-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                  >
                    {rulesSaved ? <><CheckCircle size={14} /> Rules Saved</> : 'Save Pricing Rules'}
                  </button>
                </div>
              </div>
            )}

            {/* ===== ANALYTICS ===== */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Bookings', value: ALL_BOOKINGS.length, change: '+12%' },
                    { label: 'Completion Rate', value: `${((ALL_BOOKINGS.filter(b => b.status === 'completed').length / ALL_BOOKINGS.length) * 100).toFixed(0)}%`, change: '+3%' },
                    { label: 'Avg. Booking Value', value: `R${(totalRevenue / Math.max(PAYMENT_TRANSACTIONS.filter(p => p.type === 'service').length, 1)).toFixed(0)}`, change: '+5%' },
                    { label: 'Payment Success Rate', value: '98.5%', change: '+0.5%' },
                    { label: 'New Customers', value: '23', change: '+8' },
                    { label: 'Avg. Rating', value: '4.8', change: '+0.1' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <div className="flex items-end gap-2 mt-1">
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <span className="text-xs text-green-600 font-medium mb-1">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Bookings by Service</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'House Cleaning', count: 45, pct: 35 },
                      { name: 'Cooking', count: 28, pct: 22 },
                      { name: 'Laundry', count: 22, pct: 17 },
                      { name: 'Car Washing', count: 15, pct: 12 },
                      { name: 'Yard Cleaning', count: 10, pct: 8 },
                      { name: 'Waste Removal', count: 5, pct: 4 },
                      { name: 'Basic Home Help', count: 3, pct: 2 },
                    ].map(s => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">{s.name}</span>
                          <span className="text-gray-500">{s.count} bookings ({s.pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-red-600 rounded-full h-2 transition-all" style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
