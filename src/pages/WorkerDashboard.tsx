import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, DollarSign, FileText, User, Upload, CheckCircle, AlertCircle, MapPin, Star, Briefcase, Shield, ChefHat, Eye, Loader2 } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/constants';

type Tab = 'overview' | 'pending' | 'active' | 'completed' | 'earnings' | 'profile' | 'documents';

const MOCK_PENDING_JOBS = [
  { id: '1', service: 'House Cleaning', customer: 'Sarah van der Merwe', date: '2026-03-12', time: '09:00', address: '45 Main Rd, Sandton', total: 360 },
  { id: '2', service: 'Laundry', customer: 'James Pillay', date: '2026-03-13', time: '14:00', address: '12 Beach Rd, Umhlanga', total: 275 },
];

const MOCK_ACTIVE_JOBS = [
  { id: '3', service: 'House Cleaning', customer: 'Lisa Fourie', date: '2026-03-09', time: '08:00', address: '78 Palm Ave, Constantia', total: 360, status: 'in_progress' },
];

const MOCK_COMPLETED_JOBS = [
  { id: '4', service: 'Laundry', customer: 'Anele Mbeki', date: '2026-03-05', total: 275, rating: 5 },
  { id: '5', service: 'House Cleaning', customer: 'Sarah van der Merwe', date: '2026-03-01', total: 360, rating: 4 },
  { id: '6', service: 'House Cleaning', customer: 'James Pillay', date: '2026-02-25', total: 360, rating: 5 },
];

const WorkerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedServices, setSelectedServices] = useState<string[]>(['House Cleaning', 'Laundry']);
  const [isAvailable, setIsAvailable] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Briefcase size={16} /> },
    { id: 'pending', label: 'Pending Jobs', icon: <Clock size={16} /> },
    { id: 'active', label: 'Active Jobs', icon: <Calendar size={16} /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle size={16} /> },
    { id: 'earnings', label: 'Earnings', icon: <DollarSign size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
  ];

  const totalEarnings = MOCK_COMPLETED_JOBS.reduce((sum, j) => sum + j.total * 0.8, 0);

  const handleFileUpload = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(type);
    try {
      const path = `${profile.id}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('worker-documents').upload(path, file);
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(null);
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Worker Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {profile?.full_name || 'Worker'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Availability:</span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative w-12 h-6 rounded-full transition ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isAvailable ? 'left-6' : 'left-0.5'}`} />
              </button>
              <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                {isAvailable ? 'Available' : 'Offline'}
              </span>
            </div>
          </div>
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
                  {tab.id === 'pending' && MOCK_PENDING_JOBS.length > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{MOCK_PENDING_JOBS.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Pending Jobs</p>
                    <p className="text-3xl font-black text-yellow-600 mt-1">{MOCK_PENDING_JOBS.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Active Jobs</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">{MOCK_ACTIVE_JOBS.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-3xl font-black text-green-600 mt-1">{MOCK_COMPLETED_JOBS.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <p className="text-3xl font-black text-red-600 mt-1">R{totalEarnings.toFixed(0)}</p>
                  </div>
                </div>

                {/* Pending Jobs Preview */}
                {MOCK_PENDING_JOBS.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">New Job Requests</h3>
                    {MOCK_PENDING_JOBS.map(job => (
                      <div key={job.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl mb-3 last:mb-0">
                        <div>
                          <h4 className="font-semibold text-gray-900">{job.service}</h4>
                          <p className="text-sm text-gray-500">{job.customer} · {job.date} at {job.time}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition">Accept</button>
                          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Verification Status */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Verification Status</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Identity Verified', done: true, icon: <Shield size={16} /> },
                      { label: 'Police Clearance', done: true, icon: <Shield size={16} /> },
                      { label: 'Profile Complete', done: true, icon: <User size={16} /> },
                      { label: 'Cooking Certificate', done: false, icon: <ChefHat size={16} /> },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {item.icon}
                        </div>
                        <span className={`text-sm ${item.done ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{item.label}</span>
                        {item.done ? <CheckCircle size={14} className="text-green-500 ml-auto" /> : <AlertCircle size={14} className="text-gray-400 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pending Jobs */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Pending Job Requests</h2>
                {MOCK_PENDING_JOBS.map(job => (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{job.service}</h3>
                        <p className="text-sm text-gray-500 mt-1">Requested by {job.customer}</p>
                      </div>
                      <span className="text-xl font-black text-red-600">R{job.total}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-500"><Calendar size={14} />{job.date}</div>
                      <div className="flex items-center gap-2 text-gray-500"><Clock size={14} />{job.time}</div>
                      <div className="flex items-center gap-2 text-gray-500"><MapPin size={14} />{job.address}</div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition">Accept Job</button>
                      <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Jobs */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Active Jobs</h2>
                {MOCK_ACTIVE_JOBS.map(job => (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{job.service}</h3>
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-purple-100 text-purple-700 mt-1">In Progress</span>
                      </div>
                      <span className="text-xl font-black text-red-600">R{job.total}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-500"><User size={14} />{job.customer}</div>
                      <div className="flex items-center gap-2 text-gray-500"><Clock size={14} />{job.time}</div>
                      <div className="flex items-center gap-2 text-gray-500"><MapPin size={14} />{job.address}</div>
                    </div>
                    <button className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">
                      Mark as Completed
                    </button>
                  </div>
                ))}
                {MOCK_ACTIVE_JOBS.length === 0 && <p className="text-center text-gray-500 py-8">No active jobs</p>}
              </div>
            )}

            {/* Completed */}
            {activeTab === 'completed' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Completed Jobs</h2>
                {MOCK_COMPLETED_JOBS.map(job => (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{job.service}</h4>
                      <p className="text-sm text-gray-500">{job.customer} · {job.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R{(job.total * 0.8).toFixed(0)}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: job.rating }).map((_, i) => (
                          <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Earnings */}
            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Earnings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-3xl font-black text-green-600 mt-1">R{totalEarnings.toFixed(0)}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Jobs This Month</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{MOCK_COMPLETED_JOBS.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm text-gray-500">Avg. per Job</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">R{(totalEarnings / MOCK_COMPLETED_JOBS.length).toFixed(0)}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Earnings</h3>
                  <div className="space-y-3">
                    {MOCK_COMPLETED_JOBS.map(job => (
                      <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{job.service}</p>
                          <p className="text-xs text-gray-500">{job.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+R{(job.total * 0.8).toFixed(0)}</p>
                          <p className="text-xs text-gray-400">Commission: R{(job.total * 0.2).toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Worker Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={profile?.full_name || ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none" rows={3} placeholder="Tell customers about yourself..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services You Offer</label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_CATEGORIES.map(s => (
                        <button
                          key={s.name}
                          onClick={() => toggleService(s.name)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            selectedServices.includes(s.name) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (ZAR)</label>
                    <input type="number" defaultValue={120} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition">Save Profile</button>
                </div>
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Documents & Verification</h2>
                {[
                  { type: 'id', label: 'South African ID', desc: 'Upload a copy of your SA ID document or smart card', required: true },
                  { type: 'police', label: 'Police Clearance', desc: 'Upload your police clearance certificate showing no criminal record', required: true },
                  { type: 'cooking', label: 'Cooking Certificate', desc: 'Required if you offer cooking services. Upload your food handling certificate', required: false },
                  { type: 'photo', label: 'Profile Photo', desc: 'Upload a clear, professional photo of yourself in Red Face uniform', required: true },
                ].map(doc => (
                  <div key={doc.type} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          {doc.label}
                          {doc.required && <span className="text-xs text-red-500 font-normal">Required</span>}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{doc.desc}</p>
                      </div>
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                    <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 cursor-pointer transition">
                      {uploading === doc.type ? (
                        <Loader2 size={20} className="text-red-600 animate-spin" />
                      ) : (
                        <Upload size={20} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {uploading === doc.type ? 'Uploading...' : 'Click to upload or replace document'}
                      </span>
                      <input type="file" className="hidden" onChange={e => handleFileUpload(doc.type, e)} accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
