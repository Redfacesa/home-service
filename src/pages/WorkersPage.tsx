import React, { useState } from 'react';
import { MOCK_WORKERS, SERVICE_CATEGORIES } from '@/lib/constants';
import { Search, Star, MapPin, BadgeCheck, ShieldCheck, X, Clock, Award, ChefHat, Filter } from 'lucide-react';

interface WorkersPageProps {
  onSelectWorker: (workerId: string) => void;
  selectedWorkerId?: string | null;
  onBookWorker: (workerId: string) => void;
}

const WorkersPage: React.FC<WorkersPageProps> = ({ onSelectWorker, selectedWorkerId, onBookWorker }) => {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'price'>('rating');
  const [detailWorker, setDetailWorker] = useState<string | null>(selectedWorkerId || null);

  const allServices = ['all', ...new Set(MOCK_WORKERS.flatMap(w => w.services))];

  const filtered = MOCK_WORKERS
    .filter(w => {
      const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.area.toLowerCase().includes(search.toLowerCase());
      const matchService = serviceFilter === 'all' || w.services.includes(serviceFilter);
      const matchAvailable = !availableOnly || w.available;
      return matchSearch && matchService && matchAvailable;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return a.hourlyRate - b.hourlyRate;
    });

  const selectedWorker = MOCK_WORKERS.find(w => w.id === detailWorker);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3">Find a Worker</h1>
          <p className="text-red-100 max-w-xl">Browse verified professionals in your area. Every worker is background-checked and ready to help.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or area..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              {allServices.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Services' : s}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price">Lowest Price</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={e => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">Available Only</span>
            </label>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">{filtered.length} worker{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(worker => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-gray-100 hover:border-red-200 shadow-sm hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
              onClick={() => setDetailWorker(worker.id)}
            >
              <div className="relative h-52 overflow-hidden">
                <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {worker.verified && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <BadgeCheck size={12} />
                    Verified
                  </div>
                )}
                {!worker.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold">Currently Unavailable</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{worker.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={12} />
                      {worker.area}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{worker.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {worker.services.map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {worker.policeClear && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <ShieldCheck size={12} /> Cleared
                    </span>
                  )}
                  {worker.cookingCert && (
                    <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                      <ChefHat size={12} /> Certified Cook
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{worker.reviews}</span> reviews</span>
                  <span className="text-sm font-bold text-red-600">R{worker.hourlyRate}/hr</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No workers found matching your criteria</p>
            <button onClick={() => { setSearch(''); setServiceFilter('all'); setAvailableOnly(false); }} className="mt-4 text-red-600 font-semibold hover:underline">Clear filters</button>
          </div>
        )}
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetailWorker(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-64">
              <img src={selectedWorker.photo} alt={selectedWorker.name} className="w-full h-full object-cover" />
              <button onClick={() => setDetailWorker(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
                <X size={20} />
              </button>
              {selectedWorker.verified && (
                <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
                  <BadgeCheck size={16} />
                  Verified by Red Face
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedWorker.name}</h2>
                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin size={14} />
                    <span>{selectedWorker.area}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xl font-bold text-gray-900">{selectedWorker.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{selectedWorker.reviews} reviews</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{selectedWorker.bio}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Clock size={14} />
                    Experience
                  </div>
                  <p className="font-bold text-gray-900">{selectedWorker.experience} years</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Award size={14} />
                    Rate
                  </div>
                  <p className="font-bold text-red-600">R{selectedWorker.hourlyRate}/hr</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Services Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWorker.services.map(s => (
                    <span key={s} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Verification Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={16} className={selectedWorker.verified ? 'text-green-500' : 'text-gray-300'} />
                    <span className="text-sm text-gray-700">Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className={selectedWorker.policeClear ? 'text-green-500' : 'text-gray-300'} />
                    <span className="text-sm text-gray-700">Police Clearance</span>
                  </div>
                  {selectedWorker.services.includes('Cooking') && (
                    <div className="flex items-center gap-2">
                      <ChefHat size={16} className={selectedWorker.cookingCert ? 'text-green-500' : 'text-gray-300'} />
                      <span className="text-sm text-gray-700">Cooking Certificate</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => { onBookWorker(selectedWorker.id); setDetailWorker(null); }}
                disabled={!selectedWorker.available}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {selectedWorker.available ? 'Request This Worker' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersPage;
