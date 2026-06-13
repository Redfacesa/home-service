import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">RF</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">Red Face</span>
                <span className="text-xs block text-gray-400 -mt-0.5">Home Services</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              South Africa's trusted marketplace for verified home service workers. Safe, reliable, and professional.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition">
                <Facebook size={16} />
              </a>
              <a href="https://instagram.com/redfacehomeservices" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition">
                <Instagram size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {['House Cleaning', 'Cooking', 'Laundry', 'Car Washing', 'Yard Cleaning', 'Waste Removal', 'Basic Home Help', 'Carpentry', 'Welding'].map(s => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-gray-400 hover:text-white transition">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', path: '/' },
                { label: 'How It Works', path: '/' },
                { label: 'Become a Worker', path: '/' },
                { label: 'Safety & Trust', path: '/safety-security' },
                { label: 'Pricing', path: '/services' },
                { label: 'FAQ', path: '/faq' },
                { label: 'Contact Us', path: '/contact-us' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-gray-400 hover:text-white transition">
                    {item.label}
                  </Link>
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
                <span className="text-sm text-gray-400">29 Fairbridge Road, Table View, 7441, South Africa</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-red-500 shrink-0" />
                <a href="tel:+27617780990" className="text-sm text-gray-400 hover:text-white transition">
                  +27 61 778 0990
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-red-500 shrink-0" />
                <a href="https://instagram.com/redfacehomeservices" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">
                  @redfacehomeservices
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-white text-sm font-medium mb-2">Operating Hours</h5>
              <p className="text-xs text-gray-400">Mon - Fri: 08:00 - 18:00</p>
              <p className="text-xs text-gray-400">Sat: 09:00 - 13:00</p>
              <p className="text-xs text-gray-400">Sun: Closed</p>
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
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/privacy-policy" className="text-xs text-gray-500 hover:text-gray-300 transition">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-xs text-gray-500 hover:text-gray-300 transition">
              Terms of Service
            </Link>
            <Link to="/cancellation-policy" className="text-xs text-gray-500 hover:text-gray-300 transition">
              Cancellation Policy
            </Link>
            <Link to="/safety-security" className="text-xs text-gray-500 hover:text-gray-300 transition">
              Safety & Security
            </Link>
            <Link to="/faq" className="text-xs text-gray-500 hover:text-gray-300 transition">
              FAQ
            </Link>
            <Link to="/contact-us" className="text-xs text-gray-500 hover:text-gray-300 transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
