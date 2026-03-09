import React, { useState } from 'react';
import { IMAGES, SERVICE_CATEGORIES, MOCK_WORKERS, TESTIMONIALS, FAQ_ITEMS } from '@/lib/constants';
import { Shield, Clock, CreditCard, Users, Star, ChevronDown, ChevronUp, CheckCircle, ArrowRight, BadgeCheck, MapPin } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (tab?: 'login' | 'signup', role?: 'customer' | 'worker') => void;
  onSelectService: (service: string) => void;
  onSelectWorker: (workerId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth, onSelectService, onSelectWorker }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-900">
        <div className="absolute inset-0 opacity-20">
          <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
              <Shield size={14} className="text-red-400" />
              <span className="text-red-300 text-sm font-medium">Verified & Trusted Workers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Trusted Home Services
              <span className="block text-red-500">at Your Fingertips</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
              South Africa's premier marketplace connecting you with verified, background-checked home service professionals. From cleaning to cooking, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('booking')}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2 text-lg"
              >
                Book a Service
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => onOpenAuth('signup', 'worker')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                Become a Worker
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-3">
                {IMAGES.workers.slice(0, 4).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-10 h-10 rounded-full border-2 border-gray-900 object-cover" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">Trusted by 5,000+ South African families</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '5,000+', label: 'Happy Customers' },
              { num: '500+', label: 'Verified Workers' },
              { num: '15,000+', label: 'Jobs Completed' },
              { num: '4.8/5', label: 'Average Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl lg:text-3xl font-black text-gray-900">{stat.num}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Browse our range of professional home services, all delivered by verified and background-checked workers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SERVICE_CATEGORIES.map((service, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all group cursor-pointer"
                onClick={() => onSelectService(service.name)}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 bg-red-50 p-2">
                  <img src={service.icon} alt={service.name} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-red-600 transition">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.desc}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 font-bold text-sm">{service.price}</p>
                    <p className="text-xs text-gray-400">{service.duration}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectService(service.name); }}
                    className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-600 hover:text-white transition"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('services')}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition inline-flex items-center gap-2"
            >
              View All Services
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Getting help at home has never been easier. Four simple steps to a cleaner, happier home.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose a Service', desc: 'Browse our services and select what you need — cleaning, cooking, laundry, and more.', icon: <Users size={28} /> },
              { step: '02', title: 'Pick a Worker', desc: 'Browse verified worker profiles or let us auto-match the best available professional.', icon: <BadgeCheck size={28} /> },
              { step: '03', title: 'Confirm Booking', desc: 'Set your date, time, and address. Review details and accept the cancellation policy.', icon: <Clock size={28} /> },
              { step: '04', title: 'Pay After Completion', desc: 'Your worker arrives, completes the job, and you pay securely through the website.', icon: <CreditCard size={28} /> },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-5 group-hover:bg-red-600 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Step {item.step}</span>
                <h3 className="font-bold text-gray-900 text-lg mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Your Safety, Our Priority</h2>
            <p className="text-red-100 max-w-2xl mx-auto">Every Red Face worker goes through a rigorous verification process before they can accept any jobs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'ID Verification', desc: 'Every worker\'s South African ID is verified before they can join the platform.' },
              { title: 'Police Clearance', desc: 'All workers must provide a clean criminal record check — no exceptions.' },
              { title: 'Cooking Certificates', desc: 'Workers offering cooking services must hold valid food handling qualifications.' },
              { title: 'Verified Badge', desc: 'Only workers who pass all checks receive the "Verified by Red Face" badge.' },
              { title: 'Pre-Arrival Details', desc: 'See your worker\'s photo, name, and verification status before they arrive.' },
              { title: 'Secure Payments', desc: 'All payments are processed through the website — never pay a worker directly.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <CheckCircle size={24} className="text-white mb-3" />
                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-red-100 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">Featured Workers</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Meet some of our top-rated, verified professionals ready to help.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_WORKERS.slice(0, 6).map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-red-200 shadow-sm hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
                onClick={() => onSelectWorker(worker.id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {worker.verified && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <BadgeCheck size={12} />
                      Verified
                    </div>
                  )}
                  {!worker.available && (
                    <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Unavailable
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
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{worker.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {worker.services.map(s => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">{worker.reviews}</span> reviews
                    </div>
                    <span className="text-sm font-bold text-red-600">R{worker.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('workers')}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition inline-flex items-center gap-2"
            >
              View All Workers
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={20} className="text-gray-400 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of South African families who trust Red Face for their home service needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('booking')}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl shadow-red-600/30 transition-all inline-flex items-center justify-center gap-2"
            >
              Book a Service Now
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => onOpenAuth('signup', 'worker')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition"
            >
              Join as a Worker
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
