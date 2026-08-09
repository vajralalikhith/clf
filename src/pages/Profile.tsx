import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  Mail,
  Phone,
  IdCard,
  Building2,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  FileText,
  Camera,
  Upload,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { compressImage, uploadImageToStorage } from '../utils/imageUpload';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout, items, showToast } = useApp();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
    avatar: user?.avatar || '',
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <UserIcon className="w-12 h-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Sign In Required
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Please sign in to view and manage your campus account profile.
        </p>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const myReports = items.filter((i) => i.reporterId === user.id);
  const myResolvedCount = myReports.filter((i) => i.status === 'claimed' || i.status === 'resolved').length;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setAvatarError(null);
    setIsCompressingAvatar(true);
    setAvatarProgress(0);

    try {
      // 1. Compress avatar image
      const compressedBlob = await compressImage(file, 600, 0.85);
      setIsCompressingAvatar(false);

      // 2. Upload to Firebase Storage
      setIsUploadingAvatar(true);
      const downloadUrl = await uploadImageToStorage(
        compressedBlob,
        'user-avatars',
        (progress) => {
          setAvatarProgress(progress);
        }
      );

      // 3. Update user profile
      await updateProfile({ avatar: downloadUrl });
      setFormData((prev) => ({ ...prev, avatar: downloadUrl }));
      showToast('Profile photo updated successfully!');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setAvatarError(err.message || 'Failed to upload profile photo.');
    } finally {
      setIsCompressingAvatar(false);
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hidden File Input for Avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar with Overlay Upload Button */}
          <div className="relative group shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 shadow-md bg-slate-800"
            />
            
            {/* Hover overlay to change avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressingAvatar || isUploadingAvatar}
              className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold cursor-pointer"
              title="Change profile picture"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span>Edit Photo</span>
            </button>

            {/* Loading Indicator Spinner */}
            {(isCompressingAvatar || isUploadingAvatar) && (
              <div className="absolute inset-0 rounded-full bg-slate-900/80 flex flex-col items-center justify-center text-white text-[10px] font-semibold p-1">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                <span>{isCompressingAvatar ? 'Compressing' : `${avatarProgress}%`}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> Verified Campus {user.role}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs text-blue-100 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 opacity-80" />
              {user.email}
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-semibold text-blue-200 hover:text-white underline inline-flex items-center gap-1 mt-1"
            >
              <Camera className="w-3 h-3" /> Change Profile Picture
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Avatar upload error feedback */}
      {avatarError && (
        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{avatarError}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {myReports.length}
          </div>
          <div className="text-xs font-medium text-slate-500">Number of Reports</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {myResolvedCount}
          </div>
          <div className="text-xs font-medium text-slate-500 font-medium">Reunited Items</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {user.joinedDate}
          </div>
          <div className="text-xs font-medium text-slate-500">Member Since</div>
        </div>
      </div>

      {/* Profile Info Details Form / Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Personal Account Information
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile Details'}
          </button>
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Campus Email</span>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.email}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Student / Staff ID</span>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.studentId}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Department / Major</span>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.department}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.phone}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Submitted Reports</span>
              <p className="font-semibold text-sm text-blue-600 dark:text-blue-400">{myReports.length} reports</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student/Staff ID
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Major
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

