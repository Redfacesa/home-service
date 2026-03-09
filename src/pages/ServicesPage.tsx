import React, { useState } from 'react';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { Search, Clock, ArrowRight, Filter } from 'lucide-react';

interface ServicesPageProps {
  onSelectService: (service: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectService }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');

  const filtered = SERVICE_CATEGORIES
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
      const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
      return priceA - priceB;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3">Our Services</h1>
          <p className="text-red-100 max-w-xl">Browse our full range of professional home services. All workers are verified and background-checked.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'price')}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-6">{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all group"
            >
              <div className="relative h-48 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
                <img src={service.icon} alt={service.name} className="w-28 h-28 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-xl mb-2">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{service.desc}</p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="font-bold text-red-600">{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{service.duration}</span>
                  </div>
                </div>
                <button
                  onClick={() => onSelectService(service.name)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  Request Service
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No services found matching "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-4 text-red-600 font-semibold hover:underline">Clear search</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
