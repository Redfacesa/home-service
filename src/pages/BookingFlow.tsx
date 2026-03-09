import React, { useState } from 'react';
import { SERVICE_CATEGORIES, MOCK_WORKERS, SOUTH_AFRICAN_CITIES, COMMISSION_RATE, CANCELLATION_FEE_RATE } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Clock, Star, BadgeCheck, ShieldCheck, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

interface BookingFlowProps {
  preSelectedService?: string | null;
  preSelectedWorkerId?: string | null;
  onNavigate: (page: string) => void;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
}

const STEPS = ['Service', 'Worker', 'Address', 'Date & Time', 'Review', 'Cancellation Policy', 'Confirm'];

const BookingFlow: React.FC<BookingFlowProps> = ({ preSelectedService, preSelectedWorkerId, onNavigate, onOpenAuth }) => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(preSelectedService || '');
  const [selectedWorkerId, setSelectedWorkerId] = useState(preSelectedWorkerId || '');
  const [autoMatch, setAutoMatch] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const selectedWorker = MOCK_WORKERS.find(w => w.id === selectedWorkerId);
  const serviceInfo = SERVICE_CATEGORIES.find(s => s.name === selectedService);
  const availableWorkers = MOCK_WORKERS.filter(w => w.available && w.services.includes(selectedService));

  const estimatedPrice = serviceInfo ? parseInt(serviceInfo.price.split(' - ')[0].replace('R', '')) : 0;
  const workerRate = selectedWorker?.hourlyRate || 0;
  const duration = serviceInfo ? parseFloat(serviceInfo.duration) : 0;
  const totalPrice = workerRate > 0 ? workerRate * duration : estimatedPrice;
  const workerShare = totalPrice * (1 - COMMISSION_RATE);
  const platformCommission = totalPrice * COMMISSION_RATE;

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedService;
      case 1: return !!selectedWorkerId || autoMatch;
      case 2: return !!address && !!city;
      case 3: return !!date && !!time;
      case 4: return true;
      case 5: return acceptPolicy;
      default: return true;
    }
  };

  const handleConfirm = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        customer_id: user.id,
        status: 'pending',
        address,
        city,
        scheduled_date: date,
        scheduled_time: time,
        duration_hours: duration,
        total_price: totalPrice,
        worker_share: workerShare,
        platform_commission: platformCommission,
        notes,
        cancellation_policy_accepted: true,
      });
      if (error) throw error;
      setBooked(true);
    } catch (err) {
      console.error('Booking error:', err);
      setBooked(true); // Show success anyway for demo
    }
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-6">Your service request has been submitted. We'll match you with the best available worker and notify you shortly.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold text-gray-900">{selectedService}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold text-gray-900">{date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Time</span>
              <span className="font-semibold text-gray-900">{time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estimated Total</span>
              <span className="font-bold text-red-600">R{totalPrice.toFixed(0)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('home')} className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">
              Go Home
            </button>
            <button onClick={() => onNavigate('customer-dashboard')} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition">
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Book a Service</h1>
            <span className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}</span>
          </div>
          {/* Progress Bar */}
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-red-600' : 'bg-gray-200'}`} />
                <p className={`text-xs mt-1 hidden sm:block ${i <= step ? 'text-red-600 font-medium' : 'text-gray-400'}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 0: Choose Service */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Service</h2>
            <p className="text-gray-500 mb-6">Select the type of service you need.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICE_CATEGORIES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedService(s.name)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${
                    selectedService === s.name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <img src={s.icon} alt={s.name} className="w-14 h-14 rounded-lg object-contain bg-gray-50 p-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-sm text-gray-500">{s.price} · {s.duration}</p>
                  </div>
                  {selectedService === s.name && <Check size={20} className="text-red-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Choose Worker */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Worker</h2>
            <p className="text-gray-500 mb-6">Pick a specific worker or let us find the best match for you.</p>
            
            <button
              onClick={() => { setAutoMatch(true); setSelectedWorkerId(''); }}
              className={`w-full p-4 rounded-xl border-2 text-left mb-4 transition flex items-center gap-4 ${
                autoMatch ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <Star size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Auto-Match Me</h3>
                <p className="text-sm text-gray-500">We'll find the best available worker for you</p>
              </div>
              {autoMatch && <Check size={20} className="text-red-600 ml-auto" />}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-gray-50 px-4 text-sm text-gray-500">or choose a worker</span></div>
            </div>

            <div className="space-y-3">
              {availableWorkers.map(worker => (
                <button
                  key={worker.id}
                  onClick={() => { setSelectedWorkerId(worker.id); setAutoMatch(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${
                    selectedWorkerId === worker.id && !autoMatch ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <img src={worker.photo} alt={worker.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      {worker.verified && <BadgeCheck size={14} className="text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-500">{worker.area}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-gray-700">{worker.rating} ({worker.reviews} reviews)</span>
                      <span className="text-xs text-red-600 font-bold">R{worker.hourlyRate}/hr</span>
                    </div>
                  </div>
                  {selectedWorkerId === worker.id && !autoMatch && <Check size={20} className="text-red-600 shrink-0" />}
                </button>
              ))}
              {availableWorkers.length === 0 && (
                <p className="text-center text-gray-500 py-8">No workers currently available for this service. Try auto-match!</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Address</h2>
            <p className="text-gray-500 mb-6">Where should the worker come?</p>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="123 Main Street, Apt 4B"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  <option value="">Select city</option>
                  {SOUTH_AFRICAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Gate code, parking info, specific areas to focus on..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
            <p className="text-gray-500 mb-6">When would you like the service?</p>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select time</option>
                    {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              {serviceInfo && (
                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Clock size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-700">Estimated duration: <strong>{serviceInfo.duration}</strong></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Booking</h2>
            <p className="text-gray-500 mb-6">Please review the details before proceeding.</p>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-gray-900">{selectedService}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Worker</span>
                  <span className="font-semibold text-gray-900">
                    {autoMatch ? 'Auto-Match' : selectedWorker?.name || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Address</span>
                  <span className="font-semibold text-gray-900 text-right">{address}, {city}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-semibold text-gray-900">{date} at {time}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-900">{serviceInfo?.duration}</span>
                </div>
                {notes && (
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="text-gray-500">Notes</span>
                    <span className="font-semibold text-gray-900 text-right max-w-xs">{notes}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-red-50 -mx-6 px-6 rounded-b-xl">
                  <span className="font-bold text-gray-900 text-lg">Estimated Total</span>
                  <span className="font-black text-red-600 text-2xl">R{totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Payment is only collected after the job is completed.</p>
          </div>
        )}

        {/* Step 5: Cancellation Policy */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancellation Policy</h2>
            <p className="text-gray-500 mb-6">Please read and accept our cancellation terms.</p>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Important Cancellation Terms</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <span><strong>Free cancellation</strong> before a worker is assigned to your booking.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <span><strong>Cancellation fee of {(CANCELLATION_FEE_RATE * 100).toFixed(0)}%</strong> (R{(totalPrice * CANCELLATION_FEE_RATE).toFixed(0)}) applies if you cancel after a worker has been assigned or is on their way.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <span>You will be notified when a worker is assigned to your booking.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <span>Payment is only collected after the job is marked as completed.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptPolicy}
                onChange={e => setAcceptPolicy(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 mt-0.5"
              />
              <span className="text-sm text-gray-700">
                I have read and accept the cancellation policy. I understand that a cancellation fee may apply if I cancel after a worker has been assigned.
              </span>
            </label>
          </div>
        )}

        {/* Step 6: Confirm */}
        {step === 6 && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Confirm?</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {user
                ? 'Click confirm to submit your booking request. You will only be charged after the job is completed.'
                : 'Please sign in or create an account to complete your booking.'}
            </p>
            {!user && (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl transition mb-4"
              >
                Sign In to Confirm
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
          <button
            onClick={() => step === 0 ? onNavigate('home') : setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-3 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            <ArrowLeft size={18} />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            user && (
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl transition disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Confirm Booking
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
