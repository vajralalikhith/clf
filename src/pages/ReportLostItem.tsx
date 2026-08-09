import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PlusCircle, MapPin, Calendar, Clock, Tag, Award, ShieldQuestion, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCategory } from '../types';
import { CATEGORIES } from '../components/SearchBar';
import { CAMPUS_LOCATIONS } from '../data/mockData';
import { ImageUploader } from '../components/ImageUploader';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { getLocationPresetByName } from '../utils/campusLocations';

export const ReportLostItem: React.FC = () => {
  const { user, addItem, showToast } = useApp();
  const navigate = useNavigate();

  const defaultPreset = getLocationPresetByName(CAMPUS_LOCATIONS[0]);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics' as ItemCategory,
    color: '',
    brand: '',
    location: CAMPUS_LOCATIONS[0],
    building: defaultPreset?.building || 'Central Library',
    latitude: defaultPreset?.lat || 37.8724,
    longitude: defaultPreset?.lng || -122.2590,
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    description: '',
    reward: '',
    verificationQuestion: '',
    contactName: user?.name || 'Alex Rivera',
    contactEmail: user?.email || 'arivera@campus.edu',
    contactPhone: user?.phone || '(555) 234-5678',
    imageUrl: '',
    tags: '',
  });

  const [presetImage, setPresetImage] = useState('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800');

  const handleImagePreset = (url: string) => {
    setPresetImage(url);
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const tagArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim().toLowerCase())
      : [formData.category.toLowerCase(), 'lost'];

    if (formData.color && !tagArray.includes(formData.color.toLowerCase())) {
      tagArray.push(formData.color.toLowerCase());
    }
    if (formData.brand && !tagArray.includes(formData.brand.toLowerCase())) {
      tagArray.push(formData.brand.toLowerCase());
    }

    const newItem = addItem({
      title: formData.title,
      type: 'lost',
      category: formData.category,
      color: formData.color,
      brand: formData.brand,
      status: 'active',
      description: formData.description,
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
      reporterId: user ? user.id : 'usr_101',
      reporterRole: user ? user.role : 'student',
      reward: formData.reward,
      verificationQuestion: formData.verificationQuestion,
      tags: tagArray,
    });

    showToast('Report published! Running Smart Attribute & Visual Match scan...');
    navigate(`/match-results/${newItem.id}`);
  };

  const sampleImages = [
    { label: 'Headphones / AirPods', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800' },
    { label: 'Laptop / Tech', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800' },
    { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800' },
    { label: 'Backpack / Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800' },
    { label: 'Calculator / Books', url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48d?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Lost Item Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Report a Misplaced Item
        </h1>
        <p className="text-xs sm:text-sm text-amber-100">
          Broadcasting your lost item to the entire campus network maximizes recovery chances.
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
            1. Basic Item Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Item Name / Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Apple AirPods Pro (White case with blue sticker)"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                Reward Offer (Optional)
              </label>
              <div className="relative flex items-center">
                <Award className="absolute left-3 w-4 h-4 text-amber-500 pointer-events-none" />
                <input
                  type="text"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  placeholder="e.g. $20 Cafe Voucher / Coffee on me"
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Color & Brand fields for Smart Matching */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. White, Navy Blue, Silver, Black"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location & Time */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            2. Last Known Location & Time
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campus Location / Building *
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
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              Pin Exact Location on Map
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
                Date Lost *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Detailed Description & Verification Question */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            3. Description & Ownership Proof
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Include brand, color, condition, where you were sitting, or special marks..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Secret Verification Question (Recommended)
            </label>
            <div className="relative flex items-center">
              <ShieldQuestion className="absolute left-3 w-4 h-4 text-amber-500 pointer-events-none" />
              <input
                type="text"
                value={formData.verificationQuestion}
                onChange={(e) => setFormData({ ...formData, verificationQuestion: e.target.value })}
                placeholder="e.g. What custom sticker is on the back?"
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This helps verify genuine finder responses before giving away contact info.
            </p>
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
            typeTheme="amber"
          />
        </div>

        {/* Submit Action */}
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
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish Lost Report
          </button>
        </div>
      </motion.form>
    </div>
  );
};
