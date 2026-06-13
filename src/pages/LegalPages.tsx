import Footer from "@/components/Footer";
import { FAQ_ITEMS } from "@/lib/constants";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

const PageShell = ({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">RF</span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">Red Face</span>
            <span className="text-xs block text-gray-500 -mt-0.5">Home Services</span>
          </div>
        </Link>
        <Link to="/" className="text-sm font-bold text-red-600 hover:text-red-700">
          Back home
        </Link>
      </div>
    </header>
    <main className="flex-1">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600 mb-3">{eyebrow}</p>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">{title}</h1>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 text-gray-700 leading-relaxed space-y-6">
          {children}
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-xl font-black text-gray-900 mb-2">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export const PrivacyPolicy = () => (
  <PageShell eyebrow="Privacy" title="Privacy Policy">
    <Section title="Information we collect">
      <p>We collect account details, booking information, service addresses, communication preferences, and payment-related records needed to operate Red Face Home Services.</p>
    </Section>
    <Section title="How we use information">
      <p>Your information helps us match customers with workers, verify users, manage bookings, process payments, resolve disputes, improve safety, and provide customer support.</p>
    </Section>
    <Section title="Security and sharing">
      <p>We only share information where needed to provide the service, comply with the law, process payments, or protect the safety of customers, workers, and the platform.</p>
    </Section>
  </PageShell>
);

export const TermsOfService = () => (
  <PageShell eyebrow="Terms" title="Terms of Service">
    <Section title="Using Red Face">
      <p>Customers agree to provide accurate booking information and treat workers respectfully. Workers agree to maintain verification, quality, and safety standards.</p>
    </Section>
    <Section title="Bookings and payments">
      <p>Bookings are confirmed through the platform. Customers pay securely after the service is completed, and platform commission is deducted before worker payout.</p>
    </Section>
    <Section title="Responsibilities">
      <p>Workers are independent service providers. Red Face provides the marketplace, verification process, booking tools, and dispute support.</p>
    </Section>
  </PageShell>
);

export const CancellationPolicy = () => (
  <PageShell eyebrow="Cancellations" title="Cancellation Policy">
    <Section title="Before assignment">
      <p>You can cancel free of charge before a worker is assigned to your booking.</p>
    </Section>
    <Section title="After assignment">
      <p>If a worker has accepted or is already travelling to the job, a cancellation fee may apply to compensate the worker for reserved time and travel.</p>
    </Section>
    <Section title="Missed appointments">
      <p>If the worker cannot access the property at the agreed time, the booking may be marked as missed and cancellation fees may apply.</p>
    </Section>
  </PageShell>
);

export const SafetyAndSecurity = () => (
  <PageShell eyebrow="Safety" title="Safety & Security">
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 text-red-900">
      <ShieldCheck className="mt-1 shrink-0" />
      <p className="font-semibold">Red Face is built around worker verification, transparent profiles, secure payments, and customer support.</p>
    </div>
    <Section title="Worker verification">
      <p>Workers may be screened using identity checks, police clearance, certificates for specialised services, and ongoing review monitoring.</p>
    </Section>
    <Section title="Safer payments">
      <p>Payments are handled through the platform after completion, which reduces cash handling and creates a clear record of each job.</p>
    </Section>
    <Section title="Support and disputes">
      <p>Customers and workers can report issues so the Red Face team can investigate and resolve problems fairly.</p>
    </Section>
  </PageShell>
);

export const FAQ = () => (
  <PageShell eyebrow="Help" title="Frequently Asked Questions">
    <div className="space-y-4">
      {FAQ_ITEMS.map(item => (
        <details key={item.q} className="group rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <summary className="cursor-pointer font-black text-gray-900">{item.q}</summary>
          <p className="mt-3 text-gray-600">{item.a}</p>
        </details>
      ))}
    </div>
  </PageShell>
);

export const ContactUs = () => (
  <PageShell eyebrow="Contact" title="Contact Us">
    <p>Need help with a booking, worker application, payment, or safety concern? Reach out and the Red Face team will assist.</p>
    <div className="grid md:grid-cols-3 gap-4">
      <a href="tel:+27617780990" className="rounded-2xl border border-gray-100 p-5 hover:border-red-200 transition">
        <Phone className="text-red-600 mb-3" />
        <h2 className="font-black text-gray-900 mb-1">Phone</h2>
        <p className="text-sm text-gray-600">+27 61 778 0990</p>
      </a>
      <a href="https://instagram.com/redfacehomeservices" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-gray-100 p-5 hover:border-red-200 transition">
        <Mail className="text-red-600 mb-3" />
        <h2 className="font-black text-gray-900 mb-1">Instagram</h2>
        <p className="text-sm text-gray-600">@redfacehomeservices</p>
      </a>
      <div className="rounded-2xl border border-gray-100 p-5">
        <MapPin className="text-red-600 mb-3" />
        <h2 className="font-black text-gray-900 mb-1">Address</h2>
        <p className="text-sm text-gray-600">29 Fairbridge Road, Table View, 7441, South Africa</p>
      </div>
    </div>
  </PageShell>
);
