import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ItemComment } from '../types';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  Award,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Eye,
  Share2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Building,
  ShieldQuestion,
  Send,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { chatService } from '../services/chatService';
import { ItemLocationMap } from '../components/ItemLocationMap';

export const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, user, addNotification, showToast, updateItemStatus } = useApp();

  const item = items.find((i) => i.id === id);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimProof, setClaimProof] = useState('');
  const [claimerPhone, setClaimerPhone] = useState('');
  const [contactRevealed, setContactRevealed] = useState(false);

  const [comments, setComments] = useState<ItemComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    const commentsRef = collection(db, 'items', item.id, 'comments');
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }) as ItemComment);
        docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setComments(docs);
      }
    }, (err) => {
      console.warn('Comments sync warning:', err);
    });

    return () => unsubscribe();
  }, [item?.id]);

  if (!item) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Item Listing Not Found"
        description="The requested lost or found report may have been removed or resolved by the reporter."
        actionText="Return to Directory"
        actionTo="/search"
        className="mt-12"
      />
    );
  }

  const isLost = item.type === 'lost';
  const isReporter = user && user.id === item.reporterId;
  const relatedItems = items
    .filter((i) => i.id !== item.id && (i.category === item.category || i.type === item.type))
    .slice(0, 3);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification(
      'Claim Request Received ✋',
      `Someone submitted a claim request for your item "${item.title}".`,
      'claim',
      `/item/${item.id}`,
      item.reporterId
    );
    showToast('Claim request submitted! The reporter will review your proof.');
    setShowClaimModal(false);
    setClaimProof('');
    setClaimerPhone('');
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !item) return;

    const commentData: Omit<ItemComment, 'id'> = {
      itemId: item.id,
      authorId: user ? user.id : 'usr_guest',
      authorName: user ? user.name : 'Campus Member',
      authorAvatar: user ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      authorRole: user ? user.role : 'student',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      setIsPostingComment(true);
      const commentsRef = collection(db, 'items', item.id, 'comments');
      await addDoc(commentsRef, commentData);

      // Notify the item reporter if someone comments on their report
      if (!user || user.id !== item.reporterId) {
        addNotification(
          'New Comment on Your Report 💬',
          `${user ? user.name : 'A campus member'} commented on your report "${item.title}": "${newCommentText.trim().slice(0, 50)}..."`,
          'system',
          `/item/${item.id}`,
          item.reporterId
        );
      }

      showToast('Comment posted!');
      setNewCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
      showToast('Failed to post comment.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleMarkResolved = () => {
    updateItemStatus(item.id, 'claimed');
    showToast('Item status marked as Claimed & Reunited!');
  };

  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async () => {
    if (!user) {
      showToast('Please sign in to contact the reporter.');
      navigate('/login');
      return;
    }

    if (user.id === item?.reporterId) {
      showToast('This is your own report listing!');
      return;
    }

    if (!item) return;

    setIsStartingChat(true);
    try {
      const convId = await chatService.getOrCreateConversation(item, user);
      showToast('Opening real-time chat session...');
      navigate(`/chat?conversationId=${convId}`);
    } catch (err: any) {
      console.error('Error starting chat:', err);
      showToast(err.message || 'Failed to start chat session');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Page link copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-500" /> Share Report
        </button>
      </div>

      {/* Item Main Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Image & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                  isLost ? 'bg-amber-500' : 'bg-blue-600'
                }`}
              >
                {item.type}
              </span>
              {item.status === 'claimed' && (
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reunited / Claimed
                </span>
              )}
            </div>

            {item.reward && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-md flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Reward: {item.reward}
                </span>
              </div>
            )}
          </div>

          {/* Title & Core Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Tag className="w-3.5 h-3.5" /> {item.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {item.title}
              </h1>
            </div>

            {/* Quick Meta Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                <div className="font-medium flex items-center gap-1 text-slate-900 dark:text-white truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Date Reported</span>
                <div className="font-medium flex items-center gap-1 text-slate-900 dark:text-white">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.date}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Engagement</span>
                <div className="font-medium flex items-center gap-1 text-slate-900 dark:text-white">
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.viewsCount || 42} Campus Views</span>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* AI Image Matcher Callout for Lost Items */}
            {item.type === 'lost' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      AI Visual Image Matcher
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Scan found items collection for visual image similarity.
                    </p>
                  </div>
                </div>

                <Link
                  to={`/match-results/${item.id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  View Top Visual Matches
                </Link>
              </div>
            )}

            {/* Verification Challenge Card */}
            {item.verificationQuestion && (
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <ShieldQuestion className="w-4 h-4 text-amber-600" />
                  <span>Reporter's Verification Challenge</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                  "{item.verificationQuestion}"
                </p>
              </div>
            )}
          </div>

          {/* Interactive Google Map with Directions */}
          <ItemLocationMap
            locationName={item.location}
            building={item.building}
            latitude={item.latitude}
            longitude={item.longitude}
          />

          {/* Comments & Activity Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Report Comments ({comments.length})
                </h3>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No comments yet. Be the first to leave an update or question!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <img
                      src={comment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {comment.authorName}
                          </span>
                          {comment.authorRole && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                              {comment.authorRole}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Form */}
            <form onSubmit={handlePostComment} className="space-y-3 pt-2">
              <div>
                <textarea
                  rows={2}
                  required
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment or ask a question about this report..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !newCommentText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPostingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Reporter Info & Primary Actions */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Item Status & Actions
            </h3>

            {item.status === 'active' ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowClaimModal(true)}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                    isLost ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isLost ? 'I Found This Item' : 'Claim This Item'}
                </button>

                {isReporter && (
                  <button
                    onClick={handleMarkResolved}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Mark as Resolved / Handed Back
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  Item Resolved & Claimed
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  This item has successfully been returned to its rightful owner.
                </p>
              </div>
            )}
          </div>

          {/* Reporter Profile Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reporter Identity
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                {item.contactName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {item.contactName}
                </h4>
                <p className="text-[11px] text-slate-500 capitalize">
                  Verified Campus {item.reporterRole}
                </p>
              </div>
            </div>

            {/* Real-time Chat Button */}
            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              {isStartingChat
                ? 'Opening Messenger...'
                : isLost
                ? 'Contact Owner'
                : 'Contact Finder'}
            </button>

            {/* Contact Reveal */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {!contactRevealed ? (
                <button
                  onClick={() => setContactRevealed(true)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 transition-colors"
                >
                  Show Contact Details
                </button>
              ) : (
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <a href={`mailto:${item.contactEmail}`} className="hover:underline">
                      {item.contactEmail}
                    </a>
                  </div>
                  {item.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>{item.contactPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Similar Campus Postings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedItems.map((rel) => (
              <ItemCard key={rel.id} item={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title={`Claim / Match Form: ${item.title}`}
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Please fill in details proving this item belongs to you (or that you found it).
          </p>

          {item.verificationQuestion && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
              <p className="font-semibold">Challenge Question:</p>
              <p className="italic">{item.verificationQuestion}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Answer / Proof Details *
            </label>
            <textarea
              required
              rows={3}
              value={claimProof}
              onChange={(e) => setClaimProof(e.target.value)}
              placeholder="Provide exact identification features..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Phone Number
            </label>
            <input
              type="tel"
              value={claimerPhone}
              onChange={(e) => setClaimerPhone(e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowClaimModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
