import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, MapPin, Calendar, Clock, Tag, Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCategory } from '../types';
import { CATEGORIES } from '../components/SearchBar';
import { CAMPUS_LOCATIONS } from '../data/mockData';
import { ImageUploader } from '../components/ImageUploader';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { getLocationPresetByName } from '../utils/campusLocations';

export const ReportFoundItem: React.FC = () => {
  const { user, addItem, showToast } = useApp();
  const navigate = useNavigate();

  const defaultPreset = getLocationPresetByName(CAMPUS_LOCATIONS[1]);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cards & IDs' as ItemCategory,
    color: '',
    brand: '',
    location: CAMPUS_LOCATIONS[1],
    building: defaultPreset?.building || 'Student Union',
    latitude: defaultPreset?.lat || 37.8692,
    longitude: defaultPreset?.lng || -122.2597,
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    description: '',
    dropoffLocation: 'Handed to Student Union Info Desk',
    verificationQuestion: 'What initial or full name is on the back?',
    contactName: user?.name || 'Jordan Taylor',
    contactEmail: user?.email || 'jtaylor@campus.edu',
    contactPhone: user?.phone || '(555) 987-6543',
    imageUrl: '',
    tags: '',
  });

  const [presetImage, setPresetImage] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800');

  const handleImagePreset = (url: string) => {
    setPresetImage(url);
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const tagArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim().toLowerCase())
      : [formData.category.toLowerCase(), 'found'];

    if (formData.color && !tagArray.includes(formData.color.toLowerCase())) {
      tagArray.push(formData.color.toLowerCase());
    }
    if (formData.brand && !tagArray.includes(formData.brand.toLowerCase())) {
      tagArray.push(formData.brand.toLowerCase());
    }

    const newItem = addItem({
      title: formData.title,
      type: 'found',
      category: formData.category,
      color: formData.color,
      brand: formData.brand,
      status: 'active',
      description: `${formData.description} (Drop-off Location: ${formData.dropoffLocation})`,
      location: formData.location,
      building: formData.building,
      latitude: formData.latitude,
      longitude: formData.longitude,
      date: formData.date,
      time: formData.time,
      imageUrl: formData.imageUrl || presetImage,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      reporterId: user ? user.id : 'usr_102',
      reporterRole: user ? user.role : 'student',
      verificationQuestion: formData.verificationQuestion,
      tags: tagArray,
    });

    navigate(`/item/${newItem.id}`);
  };

  const sampleImages = [
    { label: 'Keys / ID Cards', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800' },
    { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800' },
    { label: 'Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800' },
    { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800' },
    { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Found Item Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Report an Item You Found
        </h1>
        <p className="text-xs sm:text-sm text-blue-100">
          Thank you for being a responsible campus citizen! Let's help return this item to its owner.
        </p>
      </div>

      {/* Form Card */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
      >
        {/* Title & Category */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            1. Found Item Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Navy Blue Lanyard with Student ID and 3 Keys"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Hand-off / Turn-in Location *
              </label>
              <input
                type="text"
                required
                value={formData.dropoffLocation}
                onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                placeholder="e.g. Handed to Security Desk / Kept with me"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color & Brand for Smart Matching */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Item Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Navy, Black, Silver, White"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Apple, Hydro Flask, Nike, Sony"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location & Time */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            2. Where & When Found
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campus Location Found *
            </label>
            <select
              value={formData.location}
              onChange={(e) => {
                const newLoc = e.target.value;
                const preset = getLocationPresetByName(newLoc);
                setFormData((prev) => ({
                  ...prev,
                  location: newLoc,
                  building: preset?.building || prev.building,
                  latitude: preset ? preset.lat : prev.latitude,
                  longitude: preset ? preset.lng : prev.longitude
                }));
              }}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Google Map Pin Selector */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pin Exact Location Found on Map
            </label>
            <MapLocationPicker
              lat={formData.latitude}
              lng={formData.longitude}
              selectedLocationName={formData.location}
              onSelectLocation={(newLat, newLng) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: newLat,
                  longitude: newLng
                }));
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date Found *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Approximate Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            3. Details & Verification
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you found without revealing secret ownership indicators..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ownership Verification Question
            </label>
            <input
              type="text"
              value={formData.verificationQuestion}
              onChange={(e) => setFormData({ ...formData, verificationQuestion: e.target.value })}
              placeholder="e.g. What initial is written on the back of the card?"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Photo Selection / Dropzone */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <ImageUploader
            currentImageUrl={formData.imageUrl || presetImage}
            onImageUploaded={(url) => {
              setPresetImage(url);
              setFormData((prev) => ({ ...prev, imageUrl: url }));
            }}
            sampleImages={sampleImages}
            typeTheme="blue"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish Found Report
          </button>
        </div>
      </motion.form>
    </div>
  );
};
