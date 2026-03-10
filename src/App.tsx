import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Fish, Trophy, Plus, MapPin, Weight, ChevronRight, LogOut, ShieldCheck, Copy, CheckCircle2, Edit2, Trash2, Users, Filter, Search, Info, Download, X, Settings, User as UserIcon, Lock, Eye, EyeOff, History, Bell, Printer, FileText, Share2, BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Event, Catch, User, Invitation } from './types';

// --- Icons ---

const Ruler = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3l-1.4-1.4L18.5 15.3l-1.4-1.4L15.7 15.3l-1.4-1.4L12.9 15.3l-1.4-1.4L10.1 15.3l-1.4-1.4L7.3 15.3l-1.4-1.4L4.5 15.3l-1.4-1.4L1.7 15.3" />
    <rect x="2" y="7" width="20" height="10" rx="2" />
  </svg>
);

// --- Components ---

const EventCard: React.FC<{ event: Event, isAdmin?: boolean, onEdit?: (e: Event) => void, onDelete?: (id: number) => void }> = ({ event, isAdmin, onEdit, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 hover:shadow-md transition-shadow relative group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="bg-fishing-olive/10 p-3 rounded-2xl">
        <Calendar className="w-6 h-6 text-fishing-olive" />
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs font-mono uppercase tracking-wider text-fishing-olive/60">
          {new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
        {isAdmin && (
          <div className="flex gap-2 mt-2 transition-opacity">
            <button 
              onClick={() => onEdit?.(event)}
              className="p-2 bg-fishing-cream rounded-lg text-fishing-olive hover:bg-fishing-olive hover:text-white transition-colors"
              title="Bearbeiten"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button 
              onClick={() => onDelete?.(event.id)}
              className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              title="Löschen"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
    <h3 className="text-2xl font-medium mb-2">{event.title}</h3>
    <div className="flex items-center text-sm text-fishing-ink/60 mb-4">
      <MapPin className="w-4 h-4 mr-1" />
      {event.location}
    </div>
    <p className="text-fishing-ink/70 leading-relaxed">{event.description}</p>
  </motion.div>
);

const CatchCard: React.FC<{ fish: Catch, isAdmin?: boolean, currentUserId?: number, onDelete?: (id: number) => void }> = ({ fish, isAdmin, currentUserId, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white overflow-hidden rounded-3xl shadow-sm border border-black/5 group relative"
  >
    <div className="aspect-[4/3] bg-fishing-olive/5 relative overflow-hidden">
      {fish.image_url ? (
        <img 
          src={fish.image_url} 
          alt={fish.species} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Fish className="w-12 h-12 text-fishing-olive/20" />
        </div>
      )}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest">
        {fish.species}
      </div>
      
      {currentUserId && (
        <button 
          onClick={() => onDelete?.(fish.id)}
          className="absolute top-4 left-4 p-2 bg-red-500/90 backdrop-blur text-white rounded-xl transition-opacity hover:bg-red-600 z-10 shadow-lg"
          title="Fang löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-medium">{fish.angler}</h3>
          <p className="text-xs text-fishing-ink/40 font-mono uppercase tracking-tighter">
            {new Date(fish.date).toLocaleDateString('de-DE')}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end text-sm font-medium">
            <Weight className="w-3 h-3 mr-1 opacity-40" />
            {fish.weight} kg
          </div>
          <div className="flex items-center justify-end text-sm font-medium">
            <Ruler className="w-3 h-3 mr-1 opacity-40" />
            {fish.length} cm
          </div>
        </div>
      </div>
      <div className="flex items-center text-xs text-fishing-ink/50 border-t border-black/5 pt-4">
        <MapPin className="w-3 h-3 mr-1" />
        {fish.location}
      </div>
    </div>
  </motion.div>
);

const PasswordInput: React.FC<{ label: string, name: string, defaultValue?: string }> = ({ label, name, defaultValue }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">{label}</label>
      <div className="relative">
        <input 
          name={name}
          type={show ? "text" : "password"} 
          defaultValue={defaultValue}
          className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20 transition-all"
          required
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-fishing-ink/30 hover:text-fishing-olive transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { username, password } 
      : { username, password, inviteCode, first_name: firstName, last_name: lastName };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      if (isLogin) {
        onLogin(data);
      } else {
        setIsLogin(true);
        setUsername('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setInviteCode('');
        alert('Registrierung erfolgreich! Bitte logge dich ein.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-xl border border-black/5"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-fishing-olive rounded-2xl flex items-center justify-center text-white">
            <Fish className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-4xl text-center mb-2">{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
        <p className="text-center text-fishing-olive font-medium text-sm mb-1">Fischereiverein Willersdorf/Haid</p>
        <p className="text-center text-fishing-ink/40 text-[10px] uppercase tracking-widest font-mono mb-8">Petri Heil Manager</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">{error}</div>}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Vorname</label>
                <input 
                  required
                  className="w-full bg-fishing-cream/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Nachname</label>
                <input 
                  required
                  className="w-full bg-fishing-cream/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Benutzername</label>
            <input 
              required
              className="w-full bg-fishing-cream/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Passwort</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-fishing-cream/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-fishing-ink/30 hover:text-fishing-olive transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Einladungscode</label>
              <input 
                required
                className="w-full bg-fishing-cream/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder="VOM ADMIN ERHALTEN"
              />
            </motion.div>
          )}
          <button 
            type="submit"
            className="w-full py-4 rounded-2xl bg-fishing-olive text-white font-medium hover:opacity-90 transition-opacity mt-4"
          >
            {isLogin ? 'Anmelden' : 'Konto erstellen'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center mt-6 text-sm text-fishing-olive font-medium"
        >
          {isLogin ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Anmelden'}
        </button>
      </motion.div>
    </div>
  );
};

const AddEventModal = ({ isOpen, onClose, onAdd, editEvent }: { isOpen: boolean, onClose: () => void, onAdd: () => void, editEvent?: Event | null }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editEvent) {
      setFormData({
        title: editEvent.title,
        date: editEvent.date,
        location: editEvent.location || '',
        description: editEvent.description || '',
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        description: '',
      });
    }
  }, [editEvent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editEvent ? `/api/admin/events/${editEvent.id}` : '/api/admin/events';
      const method = editEvent ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save event');
      onAdd();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-fishing-cream w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl mb-6">{editEvent ? 'Termin bearbeiten' : 'Neuer Termin'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Titel</label>
              <input 
                required
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="z.B. Anfischen"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Datum</label>
              <input 
                type="date" required
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Ort</label>
              <input 
                required
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Beschreibung</label>
              <textarea 
                rows={3}
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl border border-black/10 font-medium hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl bg-fishing-olive text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const AddCatchModal = ({ isOpen, onClose, onAdd, user }: { isOpen: boolean, onClose: () => void, onAdd: () => void, user: User | null }) => {
  const [formData, setFormData] = useState({
    species: '',
    weight: '',
    length: '',
    date: new Date().toISOString().split('T')[0],
    angler: '',
    location: '',
  });

  useEffect(() => {
    if (isOpen && user && !formData.angler) {
      setFormData(prev => ({
        ...prev,
        angler: user.first_name ? `${user.first_name} ${user.last_name}` : user.username
      }));
    }
  }, [isOpen, user]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('species', formData.species);
    data.append('weight', formData.weight);
    data.append('length', formData.length);
    data.append('date', formData.date);
    data.append('angler', formData.angler);
    data.append('location', formData.location);
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      const res = await fetch('/api/catches', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to upload');
      onAdd();
      onClose();
      setFormData({
        species: '',
        weight: '',
        length: '',
        date: new Date().toISOString().split('T')[0],
        angler: '',
        location: '',
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading catch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-fishing-cream w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl mb-6">Neuer Fang</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Fischart</label>
              <input 
                required
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={formData.species}
                onChange={e => setFormData({...formData, species: e.target.value})}
                placeholder="z.B. Hecht"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Gewicht (kg)</label>
                <input 
                  type="number" step="0.1" required
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Länge (cm)</label>
                <input 
                  type="number" step="1" required
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                  value={formData.length}
                  onChange={e => setFormData({...formData, length: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Angler</label>
              <input 
                required
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={formData.angler}
                onChange={e => setFormData({...formData, angler: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Gewässer / Stelle</label>
              <input 
                required
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono mb-1 opacity-50">Foto hochladen</label>
              <input 
                type="file"
                accept="image/*"
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-fishing-olive/10 file:text-fishing-olive hover:file:bg-fishing-olive/20"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl border border-black/10 font-medium hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl bg-fishing-olive text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, we show it after a short delay if not standalone
    if (isIOSDevice && !isStandalone) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-6 right-6 md:left-auto md:right-12 md:bottom-12 md:w-80 bg-fishing-olive text-white p-6 rounded-[2rem] shadow-2xl z-50 border border-white/10"
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white/20 p-3 rounded-2xl">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-medium">App installieren</h4>
          <p className="text-xs text-white/60">
            {isIOS ? 'Tippe auf "Teilen" und dann auf "Zum Home-Bildschirm".' : 'Für schnellen Zugriff auf den Home-Bildschirm.'}
          </p>
        </div>
      </div>
      {!isIOS && (
        <button 
          onClick={handleInstall}
          className="w-full py-3 bg-white text-fishing-olive font-bold rounded-xl hover:bg-fishing-cream transition-colors"
        >
          Jetzt installieren
        </button>
      )}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'catches' | 'admin' | 'settings' | 'info'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  
  // App Settings & Info
  const [appSettings, setAppSettings] = useState<{ water_regulations: string, parking_info: string }>({ water_regulations: '', parking_info: '' });
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [isSettingsUpdating, setIsSettingsUpdating] = useState(false);
  
  // Filters
  const [catchSearch, setCatchSearch] = useState('');
  const [catchSpeciesFilter, setCatchSpeciesFilter] = useState('Alle');
  const [showOnlyMyCatches, setShowOnlyMyCatches] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [printType, setPrintType] = useState<'events' | 'catches'>('events');

  useEffect(() => {
    const handleAfterPrint = () => setIsPrintMode(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [eventsRes, catchesRes, settingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/catches'),
        fetch('/api/settings')
      ]);
      
      if (!eventsRes.ok || !catchesRes.ok || !settingsRes.ok) {
        throw new Error('Daten konnten nicht geladen werden.');
      }

      const eventsData = await eventsRes.json();
      const catchesData = await catchesRes.json();
      const settingsData = await settingsRes.json();
      
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setCatches(Array.isArray(catchesData) ? catchesData : []);
      setAppSettings(settingsData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Verbindung zum Server fehlgeschlagen.');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchInvites = async () => {
    if (user?.role !== 'admin') return;
    const [invRes, usersRes, feedbackRes] = await Promise.all([
      fetch('/api/admin/invites'),
      fetch('/api/admin/users'),
      fetch('/api/admin/feedback')
    ]);
    if (invRes.ok) setInvites(await invRes.json());
    if (usersRes.ok) setAdminUsers(await usersRes.json());
    if (feedbackRes.ok) setFeedbackList(await feedbackRes.json());
  };

  const generateInvite = async () => {
    const res = await fetch('/api/admin/invites', { method: 'POST' });
    if (res.ok) fetchInvites();
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Möchtest du diesen Termin wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Fehler beim Löschen: ${data.error || 'Unbekannter Fehler'}`);
      }
    } catch (err) {
      alert('Netzwerkfehler beim Löschen des Termins.');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteCatch = async (id: number) => {
    if (!confirm('Möchtest du diesen Fang wirklich aus dem Fangbuch löschen?')) return;
    try {
      const res = await fetch(`/api/catches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Fehler beim Löschen: ${data.error || 'Unbekannter Fehler'}`);
      }
    } catch (err) {
      alert('Netzwerkfehler beim Löschen des Fangs.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleDeleteUser = async (id: number) => {
    if (id === user?.id) {
      alert('Du kannst dich nicht selbst löschen.');
      return;
    }
    if (!confirm('Möchtest du dieses Mitglied wirklich entfernen? Alle zugehörigen Fänge werden ebenfalls gelöscht.')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInvites();
        fetchData();
      } else {
        const data = await res.json();
        alert(`Fehler beim Löschen: ${data.error || 'Unbekannter Fehler'}`);
      }
    } catch (err) {
      alert('Netzwerkfehler beim Löschen des Mitglieds.');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      checkPushSubscription();
    }
  }, [user]);

  const checkPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setPushSubscribed(!!subscription);
  };

  const subscribeToPush = async () => {
    setPushLoading(true);
    try {
      if (!('serviceWorker' in navigator)) throw new Error('Service Worker not supported');
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permission not granted');

      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BA5XEpO0sJnieomv1bfP0k0beylEfOVbRN3eo-1xC4KnLJ5hJOcNZh4YPPubY0AFg71CN3vR4dxCQix65AxtEao";
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (res.ok) {
        setPushSubscribed(true);
        alert('Benachrichtigungen erfolgreich aktiviert!');
      }
    } catch (err: any) {
      console.error('Push subscription error:', err);
      alert('Fehler beim Aktivieren der Benachrichtigungen: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') fetchInvites();
  }, [activeTab]);

  const filteredCatches = catches.filter(c => {
    const searchTerm = catchSearch.toLowerCase();
    const matchesSearch = (c.species?.toLowerCase() || '').includes(searchTerm) || 
                         (c.angler?.toLowerCase() || '').includes(searchTerm) ||
                         (c.location?.toLowerCase() || '').includes(searchTerm);
    const matchesSpecies = catchSpeciesFilter === 'Alle' || c.species === catchSpeciesFilter;
    const matchesUser = !showOnlyMyCatches || c.user_id === user?.id;
    return matchesSearch && matchesSpecies && matchesUser;
  });

  const speciesList = ['Alle', ...Array.from(new Set(catches.map(c => c.species)))];

  const stats = {
    totalWeight: catches.reduce((acc, c) => acc + (c.weight || 0), 0).toFixed(1),
    heaviest: catches.length > 0 ? Math.max(...catches.map(c => c.weight || 0)).toFixed(1) : '0',
    longest: catches.length > 0 ? Math.max(...catches.map(c => c.length || 0)) : 0,
    avgLength: catches.length > 0 ? (catches.reduce((acc, c) => acc + (c.length || 0), 0) / catches.length).toFixed(1) : '0'
  };

  const adminStats = useMemo(() => {
    if (catches.length === 0) return null;

    const bySpecies = Object.entries(catches.reduce((acc, c) => {
      if (!acc[c.species]) acc[c.species] = { count: 0, weight: 0 };
      acc[c.species].count++;
      acc[c.species].weight += (c.weight || 0);
      return acc;
    }, {} as Record<string, { count: number, weight: number }>)).map(([name, data]: [string, any]) => ({
      name,
      value: data.count,
      weight: data.weight.toFixed(1)
    })).sort((a: any, b: any) => b.value - a.value);

    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('de-DE', { month: 'short' }),
      count: 0
    }));

    catches.forEach(c => {
      const month = new Date(c.date).getMonth();
      byMonth[month].count++;
    });

    const topAnglers = Object.entries(catches.reduce((acc, c) => {
      acc[c.angler] = (acc[c.angler] || 0) + 1;
      return acc;
    }, {} as Record<string, number>))
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

    return { bySpecies, byMonth, topAnglers };
  }, [catches]);

  const COLORS = ['#5A5A40', '#8E9299', '#141414', '#E4E3E0', '#F27D26', '#FF4444', '#00FF00'];

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest opacity-40">Lade Petri Heil Manager...</div>;

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-24">
      <InstallPrompt />
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-white/80 backdrop-blur-xl border-t border-black/5 md:top-0 md:left-0 md:w-24 md:h-full md:border-t-0 md:border-r flex md:flex-col items-center justify-around md:justify-center gap-6 z-40 no-print">
        <div className="hidden md:block mb-auto mt-8">
          <div className="w-12 h-12 bg-fishing-olive rounded-2xl flex items-center justify-center text-white">
            <Fish className="w-6 h-6" />
          </div>
        </div>
        
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-fishing-olive text-white' : 'text-fishing-ink/40 hover:bg-fishing-olive/10 hover:text-fishing-olive'}`}
          title="Dashboard"
        >
          <Trophy className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setActiveTab('events')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'events' ? 'bg-fishing-olive text-white' : 'text-fishing-ink/40 hover:bg-fishing-olive/10 hover:text-fishing-olive'}`}
          title="Termine"
        >
          <Calendar className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setActiveTab('catches')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'catches' ? 'bg-fishing-olive text-white' : 'text-fishing-ink/40 hover:bg-fishing-olive/10 hover:text-fishing-olive'}`}
          title="Fangbuch"
        >
          <Fish className="w-6 h-6" />
        </button>

        {user.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'admin' ? 'bg-fishing-olive text-white' : 'text-fishing-ink/40 hover:bg-fishing-olive/10 hover:text-fishing-olive'}`}
            title="Admin"
          >
            <ShieldCheck className="w-6 h-6" />
          </button>
        )}

        <button 
          onClick={() => setActiveTab('settings')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-fishing-olive text-white' : 'text-fishing-ink/40 hover:bg-fishing-olive/10 hover:text-fishing-olive'}`}
          title="Einstellungen"
        >
          <Settings className="w-6 h-6" />
        </button>

        <button 
          onClick={() => setActiveTab('info')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'info' ? 'bg-fishing-olive text-white' : 'text-fishing-ink/40 hover:bg-fishing-olive/10 hover:text-fishing-olive'}`}
          title="Info & Ordnung"
        >
          <Info className="w-6 h-6" />
        </button>
      </nav>

      <main className={`max-w-6xl mx-auto p-6 md:p-12 ${isPrintMode ? 'p-0' : ''}`}>
        <div className="no-print">
          <header className="mb-12 flex justify-between items-end">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-fishing-olive/60 mb-2 block">
              {user.role === 'admin' ? 'Administrator' : 'Mitglied'}: {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
            </span>
            <h1 className="text-5xl md:text-7xl font-light">
              {activeTab === 'dashboard' && (
                <>
                  Willkommen
                  <span className="block text-lg md:text-xl text-fishing-olive/60 mt-2 font-medium">
                    Fischereiverein Willersdorf/Haid
                  </span>
                </>
              )}
              {activeTab === 'events' && 'Termine'}
              {activeTab === 'catches' && 'Fangbuch'}
              {activeTab === 'admin' && 'Verwaltung'}
              {activeTab === 'settings' && 'Einstellungen'}
              {activeTab === 'info' && 'Info & Ordnung'}
            </h1>
          </div>
          <div className="flex gap-4">
            {dataLoading && (
              <div className="flex items-center text-fishing-olive/40 text-xs font-mono uppercase tracking-widest animate-pulse mr-4">
                Lade Daten...
              </div>
            )}
            {activeTab === 'catches' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-fishing-olive text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
            {activeTab === 'events' && user.role === 'admin' && (
              <button 
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="bg-fishing-olive text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex justify-between items-center">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={fetchData} className="text-xs underline font-bold">Erneut versuchen</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`grid grid-cols-1 ${user.role === 'admin' ? 'xl:grid-cols-4 lg:grid-cols-3' : 'lg:grid-cols-3'} gap-8`}
            >
              <div className={`${user.role === 'admin' ? 'xl:col-span-2' : 'lg:col-span-2'} space-y-8`}>
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl">Nächste Termine</h2>
                    <button onClick={() => setActiveTab('events')} className="text-sm font-medium text-fishing-olive flex items-center">
                      Alle sehen <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {events.length > 0 ? (
                      events.slice(0, 2).map(event => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          isAdmin={user.role === 'admin'} 
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                        />
                      ))
                    ) : (
                      <div className="bg-white/50 border border-dashed border-black/10 rounded-3xl p-12 text-center">
                        <Calendar className="w-12 h-12 text-fishing-olive/20 mx-auto mb-4" />
                        <p className="text-fishing-ink/40 text-sm">Keine anstehenden Termine.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl">Top Fänge</h2>
                    <button onClick={() => setActiveTab('catches')} className="text-sm font-medium text-fishing-olive flex items-center">
                      Fangbuch <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {catches.length > 0 ? (
                      catches.slice(0, 2).map(fish => (
                        <CatchCard 
                          key={fish.id} 
                          fish={fish} 
                          isAdmin={user.role === 'admin'} 
                          currentUserId={user.id}
                          onDelete={handleDeleteCatch}
                        />
                      ))
                    ) : (
                      <div className="col-span-full bg-white/50 border border-dashed border-black/10 rounded-3xl p-12 text-center">
                        <Fish className="w-12 h-12 text-fishing-olive/20 mx-auto mb-4" />
                        <p className="text-fishing-ink/40 text-sm">Noch keine Fänge eingetragen.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-8">
                <div className="bg-fishing-olive text-white p-8 rounded-[2.5rem] shadow-xl shadow-fishing-olive/20">
                  <h3 className="text-2xl mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Statistik 2026
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <span className="text-white/60 text-[10px] uppercase tracking-widest block mb-1">Gesamtgewicht</span>
                      <span className="text-2xl font-medium">{stats.totalWeight} <span className="text-sm opacity-60">kg</span></span>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <span className="text-white/60 text-[10px] uppercase tracking-widest block mb-1">Schwerster</span>
                      <span className="text-2xl font-medium">{stats.heaviest} <span className="text-sm opacity-60">kg</span></span>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <span className="text-white/60 text-[10px] uppercase tracking-widest block mb-1">Längster</span>
                      <span className="text-2xl font-medium">{stats.longest} <span className="text-sm opacity-60">cm</span></span>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <span className="text-white/60 text-[10px] uppercase tracking-widest block mb-1">Ø Länge</span>
                      <span className="text-2xl font-medium">{stats.avgLength} <span className="text-sm opacity-60">cm</span></span>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="text-white/60 text-sm">Eingetragene Fänge</span>
                    <span className="text-xl font-medium">{catches.length}</span>
                  </div>

                  {user.role === 'admin' && catches.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Top Angler</h4>
                      <div className="space-y-3">
                        {(Object.entries(
                          catches.reduce((acc, c) => {
                            acc[c.angler] = (acc[c.angler] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ) as [string, number][])
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]) => (
                          <div key={name} className="flex justify-between items-center text-sm">
                            <span className="text-white/80">{name}</span>
                            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-xs">{count} Fänge</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </aside>

              {user.role === 'admin' && (
                <aside className="space-y-8 xl:block hidden">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 h-full">
                    <h3 className="text-2xl mb-6 flex items-center gap-2">
                      <History className="w-6 h-6 text-fishing-olive" />
                      Fang-Journal
                    </h3>
                    <div className="space-y-6">
                      {catches.length > 0 ? (
                        catches.slice(0, 8).map(fish => (
                          <div key={fish.id} className="flex gap-4 items-start pb-4 border-b border-black/5 last:border-0">
                            <div className="w-12 h-12 bg-fishing-olive/5 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {fish.image_url ? (
                                <img src={fish.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Fish className="w-6 h-6 text-fishing-olive/20" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{fish.species}</p>
                              <p className="text-xs text-fishing-ink/40 truncate">{fish.angler}</p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] font-mono text-fishing-olive/60">{new Date(fish.date).toLocaleDateString('de-DE')}</span>
                                <span className="text-[10px] font-mono font-bold">{fish.weight}kg</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-fishing-ink/40 italic">Keine Fänge vorhanden.</p>
                      )}
                    </div>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="w-full mt-6 py-3 bg-fishing-cream text-fishing-olive text-xs font-mono uppercase tracking-widest rounded-xl hover:bg-fishing-olive hover:text-white transition-all"
                    >
                      Alle anzeigen
                    </button>
                  </div>
                </aside>
              )}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div 
              key="events"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {events.length > 0 ? (
                events.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    isAdmin={user.role === 'admin'} 
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))
              ) : (
                <div className="col-span-full bg-white/50 border border-dashed border-black/10 rounded-3xl p-24 text-center">
                  <Calendar className="w-16 h-16 text-fishing-olive/10 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Keine Termine</h3>
                  <p className="text-fishing-ink/40 text-sm">Aktuell sind keine Termine geplant.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'catches' && (
            <motion.div 
              key="catches"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Filters */}
              <div className="bg-white p-6 rounded-[2rem] border border-black/5 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fishing-ink/30" />
                  <input 
                    type="text"
                    placeholder="Suchen nach Fischart, Angler..."
                    className="w-full bg-fishing-cream/30 border border-black/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                    value={catchSearch}
                    onChange={e => setCatchSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-fishing-ink/30" />
                  <select 
                    className="bg-fishing-cream/30 border border-black/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fishing-olive/20"
                    value={catchSpeciesFilter}
                    onChange={e => setCatchSpeciesFilter(e.target.value)}
                  >
                    {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {user.role === 'admin' && (
                  <button 
                    onClick={() => setShowOnlyMyCatches(!showOnlyMyCatches)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showOnlyMyCatches ? 'bg-fishing-olive text-white' : 'bg-fishing-cream/30 text-fishing-ink/60 hover:bg-fishing-cream/50'}`}
                  >
                    Nur meine Fänge
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCatches.length > 0 ? (
                  filteredCatches.map(fish => (
                    <CatchCard 
                      key={fish.id} 
                      fish={fish} 
                      isAdmin={user.role === 'admin'} 
                      currentUserId={user.id}
                      onDelete={handleDeleteCatch}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-white/50 border border-dashed border-black/10 rounded-3xl p-24 text-center">
                    <Search className="w-16 h-16 text-fishing-olive/10 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Keine Fänge gefunden</h3>
                    <p className="text-fishing-ink/40 text-sm">Versuche es mit anderen Filtern oder einer anderen Suche.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5 no-print">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl flex items-center gap-2">
                    <Printer className="w-8 h-8 text-fishing-olive" />
                    Druck-Center
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setPrintType('events');
                      setIsPrintMode(true);
                      setTimeout(() => window.print(), 100);
                    }}
                    className="flex items-center gap-4 p-6 bg-fishing-cream/30 rounded-3xl border border-black/5 hover:bg-fishing-cream/50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-fishing-olive group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Termine drucken</p>
                      <p className="text-xs text-fishing-ink/40">Alle anstehenden Termine als Liste</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setPrintType('catches');
                      setIsPrintMode(true);
                      setTimeout(() => window.print(), 100);
                    }}
                    className="flex items-center gap-4 p-6 bg-fishing-cream/30 rounded-3xl border border-black/5 hover:bg-fishing-cream/50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-fishing-olive group-hover:scale-110 transition-transform">
                      <Fish className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Fangmeldungen drucken</p>
                      <p className="text-xs text-fishing-ink/40">Alle Fänge als Übersicht</p>
                    </div>
                  </button>
                </div>
              </section>

              {adminStats && (
                <section className="bg-white p-8 rounded-[2.5rem] border border-black/5">
                  <h2 className="text-3xl mb-8 flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-fishing-olive" />
                    Fangstatistik
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Species Distribution */}
                    <div className="bg-fishing-cream/20 p-6 rounded-3xl border border-black/5">
                      <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-fishing-olive" />
                        Fischarten Verteilung
                      </h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={adminStats.bySpecies}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {adminStats.bySpecies.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                              formatter={(value: any, name: string) => [`${value} Fänge`, name]}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Monthly Distribution */}
                    <div className="bg-fishing-cream/20 p-6 rounded-3xl border border-black/5">
                      <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5 text-fishing-olive" />
                        Fänge pro Monat
                      </h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={adminStats.byMonth}>
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#14141460' }} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#14141460' }} 
                            />
                            <Tooltip 
                              cursor={{ fill: 'rgba(90, 90, 64, 0.05)' }}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="count" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top Anglers Ranking */}
                    <div className="lg:col-span-2 bg-fishing-cream/20 p-6 rounded-3xl border border-black/5">
                      <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-fishing-olive" />
                        Top Angler Ranking
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {adminStats.topAnglers.map((angler, index) => (
                          <div key={angler.name} className="bg-white p-4 rounded-2xl border border-black/5 relative overflow-hidden group">
                            <div className="absolute -right-2 -top-2 text-6xl font-serif font-black text-fishing-olive/5 group-hover:text-fishing-olive/10 transition-colors">
                              {index + 1}
                            </div>
                            <p className="text-xs font-mono uppercase tracking-widest text-fishing-olive/60 mb-1">Platz {index + 1}</p>
                            <p className="font-medium truncate pr-8">{angler.name}</p>
                            <p className="text-2xl font-bold mt-2">{angler.count} <span className="text-xs font-normal opacity-40">Fänge</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl mb-1">Einladungen</h2>
                    <p className="text-sm text-fishing-ink/40">Erstelle Codes für neue Mitglieder</p>
                  </div>
                  <button 
                    onClick={generateInvite}
                    className="bg-fishing-olive text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" /> Code generieren
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {invites.map(invite => (
                    <div 
                      key={invite.id} 
                      className={`p-6 rounded-3xl border ${invite.used_by ? 'bg-black/5 border-transparent opacity-50' : 'bg-fishing-cream/30 border-black/5'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl font-mono font-bold tracking-tighter">{invite.code}</span>
                        {invite.used_by ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(invite.code);
                              alert('Code kopiert!');
                            }}
                            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-mono opacity-40">
                        {invite.used_by ? `Genutzt von: ${invite.used_by_name}` : 'Noch ungenutzt'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5">
                <h2 className="text-3xl mb-8 flex items-center gap-2">
                  <Users className="w-8 h-8 text-fishing-olive" />
                  Mitglieder
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-fishing-cream/30 rounded-2xl border border-black/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-fishing-olive/10 rounded-full flex items-center justify-center text-fishing-olive font-bold">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-fishing-ink/60">{u.username}</p>
                          <p className="text-[10px] uppercase tracking-widest font-mono opacity-40">{u.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' && <ShieldCheck className="w-5 h-5 text-fishing-olive" />}
                        {u.id !== user.id && (
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Mitglied entfernen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5">
                <h2 className="text-3xl mb-8 flex items-center gap-2">
                  <Fish className="w-8 h-8 text-fishing-olive" />
                  Fang-Journal (Alle Mitglieder)
                </h2>
                <div className="overflow-x-auto -mx-8 px-8">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-black/5 text-[10px] uppercase tracking-widest font-mono text-fishing-ink/40">
                        <th className="pb-4 font-medium">Datum</th>
                        <th className="pb-4 font-medium">Angler</th>
                        <th className="pb-4 font-medium">Fischart</th>
                        <th className="pb-4 font-medium">Gewicht</th>
                        <th className="pb-4 font-medium">Länge</th>
                        <th className="pb-4 font-medium">Ort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {catches.length > 0 ? (
                        catches.map(c => (
                          <tr key={c.id} className="text-sm hover:bg-fishing-cream/20 transition-colors">
                            <td className="py-4 whitespace-nowrap">{new Date(c.date).toLocaleDateString('de-DE')}</td>
                            <td className="py-4 font-medium whitespace-nowrap">{c.angler}</td>
                            <td className="py-4 whitespace-nowrap">{c.species}</td>
                            <td className="py-4 whitespace-nowrap">{c.weight} kg</td>
                            <td className="py-4 whitespace-nowrap">{c.length} cm</td>
                            <td className="py-4 text-fishing-ink/60">{c.location}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-fishing-ink/40 text-sm italic">
                            Noch keine Fänge im Journal vorhanden.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5">
                <h2 className="text-3xl mb-8 flex items-center gap-2">
                  <FileText className="w-8 h-8 text-fishing-olive" />
                  Mitglieder-Feedback
                </h2>
                <div className="space-y-4">
                  {feedbackList.length > 0 ? (
                    feedbackList.map(f => (
                      <div key={f.id} className="p-6 bg-fishing-cream/30 rounded-3xl border border-black/5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-fishing-olive/10 rounded-full flex items-center justify-center text-fishing-olive font-bold text-xs">
                              {f.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{f.first_name} {f.last_name}</p>
                              <p className="text-[10px] uppercase tracking-widest font-mono opacity-40">
                                {new Date(f.created_at).toLocaleDateString('de-DE')} {new Date(f.created_at).toLocaleTimeString('de-DE')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-fishing-ink/70 leading-relaxed">{f.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-fishing-ink/30 italic">
                      Noch kein Feedback erhalten.
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5">
                <h2 className="text-3xl mb-8 flex items-center gap-2">
                  <Settings className="w-8 h-8 text-fishing-olive" />
                  App-Inhalte verwalten
                </h2>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSettingsUpdating(true);
                  const formData = new FormData(e.currentTarget);
                  
                  try {
                    const res = await fetch('/api/settings', {
                      method: 'PUT',
                      body: formData
                    });
                    if (res.ok) {
                      alert('Einstellungen erfolgreich gespeichert');
                      fetchData();
                    }
                  } catch (err) {
                    alert('Fehler beim Speichern der Einstellungen');
                  } finally {
                    setIsSettingsUpdating(false);
                  }
                }} className="space-y-8">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">Gewässerordnung (Text)</label>
                    <textarea 
                      name="water_regulations"
                      defaultValue={appSettings.water_regulations}
                      className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-6 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-fishing-olive/20 transition-all resize-y"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">Parkmöglichkeiten (Bild hochladen)</label>
                    <div className="flex flex-col gap-4">
                      {appSettings.parking_info && (
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border border-black/5">
                          <img src={appSettings.parking_info} alt="Aktuelles Parkplatzbild" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        name="parking_image"
                        accept="image/*"
                        className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-fishing-olive/10 file:text-fishing-olive hover:file:bg-fishing-olive/20"
                      />
                    </div>
                  </div>
                  
                  
                  <button 
                    type="submit"
                    disabled={isSettingsUpdating}
                    className="w-full bg-fishing-olive text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSettingsUpdating ? 'Wird gespeichert...' : 'Inhalte aktualisieren'}
                  </button>
                </form>
              </section>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-fishing-olive/10 rounded-2xl flex items-center justify-center text-fishing-olive">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl">Profil</h2>
                      <p className="text-sm text-fishing-ink/40">Ändere deinen Benutzernamen</p>
                    </div>
                  </div>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    try {
                      const res = await fetch('/api/user/profile', {
                        method: 'PUT',
                        body: formData
                      });
                      if (res.ok) {
                        const newUser = await res.json();
                        setUser(newUser);
                        alert('Profil erfolgreich aktualisiert');
                      } else {
                        const err = await res.json();
                        alert(err.error || 'Fehler beim Aktualisieren');
                      }
                    } catch (err) {
                      alert('Netzwerkfehler');
                    }
                  }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">Vorname</label>
                        <input 
                          name="first_name"
                          type="text" 
                          defaultValue={user.first_name}
                          className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">Nachname</label>
                        <input 
                          name="last_name"
                          type="text" 
                          defaultValue={user.last_name}
                          className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">Benutzername</label>
                      <input 
                        name="username"
                        type="text" 
                        defaultValue={user.username}
                        className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-fishing-olive/20 transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">Fischereischein (Vorderseite)</label>
                        {user.license_front_url && (
                          <div className="mb-4 aspect-video rounded-2xl overflow-hidden border border-black/5 shadow-sm">
                            <img src={user.license_front_url} alt="Lizenz Vorne" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input 
                          name="license_front"
                          type="file" 
                          accept="image/*"
                          className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-fishing-olive/10 file:text-fishing-olive hover:file:bg-fishing-olive/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-fishing-olive/60 mb-3">Fischereischein (Rückseite)</label>
                        {user.license_back_url && (
                          <div className="mb-4 aspect-video rounded-2xl overflow-hidden border border-black/5 shadow-sm">
                            <img src={user.license_back_url} alt="Lizenz Hinten" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input 
                          name="license_back"
                          type="file" 
                          accept="image/*"
                          className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-fishing-olive/10 file:text-fishing-olive hover:file:bg-fishing-olive/20"
                        />
                      </div>
                    </div>

                    <button className="w-full bg-fishing-olive text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all">
                      Profil speichern
                    </button>
                  </form>
                </section>

                {/* Password Section */}
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-fishing-olive/10 rounded-2xl flex items-center justify-center text-fishing-olive">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl">Passwort</h2>
                      <p className="text-sm text-fishing-ink/40">Sicherheitseinstellungen</p>
                    </div>
                  </div>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const currentPassword = formData.get('currentPassword') as string;
                    const newPassword = formData.get('newPassword') as string;
                    const confirmPassword = formData.get('confirmPassword') as string;

                    if (newPassword !== confirmPassword) {
                      alert('Passwörter stimmen nicht überein');
                      return;
                    }

                    try {
                      const res = await fetch('/api/user/password', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword })
                      });
                      if (res.ok) {
                        alert('Passwort erfolgreich geändert');
                        e.currentTarget.reset();
                      } else {
                        const err = await res.json();
                        alert(err.error || 'Fehler beim Ändern des Passworts');
                      }
                    } catch (err) {
                      alert('Netzwerkfehler');
                    }
                  }} className="space-y-6">
                    <PasswordInput label="Aktuelles Passwort" name="currentPassword" />
                    <PasswordInput label="Neues Passwort" name="newPassword" />
                    <PasswordInput label="Passwort bestätigen" name="confirmPassword" />
                    <button className="w-full bg-fishing-olive text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all">
                      Passwort ändern
                    </button>
                  </form>
                </section>

                {/* Notification Section */}
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-fishing-olive/10 rounded-2xl flex items-center justify-center text-fishing-olive">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl">Benachrichtigungen</h2>
                      <p className="text-sm text-fishing-ink/40">Erhalte Erinnerungen für Termine</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-fishing-cream/30 rounded-3xl border border-black/5">
                    <div>
                      <p className="font-medium">Erinnerungen (1 Tag vorher)</p>
                      <p className="text-sm text-fishing-ink/60">Push-Benachrichtigungen auf dein Handy</p>
                    </div>
                    <button
                      onClick={subscribeToPush}
                      disabled={pushSubscribed || pushLoading}
                      className={`px-8 py-4 rounded-2xl font-medium transition-all ${
                        pushSubscribed 
                          ? 'bg-green-100 text-green-700 cursor-default' 
                          : 'bg-fishing-olive text-white hover:opacity-90 shadow-lg shadow-fishing-olive/20'
                      } disabled:opacity-50`}
                    >
                      {pushLoading ? 'Wird aktiviert...' : pushSubscribed ? 'Aktiviert' : 'Aktivieren'}
                    </button>
                  </div>
                </section>

                {/* App Installation Section */}
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-fishing-olive/10 rounded-2xl flex items-center justify-center text-fishing-olive">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl">App Installation</h2>
                      <p className="text-sm text-fishing-ink/40">Scanne den Code zum Installieren</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="p-4 bg-white rounded-3xl border border-black/5 shadow-inner">
                      <QRCodeCanvas 
                        value={window.location.origin} 
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <p className="text-sm text-fishing-ink/60 leading-relaxed">
                        Scanne diesen QR-Code mit deinem Smartphone, um die App direkt zu öffnen. 
                        Du kannst sie dann über das Browser-Menü ("Zum Home-Bildschirm hinzufügen") 
                        als App auf deinem Handy installieren.
                      </p>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Petri Heil Manager',
                              text: 'Schau dir unseren Angelverein Manager an!',
                              url: window.location.origin,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.origin);
                            alert('Link kopiert!');
                          }
                        }}
                        className="w-full py-4 bg-fishing-olive text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <Share2 className="w-5 h-5" /> App teilen
                      </button>
                    </div>
                  </div>
                </section>

                {/* Feedback Section */}
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-fishing-olive/10 rounded-2xl flex items-center justify-center text-fishing-olive">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl">Feedback</h2>
                      <p className="text-sm text-fishing-ink/40">Hilf uns, die App zu verbessern</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea 
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      placeholder="Was können wir an der App noch verbessern? Hast du Wünsche oder Fehler gefunden?"
                      className="w-full bg-fishing-cream/30 border border-black/5 rounded-2xl p-6 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-fishing-olive/20 transition-all resize-none"
                    />
                    <button 
                      onClick={async () => {
                        if (!feedbackContent.trim()) return;
                        setIsFeedbackSubmitting(true);
                        try {
                          const res = await fetch('/api/feedback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: feedbackContent })
                          });
                          if (res.ok) {
                            alert('Vielen Dank für dein Feedback!');
                            setFeedbackContent('');
                          }
                        } catch (err) {
                          alert('Fehler beim Senden des Feedbacks');
                        } finally {
                          setIsFeedbackSubmitting(false);
                        }
                      }}
                      disabled={isFeedbackSubmitting || !feedbackContent.trim()}
                      className="w-full bg-fishing-olive text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isFeedbackSubmitting ? 'Wird gesendet...' : 'Feedback senden'}
                    </button>
                  </div>
                </section>

                {/* Logout Section */}
                <section className="bg-red-50/50 rounded-[2.5rem] p-8 border border-red-100">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                        <LogOut className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl text-red-900">Abmelden</h2>
                        <p className="text-sm text-red-600/60">Sitzung beenden</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="px-8 py-4 bg-red-600 text-white rounded-2xl font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                    >
                      Jetzt abmelden
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
          {activeTab === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-black/5">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-fishing-olive/10 rounded-[2rem] flex items-center justify-center text-fishing-olive">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-4xl">Gewässerordnung</h2>
                    <p className="text-fishing-ink/40">Wichtige Regeln für unsere Mitglieder</p>
                  </div>
                </div>
                <div className="prose prose-fishing max-w-none">
                  <div className="whitespace-pre-wrap text-lg leading-relaxed text-fishing-ink/80 bg-fishing-cream/20 p-8 rounded-[2rem] border border-black/5">
                    {appSettings.water_regulations || 'Keine Gewässerordnung hinterlegt.'}
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-black/5">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-fishing-olive/10 rounded-[2rem] flex items-center justify-center text-fishing-olive">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-4xl">Parkmöglichkeiten</h2>
                    <p className="text-fishing-ink/40">Übersicht der Stellplätze am Gewässer</p>
                  </div>
                </div>
                {appSettings.parking_info ? (
                  <div className="rounded-[2.5rem] overflow-hidden border border-black/5 shadow-lg">
                    <img 
                      src={appSettings.parking_info} 
                      alt="Parkmöglichkeiten" 
                      className="w-full h-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="bg-fishing-cream/20 p-12 rounded-[2.5rem] border border-dashed border-black/10 flex flex-col items-center justify-center text-fishing-ink/30">
                    <MapPin className="w-12 h-12 mb-4 opacity-20" />
                    <p>Keine Parkplatz-Informationen hinterlegt.</p>
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        {/* Print View */}
        {isPrintMode && (
          <div className="print-only">
            <div className="mb-8 border-b-2 border-fishing-olive pb-4 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-serif text-fishing-olive">Angelverein "Petri Heil"</h1>
                <p className="text-fishing-ink/60 uppercase tracking-widest text-xs font-mono mt-2">
                  {printType === 'events' ? 'Terminübersicht' : 'Fangmeldungen Übersicht'}
                </p>
              </div>
              <div className="text-right text-xs font-mono text-fishing-ink/40">
                Gedruckt am: {new Date().toLocaleDateString('de-DE')} {new Date().toLocaleTimeString('de-DE')}
              </div>
            </div>

            {printType === 'events' ? (
              <div className="space-y-6">
                {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                  <div key={event.id} className="border border-black/10 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-medium">{event.title}</h3>
                      <span className="font-mono text-sm">
                        {new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-fishing-ink/60 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </p>
                    <p className="text-sm leading-relaxed">{event.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black/10 text-xs uppercase tracking-widest font-mono">
                    <th className="py-3">Datum</th>
                    <th className="py-3">Angler</th>
                    <th className="py-3">Fischart</th>
                    <th className="py-3">Gewicht</th>
                    <th className="py-3">Länge</th>
                    <th className="py-3">Ort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {catches.map(c => (
                    <tr key={c.id} className="text-sm">
                      <td className="py-3">{new Date(c.date).toLocaleDateString('de-DE')}</td>
                      <td className="py-3 font-medium">{c.angler}</td>
                      <td className="py-3">{c.species}</td>
                      <td className="py-3">{c.weight} kg</td>
                      <td className="py-3">{c.length} cm</td>
                      <td className="py-3 text-fishing-ink/60">{c.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-12 pt-8 border-t border-black/10 text-center text-[10px] text-fishing-ink/40 font-mono italic">
              Diese Liste wurde automatisch erstellt. Änderungen vorbehalten.
            </div>
          </div>
        )}
      </main>

      <AddCatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={fetchData} 
        user={user}
      />

      <AddEventModal 
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onAdd={fetchData}
        editEvent={editingEvent}
      />
    </div>
  );
}
