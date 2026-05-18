import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User as UserIcon, 
  Save, 
  Loader2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType, isFirestoreQuotaExceeded } from '../lib/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  architectName?: string;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ 
  isOpen, 
  onClose, 
  onUpdate,
  architectName: initialName
}) => {
  const [displayName, setDisplayName] = useState(initialName || '');
  const [interests, setInterests] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user && isOpen && !isFirestoreQuotaExceeded()) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.displayName || data.architectName || user.displayName || '');
            setInterests(data.interests || '');
          }
        } catch (err) {
          console.error("[PROFILE] Failed to fetch registry:", err);
        }
      }
    };
    fetchProfile();
  }, [isOpen]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || isFirestoreQuotaExceeded()) return;

    setIsSaving(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      const dataToUpdate = {
        displayName: displayName.trim(),
        architectName: displayName.trim(),
        interests: interests.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, dataToUpdate).catch(async (err) => {
        if (err.code === 'not-found') {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            createdAt: new Date().toISOString(),
            ...dataToUpdate
          }, { merge: true });
        } else {
          throw err;
        }
      });
      
      await onUpdate();
      onClose();
    } catch (err) {
      setError("Synchronization failed. Check neural link.");
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="absolute inset-x-4 md:inset-x-8 top-0 z-[2000] ff-panel bg-black/95 backdrop-blur-3xl border-purple-500/30 p-6 md:p-10 shadow-2xl flex flex-col gap-8 max-w-2xl mx-auto mt-4"
        >
          <div className="flex justify-between items-center border-b border-purple-500/20 pb-5">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold tracking-[0.5em] text-purple-400 uppercase ff-font flex items-center gap-3">
                <ShieldCheck size={16} />
                Architect Registry
              </h3>
              <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono">
                Sovereign Central Identity Base
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.3em] text-purple-400 uppercase ff-font block">
                Display Name / 顯示名稱
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={16} />
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Registry Identifier"
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.3em] text-purple-400 uppercase ff-font block">
                Cognitive Domains / 核心領域與興趣
              </label>
              <textarea 
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Declare your primary vectors of cognitive interest..."
                className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-sans h-40 resize-none rounded-xl"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-[10px] uppercase tracking-widest font-mono">
                <Zap size={14} />
                {error}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-5">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-5 bg-purple-500 text-white text-xs font-bold tracking-[0.5em] uppercase hover:bg-purple-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50 rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                COMMIT_REGISTRY
              </button>
              
              <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] text-center text-white/20 uppercase tracking-[0.2em] font-mono leading-relaxed">
                  Registry data is stored in the Sovereign High Sector. 
                  VEDA will recalibrate interaction models based on your declared expertise domains.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
