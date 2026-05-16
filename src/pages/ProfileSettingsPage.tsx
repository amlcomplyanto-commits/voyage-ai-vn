import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCircle, Save, CheckCircle2, ChevronRight, Tags, Utensils, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType, signOut } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useI18n } from '../lib/i18n';

interface UserProfile {
  displayName: string;
  interests: string[];
  foodPreferences: string[];
  updatedAt: number;
}

const INTEREST_OPTIONS = [
  "Culture & History", "Photography", "Nature & Wildlife", 
  "Adventure", "Relaxation", "Nightlife", "Shopping"
];

const FOOD_OPTIONS = [
  "Vegetarian", "Vegan", "Halal", "Gluten-Free",
  "Seafood", "Local Street Food", "Fine Dining"
];

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    interests: [],
    foodPreferences: [],
    updatedAt: Date.now()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setProfile((prev) => ({ ...prev, displayName: currentUser.displayName || '' }));
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile({
              displayName: data.displayName || currentUser.displayName || '',
              interests: data.interests || [],
              foodPreferences: data.foodPreferences || [],
              updatedAt: data.updatedAt || Date.now()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const now = Date.now();
      const updatedProfile = {
        ...profile,
        updatedAt: now
      };
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const isSelected = prev.interests.includes(interest);
      if (isSelected) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const toggleFood = (food: string) => {
    setProfile(prev => {
      const isSelected = prev.foodPreferences.includes(food);
      if (isSelected) {
        return { ...prev, foodPreferences: prev.foodPreferences.filter(f => f !== food) };
      } else {
        return { ...prev, foodPreferences: [...prev.foodPreferences, food] };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 items-center justify-center absolute inset-0 z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 items-center justify-center absolute inset-0 z-50 px-5 text-center">
        <UserCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in Required</h2>
        <p className="text-slate-500 mb-6 max-w-[280px]">You need to sign in to access and update your profile settings.</p>
        <button
          onClick={() => navigate('/local-experiences')}
          className="bg-brand-500 text-white font-bold py-3 px-6 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 pb-20 pt-safe font-sans absolute inset-0 z-50 overflow-y-auto">
      <div className="px-5 pt-4 pb-4 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/local-experiences')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {t('Profile Settings', 'Cài đặt hồ sơ', 'Setări Profil')}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !profile.displayName}
          className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-full font-bold text-sm disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <div className="w-4 h-4 rounded-full border-2 border-brand-200 border-t-white animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle2 size={16} /> Saved
            </>
          ) : (
            <>
              <Save size={16} /> Save
            </>
          )}
        </button>
      </div>

      <div className="px-5 py-6 flex flex-col gap-8 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User avatar" className="w-20 h-20 rounded-full border-4 border-white shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-sm">
                <UserCircle size={40} className="text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{profile.displayName || user.displayName || "Traveler"}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <label className="text-sm font-bold text-slate-900 mb-2 block">Display Name</label>
          <input
            type="text"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            placeholder="Enter your name"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Tags size={16} />
            </div>
            <h3 className="font-bold text-slate-900">Travel Interests</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(interest => {
              const isSelected = profile.interests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm pb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <Utensils size={16} />
            </div>
            <h3 className="font-bold text-slate-900">Food Preferences</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOOD_OPTIONS.map(food => {
              const isSelected = profile.foodPreferences.includes(food);
              return (
                <button
                  key={food}
                  onClick={() => toggleFood(food)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isSelected 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {food}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            navigate('/local-experiences');
          }}
          className="w-full bg-white border border-red-100 text-red-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm mt-4 mb-8"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
