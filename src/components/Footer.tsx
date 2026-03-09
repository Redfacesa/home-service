import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">RF</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">Red Face</span>
                <span className="text-xs block text-gray-400 -mt-0.5">Home Services</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              South Africa's trusted marketplace for verified home service workers. Safe, reliable, and professional.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {['House Cleaning', 'Cooking', 'Laundry', 'Car Washing', 'Yard Cleaning', 'Waste Removal', 'Basic Home Help'].map(s => (
                <li key={s}>
                  <button onClick={() => onNavigate('services')} className="text-sm text-gray-400 hover:text-white transition">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', page: 'home' },
                { label: 'How It Works', page: 'home' },
                { label: 'Become a Worker', page: 'home' },
                { label: 'Safety & Trust', page: 'home' },
                { label: 'Pricing', page: 'services' },
                { label: 'FAQ', page: 'home' },
                { label: 'Contact Us', page: 'home' },
              ].map(item => (
                <li key={item.label}>
                  <button onClick={() => onNavigate(item.page)} className="text-sm text-gray-400 hover:text-white transition">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Sandton City, Johannesburg, South Africa</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-red-500 shrink-0" />
                <span className="text-sm text-gray-400">+27 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-red-500 shrink-0" />
                <span className="text-sm text-gray-400">hello@redface.co.za</span>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-white text-sm font-medium mb-2">Operating Hours</h5>
              <p className="text-xs text-gray-400">Mon - Sat: 06:00 - 20:00</p>
              <p className="text-xs text-gray-400">Sun: 08:00 - 16:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Red Face Home Services (Pty) Ltd. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button className="text-xs text-gray-500 hover:text-gray-300 transition">Privacy Policy</button>
            <button className="text-xs text-gray-500 hover:text-gray-300 transition">Terms of Service</button>
            <button className="text-xs text-gray-500 hover:text-gray-300 transition">Cancellation Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
