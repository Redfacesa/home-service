import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Search, Loader2, X } from 'lucide-react';

interface AddressSuggestion {
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onCityChange?: (city: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
}

// Mock South African addresses database
const SOUTH_AFRICAN_ADDRESSES: AddressSuggestion[] = [
  // Johannesburg
  { address: '123 Sandton City, Sandton', city: 'Johannesburg', postalCode: '2146', latitude: -26.1088, longitude: 28.0566 },
  { address: '45 Main Road, Sandton', city: 'Johannesburg', postalCode: '2146', latitude: -26.1096, longitude: 28.0534 },
  { address: '78 Oxford Road, Rosebank', city: 'Johannesburg', postalCode: '2196', latitude: -26.1361, longitude: 28.0336 },
  { address: '12 Bree Street, Downtown', city: 'Johannesburg', postalCode: '2001', latitude: -26.2038, longitude: 28.0428 },
  { address: '89 Broad Street, Braamfontein', city: 'Johannesburg', postalCode: '2001', latitude: -26.2017, longitude: 28.0333 },
  
  // Cape Town
  { address: '23 Long Street, City Centre', city: 'Cape Town', postalCode: '8001', latitude: -33.9249, longitude: 18.4241 },
  { address: '567 Main Road, Observatory', city: 'Cape Town', postalCode: '7925', latitude: -33.9297, longitude: 18.3731 },
  { address: '234 Kloof Street, Gardens', city: 'Cape Town', postalCode: '8001', latitude: -33.9387, longitude: 18.3896 },
  { address: '456 Victoria Road, Camps Bay', city: 'Cape Town', postalCode: '8005', latitude: -33.9450, longitude: 18.3634 },
  { address: '789 Coast Road, Clifton', city: 'Cape Town', postalCode: '8005', latitude: -33.9426, longitude: 18.3707 },
  
  // Durban
  { address: '12 West Street, City Centre', city: 'Durban', postalCode: '4001', latitude: -29.8787, longitude: 31.0218 },
  { address: '345 Beach Front, Beachfront', city: 'Durban', postalCode: '4001', latitude: -29.8810, longitude: 31.0254 },
  { address: '678 Smith Street, Morningside', city: 'Durban', postalCode: '4001', latitude: -29.8867, longitude: 31.0186 },
  { address: '567 Florida Road, Morningside', city: 'Durban', postalCode: '4001', latitude: -29.8856, longitude: 31.0267 },
  { address: '890 Marine Drive, Umhlanga', city: 'Durban', postalCode: '4320', latitude: -29.7303, longitude: 31.1244 },
  
  // Pretoria
  { address: '123 Church Street East, Pretoria', city: 'Pretoria', postalCode: '0002', latitude: -25.7461, longitude: 28.2605 },
  { address: '456 Paul Kruger Street, Pretoria', city: 'Pretoria', postalCode: '0002', latitude: -25.7481, longitude: 28.2634 },
  { address: '789 Thabo Sefako Street, Pretoria', city: 'Pretoria', postalCode: '0002', latitude: -25.7512, longitude: 28.2587 },
  
  // Bloemfontein
  { address: '123 St Andrews Street, Bloemfontein', city: 'Bloemfontein', postalCode: '9301', latitude: -29.1199, longitude: 25.5273 },
  { address: '456 Nelson Mandela Avenue, Bloemfontein', city: 'Bloemfontein', postalCode: '9301', latitude: -29.1187, longitude: 25.5298 },
  
  // Port Elizabeth
  { address: '123 Main Street, Port Elizabeth', city: 'Port Elizabeth', postalCode: '6001', latitude: -33.9616, longitude: 25.6052 },
  { address: '456 Beach Road, Port Elizabeth', city: 'Port Elizabeth', postalCode: '6001', latitude: -33.9654, longitude: 25.5984 },
];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onCityChange,
  onCoordinatesChange,
  placeholder = 'Enter your address',
  className,
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      onChange(input);
      setSelectedSuggestion(null);

      if (input.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);

      // Simulate API call with mock data
      setTimeout(() => {
        const filtered = SOUTH_AFRICAN_ADDRESSES.filter(addr =>
          addr.address.toLowerCase().includes(input.toLowerCase()) ||
          addr.city.toLowerCase().includes(input.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 8));
        setIsOpen(true);
        setLoading(false);
      }, 300);
    },
    [onChange]
  );

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.address);
    setSelectedSuggestion(suggestion);
    onCityChange?.(suggestion.city);
    onCoordinatesChange?.(suggestion.latitude, suggestion.longitude);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    onChange('');
    setSelectedSuggestion(null);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`relative ${className}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-gray-100 last:border-0 transition flex items-start gap-3 group"
            >
              <MapPin size={18} className="text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-red-600" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{suggestion.address}</div>
                <div className="text-sm text-gray-500">
                  {suggestion.city} • {suggestion.postalCode}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && value && suggestions.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          No addresses found. Try searching by city or address name.
        </div>
      )}

      {/* Selected Address Display */}
      {selectedSuggestion && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-green-600 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-900">{selectedSuggestion.address}</div>
              <div className="text-sm text-green-700">
                {selectedSuggestion.city} • Lat: {selectedSuggestion.latitude}, Lng: {selectedSuggestion.longitude}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
