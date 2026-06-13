import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Shield,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import {
  COMMISSION_RATE,
  FAQ_ITEMS,
  IMAGES,
  MOCK_WORKERS,
  SERVICE_CATEGORIES,
  TESTIMONIALS,
} from "@/lib/constants";

type AuthTab = "login" | "signup";
type AuthRole = "customer" | "worker";

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (tab?: AuthTab, role?: AuthRole) => void;
  onSelectService: (service: string) => void;
  onSelectWorker: (workerId: string) => void;
}

interface ServicesPageProps {
  onSelectService: (service: string) => void;
}

interface WorkersPageProps {
  onSelectWorker: (workerId: string) => void;
  selectedWorkerId: string | null;
  onBookWorker: (workerId: string) => void;
}

interface BookingFlowProps {
  preSelectedService: string | null;
  preSelectedWorkerId: string | null;
  onNavigate: (page: string) => void;
  onOpenAuth: (tab?: AuthTab, role?: AuthRole) => void;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const SectionHeader = ({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) => (
  <div className="max-w-3xl mx-auto text-center mb-12">
    <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600 mb-3">{eyebrow}</p>
    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const WorkerCard = ({
  worker,
  selected,
  onSelect,
  onBook,
}: {
  worker: (typeof MOCK_WORKERS)[number];
  selected?: boolean;
  onSelect: (workerId: string) => void;
  onBook: (workerId: string) => void;
}) => (
  <article
    className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-xl transition ${
      selected ? "border-red-500 ring-4 ring-red-100" : "border-gray-100"
    }`}
  >
    <div className="flex gap-4">
      <img src={worker.photo} alt={worker.name} className="w-24 h-24 rounded-2xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black text-lg text-gray-900">{worker.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {worker.area}
            </p>
          </div>
          <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${worker.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {worker.available ? "Available" : "Busy"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Star size={15} fill="currentColor" />
            {worker.rating} ({worker.reviews})
          </span>
          <span className="text-gray-500">{worker.experience} yrs experience</span>
          <span className="text-gray-900 font-bold">R{worker.hourlyRate}/hr</span>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed mt-4">{worker.bio}</p>
    <div className="flex flex-wrap gap-2 mt-4">
      {worker.services.map(service => (
        <span key={service} className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
          {service}
        </span>
      ))}
    </div>
    <div className="flex gap-3 mt-5">
      <button
        onClick={() => onSelect(worker.id)}
        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:border-red-200 hover:text-red-600 transition"
      >
        View Profile
      </button>
      <button
        onClick={() => onBook(worker.id)}
        disabled={!worker.available}
        className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Book
      </button>
    </div>
  </article>
);

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth, onSelectService, onSelectWorker }) => (
  <>
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-red-100 rounded-full px-4 py-2 text-sm font-semibold text-red-700 shadow-sm mb-6">
            <Shield size={16} />
            Verified South African home service workers
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tight leading-tight mb-6">
            Trusted help for a cleaner, easier home.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
            Book verified cleaners, cooks, laundry helpers, car washers, garden workers, and more. Every worker is screened before they enter your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onNavigate("booking")}
              className="px-7 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              Book a Service
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onOpenAuth("signup", "worker")}
              className="px-7 py-4 bg-white text-gray-900 rounded-2xl font-bold border border-gray-200 hover:border-red-200 hover:text-red-600 transition"
            >
              Become a Worker
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-10 max-w-lg">
            {[
              ["500+", "Bookings"],
              ["4.8", "Avg rating"],
              ["7", "Services"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <img src={IMAGES.hero} alt="Home service professional" className="rounded-[2rem] shadow-2xl w-full object-cover aspect-[4/3]" />
          <div className="absolute -bottom-6 -left-6 bg-white rounded-3xl shadow-xl p-5 max-w-xs hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                <UserCheck />
              </div>
              <div>
                <p className="font-black text-gray-900">Police cleared</p>
                <p className="text-sm text-gray-500">Workers verified before booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services"
          title="What can we help with today?"
          description="Choose from common home services with transparent pricing and flexible scheduling."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_CATEGORIES.slice(0, 4).map(service => (
            <button
              key={service.name}
              onClick={() => onSelectService(service.name)}
              className="text-left bg-gray-50 hover:bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-5 shadow-sm hover:shadow-xl transition"
            >
              <img src={service.icon} alt={service.name} className="w-full h-40 object-cover rounded-2xl mb-4" />
              <h3 className="font-black text-gray-900 mb-2">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{service.desc}</p>
              <p className="text-sm font-bold text-red-600">{service.price}</p>
            </button>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => onNavigate("services")} className="font-bold text-red-600 hover:text-red-700">
            View all services
          </button>
        </div>
      </div>
    </section>

    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Workers"
          title="Meet verified local professionals"
          description="Browse trusted workers with ratings, service specialties, and availability."
        />
        <div className="grid lg:grid-cols-3 gap-6">
          {MOCK_WORKERS.slice(0, 3).map(worker => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onSelect={onSelectWorker}
              onBook={() => onSelectWorker(worker.id)}
            />
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => onNavigate("workers")} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">
            Find a Worker
          </button>
        </div>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="Book confidently in three steps"
          description="Red Face keeps the process simple while preserving safety, transparency, and payment control."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            [Sparkles, "Choose a service", "Tell us what you need and when you need it."],
            [Users, "Pick or match", "Choose a worker yourself or let us match the best fit."],
            [CreditCard, "Pay after completion", "Payment is handled securely after the job is done."],
          ].map(([Icon, title, text]) => (
            <div key={title as string} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              {React.createElement(Icon as typeof Sparkles, { className: "text-red-600 mb-5", size: 34 })}
              <h3 className="font-black text-xl text-gray-900 mb-3">{title as string}</h3>
              <p className="text-gray-600">{text as string}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Reviews"
          title="Loved by busy households"
          description="Customers trust Red Face for reliable help, safer bookings, and consistent service."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map(testimonial => (
            <div key={testimonial.name} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex gap-1 text-amber-400 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">"{testimonial.text}"</p>
              <p className="font-bold">{testimonial.name}</p>
              <p className="text-xs text-gray-500">{testimonial.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectService }) => (
  <section className="py-16 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Services"
        title="Reliable home services near you"
        description="Select a service to start a booking. Prices vary by location, worker experience, and job size."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICE_CATEGORIES.map(service => (
          <article key={service.name} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <img src={service.icon} alt={service.name} className="w-full h-52 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.desc}</p>
              <div className="flex justify-between text-sm mb-5">
                <span className="font-bold text-red-600">{service.price}</span>
                <span className="text-gray-500">{service.duration}</span>
              </div>
              <button onClick={() => onSelectService(service.name)} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
                Book {service.name}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const WorkersPage: React.FC<WorkersPageProps> = ({ onSelectWorker, selectedWorkerId, onBookWorker }) => (
  <section className="py-16 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Workers"
        title="Choose your trusted professional"
        description="Every worker is screened and reviewed so you can book with confidence."
      />
      <div className="grid lg:grid-cols-2 gap-6">
        {MOCK_WORKERS.map(worker => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            selected={selectedWorkerId === worker.id}
            onSelect={onSelectWorker}
            onBook={onBookWorker}
          />
        ))}
      </div>
    </div>
  </section>
);

export const BookingFlow: React.FC<BookingFlowProps> = ({ preSelectedService, preSelectedWorkerId, onNavigate, onOpenAuth }) => {
  const [service, setService] = useState(preSelectedService || SERVICE_CATEGORIES[0].name);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const worker = useMemo(() => MOCK_WORKERS.find(item => item.id === preSelectedWorkerId), [preSelectedWorkerId]);
  const selectedService = SERVICE_CATEGORIES.find(item => item.name === service) || SERVICE_CATEGORIES[0];
  const estimatedTotal = worker ? worker.hourlyRate * 3 : 360;
  const platformCommission = estimatedTotal * COMMISSION_RATE;

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Booking"
          title="Tell us what you need"
          description="This restored booking page captures the key request details and keeps the flow available in dev mode."
        />
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Service</label>
              <select value={service} onChange={event => setService(event.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none">
                {SERVICE_CATEGORIES.map(item => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred date</label>
                <input type="date" value={date} onChange={event => setDate(event.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred time</label>
                <input type="time" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Service address</label>
              <textarea
                value={address}
                onChange={event => setAddress(event.target.value)}
                rows={4}
                placeholder="Enter your street address, suburb, and city"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes for the worker</label>
              <textarea rows={4} placeholder="Pets, parking, special cleaning instructions, allergies, or access notes" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none resize-none" />
            </div>
            <button onClick={() => onOpenAuth("signup", "customer")} className="w-full py-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition">
              Continue to Confirm Booking
            </button>
          </div>
          <aside className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-fit">
            <h3 className="font-black text-xl text-gray-900 mb-5">Booking summary</h3>
            <img src={selectedService.icon} alt={selectedService.name} className="w-full h-40 object-cover rounded-2xl mb-4" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Service</span>
                <span className="font-bold text-gray-900 text-right">{selectedService.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Worker</span>
                <span className="font-bold text-gray-900 text-right">{worker?.name || "Best available match"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Estimated total</span>
                <span className="font-black text-gray-900">R{estimatedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Platform fee included</span>
                <span className="font-semibold text-gray-700">R{platformCommission.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-2xl bg-red-50 text-sm text-red-800">
              Payment is only completed once the work is done and accepted.
            </div>
            <button onClick={() => onNavigate("workers")} className="w-full mt-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:text-red-600 hover:border-red-200 transition">
              Choose a worker
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
};

export const CustomerDashboard: React.FC<DashboardProps> = ({ onNavigate }) => (
  <DashboardShell title="Customer Dashboard" subtitle="Track your bookings, favourite workers, and payment status.">
    <DashboardCard icon={Calendar} title="Upcoming booking" value="No active booking" text="Start a new booking when you need trusted home help." />
    <DashboardCard icon={Users} title="Favourite workers" value="0 saved" text="Save workers after viewing their profiles." />
    <DashboardCard icon={CreditCard} title="Payments" value="Ready" text="Secure card payment is available after completion." />
    <button onClick={() => onNavigate?.("booking")} className="md:col-span-3 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition">
      Book a Service
    </button>
  </DashboardShell>
);

export const WorkerDashboard: React.FC = () => (
  <DashboardShell title="Worker Dashboard" subtitle="Manage service requests, availability, documents, and earnings.">
    <DashboardCard icon={CheckCircle} title="Verification" value="Profile ready" text="Keep ID, police clearance, and certificates up to date." />
    <DashboardCard icon={Clock} title="Availability" value="Open" text="Update your schedule so customers can book accurately." />
    <DashboardCard icon={CreditCard} title="Earnings" value="R0.00" text="Completed job payouts appear here." />
  </DashboardShell>
);

export const AdminDashboard: React.FC = () => (
  <DashboardShell title="Admin Dashboard" subtitle="Monitor platform activity, worker verification, bookings, and disputes.">
    <DashboardCard icon={Users} title="Workers" value={String(MOCK_WORKERS.length)} text="Review worker profiles and verification states." />
    <DashboardCard icon={Calendar} title="Bookings" value="0 live" text="Booking activity will appear once connected to production data." />
    <DashboardCard icon={Shield} title="Trust and safety" value="Active" text="Monitor disputes, reviews, and safety reports." />
  </DashboardShell>
);

const DashboardShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="py-16 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600 mb-3">Dashboard</p>
        <h1 className="text-4xl font-black text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">{children}</div>
    </div>
  </section>
);

const DashboardCard = ({ icon: Icon, title, value, text }: { icon: typeof Calendar; title: string; value: string; text: string }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">
      <Icon />
    </div>
    <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
    <p className="text-2xl font-black text-gray-900 mb-3">{value}</p>
    <p className="text-sm text-gray-600">{text}</p>
  </div>
);

export { FAQ_ITEMS };
