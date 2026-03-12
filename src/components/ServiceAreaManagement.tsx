import React, { useState, useEffect } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Save, Loader2, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import WorkerLocationMap from './WorkerLocationMap';

interface ServiceAreaForm {
  city: string;
  radius_km: number;
  postalCodes: string[];
}

const ServiceAreaManagement: React.FC = () => {
  const { user, profile } = useAuth();
  const { serviceAreas, updateServiceArea } = useLocation();
  const [formData, setFormData] = useState<ServiceAreaForm>({
    city: 'Johannesburg',
    radius_km: 15,
    postalCodes: ['2146', '2196'],
  });
  const [newPostalCode, setNewPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedAreas, setSavedAreas] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  // South African cities
  const cities = [
    'Johannesburg',
    'Cape Town',
    'Durban',
    'Pretoria',
    'Bloemfontein',
    'Port Elizabeth',
  ];

  useEffect(() => {
    loadServiceAreas();
  }, [user]);

  const loadServiceAreas = async () => {
    if (!user) return;
    try {
      // In a real app, fetch from database
      setSavedAreas(serviceAreas);
    } catch (err) {
      console.error('Error loading service areas:', err);
    }
  };

  const handleAddPostalCode = () => {
    if (newPostalCode.trim() && !formData.postalCodes.includes(newPostalCode)) {
      setFormData(prev => ({
        ...prev,
        postalCodes: [...prev.postalCodes, newPostalCode],
      }));
      setNewPostalCode('');
    }
  };

  const handleRemovePostalCode = (code: string) => {
    setFormData(prev => ({
      ...prev,
      postalCodes: prev.postalCodes.filter(c => c !== code),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      await updateServiceArea(
        formData.city,
        formData.postalCodes,
        formData.radius_km
      );

      setSuccessMessage('Service area updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form
      setFormData({
        city: 'Johannesburg',
        radius_km: 15,
        postalCodes: ['2146', '2196'],
      });

      loadServiceAreas();
    } catch (err) {
      console.error('Error updating service area:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Service Area Management</h2>
        <p className="text-gray-600 mt-1">Define the cities and coverage radius where you provide services</p>
      </div>

      {/* Map Display */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Coverage Map</h3>
        <WorkerLocationMap city={formData.city} radius_km={formData.radius_km} />
      </Card>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Primary City</label>
            <select
              value={formData.city}
              onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Coverage Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Coverage Radius: {formData.radius_km} km
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={formData.radius_km}
              onChange={e => setFormData(prev => ({ ...prev, radius_km: parseInt(e.target.value) }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum distance you're willing to travel for jobs
            </p>
          </div>

          {/* Postal Codes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Service Postal Codes</label>
            <div className="space-y-3">
              {/* Existing postal codes */}
              <div className="flex flex-wrap gap-2">
                {formData.postalCodes.map(code => (
                  <div
                    key={code}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm font-medium text-red-700">{code}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePostalCode(code)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new postal code */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter postal code (e.g., 2146)"
                  value={newPostalCode}
                  onChange={e => setNewPostalCode(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddPostalCode())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddPostalCode}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Service Area
              </>
            )}
          </Button>

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <Check size={18} />
              {successMessage}
            </div>
          )}
        </form>
      </Card>

      {/* Saved Areas */}
      {savedAreas.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Service Areas</h3>
          <div className="space-y-3">
            {savedAreas.map((area, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">{area.city}</div>
                    <div className="text-sm text-gray-600">
                      {area.radius_km}km radius • {area.postal_codes?.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {area.is_active && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Set up multiple service areas to accept jobs in different cities. Workers are automatically matched with nearby jobs based on their service areas and ratings.
        </p>
      </Card>
    </div>
  );
};

export default ServiceAreaManagement;
