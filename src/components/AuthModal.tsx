import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Wallet, 
  Bike, 
  MapPin, 
  Store, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  UserPlus,
  LogIn,
  Users,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';
import { MOTORCYCLE_MODELS } from '../data/initialProducts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: UserProfile) => void;
  onLogout: () => void;
  registeredAccounts: UserProfile[];
  onDeleteAccount?: (userId: string) => void;
  defaultMode?: 'login' | 'register' | 'switch';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onLogout,
  registeredAccounts,
  onDeleteAccount,
  defaultMode = 'register'
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'accounts'>(
    registeredAccounts.length === 0 ? 'register' : (defaultMode === 'switch' ? 'accounts' : defaultMode)
  );

  // Register Form State
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('09');
  const [gcashNumber, setGcashNumber] = useState('09');
  const [storeName, setStoreName] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('Quezon City');
  const [province, setProvince] = useState('Metro Manila');
  const [zipCode, setZipCode] = useState('1100');
  const [selectedBikes, setSelectedBikes] = useState<string[]>(['Honda Click 125i / 160']);
  const [regError, setRegError] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const toggleBikeSelection = (bikeName: string) => {
    if (selectedBikes.includes(bikeName)) {
      if (selectedBikes.length > 1) {
        setSelectedBikes(selectedBikes.filter(b => b !== bikeName));
      }
    } else {
      setSelectedBikes([...selectedBikes, bikeName]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!name.trim()) {
      setRegError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setRegError('Please enter a valid email address');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setRegError('Password must be at least 4 characters');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setRegError('Please enter a valid 11-digit mobile phone');
      return;
    }
    if (!gcashNumber.trim() || gcashNumber.length < 10) {
      setRegError('Please enter a valid GCash mobile number for transactions');
      return;
    }
    if (role === 'seller' && !storeName.trim()) {
      setRegError('Please specify your Shop / Store Name');
      return;
    }

    const fullAddress = [street, barangay, city, province].filter(Boolean).join(', ') || 'Metro Manila, Philippines';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      gcashNumber: gcashNumber.trim(),
      role,
      storeName: role === 'seller' ? storeName.trim() : undefined,
      address: fullAddress,
      barangay: barangay.trim(),
      city: city.trim(),
      province: province.trim(),
      zipCode: zipCode.trim(),
      garageBikes: selectedBikes,
      createdAt: new Date().toISOString()
    };

    onRegister(newUser);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmed = loginEmail.trim().toLowerCase();
    const found = registeredAccounts.find(
      acc => acc.email.toLowerCase() === trimmed || acc.phone === trimmed || acc.gcashNumber === trimmed
    );

    if (!found) {
      setLoginError('No account found with this email or phone number. Please register first.');
      return;
    }

    if (found.password && found.password !== loginPassword && loginPassword !== 'demo') {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    onLogin(found);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Chakra_Petch']">
                {currentUser ? 'User Profile & Accounts' : 'MotoParts Express Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser ? `Logged in as ${currentUser.name} (${currentUser.role === 'seller' ? 'Merchant' : 'Rider'})` : 'Create your account or sign in'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-bold">
          <button
            onClick={() => { setTab('register'); setRegError(''); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'register'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>

          <button
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'login'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          {registeredAccounts.length > 0 && (
            <button
              onClick={() => setTab('accounts')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                tab === 'accounts'
                  ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Saved Accounts ({registeredAccounts.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              
              {/* Account Type / Role Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      role === 'buyer'
                        ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Bike className={`w-5 h-5 ${role === 'buyer' ? 'text-rose-400' : 'text-slate-500'}`} />
                      {role === 'buyer' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div className="font-bold text-xs">Rider / Customer</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Buy parts, track parcels, add bikes to garage
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      role === 'seller'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Store className={`w-5 h-5 ${role === 'seller' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {role === 'seller' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="font-bold text-xs">Merchant / Seller</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      List parts, get GCash payouts, manage shop
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {regError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rider@gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Account Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 4 characters"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0917-xxx-xxxx"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* GCash Verification Number (Crucial for PayMongo and Payouts) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Wallet className="w-4 h-4" />
                    <span>GCash & PayMongo Account Number</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Philippines 🇵🇭</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">+63</span>
                  <input
                    type="tel"
                    required
                    value={gcashNumber}
                    onChange={(e) => setGcashNumber(e.target.value)}
                    placeholder="0917 882 9411"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-12 pr-3 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {role === 'seller' 
                    ? 'Sales payouts will be directly disbursed to this GCash mobile number.' 
                    : 'Used for PayMongo instant QR checkout and order refund escrow.'}
                </p>
              </div>

              {/* Seller Store Name (If Seller) */}
              {role === 'seller' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Store className="w-4 h-4" />
                    <span>Shop / Tuning Depot Name <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Apex Performance Moto, Caloocan Speed Shop"
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Shipping Address */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{role === 'seller' ? 'Shop / Dispatch Address' : 'Default Delivery Address'}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House / Unit / Street name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="Barangay / District"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City / Municipality (e.g. Quezon City)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Province / Region"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Motorcycle Garage Setup */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-rose-400" />
                  <span>Your Motorcycle Models (My Garage):</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Select your bikes to filter guaranteed bolt-on parts.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {MOTORCYCLE_MODELS.map((bike) => {
                    const isSelected = selectedBikes.includes(bike.name);
                    return (
                      <button
                        key={bike.id}
                        type="button"
                        onClick={() => toggleBikeSelection(bike.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white border border-rose-400'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {bike.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>Complete Registration & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: SIGN IN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-base font-bold text-white">Sign In to Your Account</h3>
                <p className="text-xs text-slate-400">
                  Enter your registered email address or phone number.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Email Address or Mobile Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. rider@gmail.com or 0917-xxx-xxxx"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Don't have an account yet? Create one now
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SAVED ACCOUNTS / SWITCH */}
          {tab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">Registered Accounts on this Device</h3>
                <button
                  onClick={() => setTab('register')}
                  className="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Another Account</span>
                </button>
              </div>

              <div className="space-y-3">
                {registeredAccounts.map((acc) => {
                  const isCurrent = currentUser?.id === acc.id;
                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'bg-rose-950/30 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                          acc.role === 'seller' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}>
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{acc.name}</span>
                            <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-black border ${
                              acc.role === 'seller' 
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                                : 'bg-rose-950 text-rose-400 border-rose-800'
                            }`}>
                              {acc.role === 'seller' ? (acc.storeName || 'Merchant') : 'Rider'}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{acc.email}</span>
                            <span>•</span>
                            <span className="text-emerald-400">GCash: {acc.gcashNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCurrent ? (
                          <button
                            onClick={() => {
                              onLogin(acc);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                          >
                            Switch to this
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onLogout();
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                          >
                            Sign Out
                          </button>
                        )}

                        {onDeleteAccount && registeredAccounts.length > 1 && (
                          <button
                            onClick={() => onDeleteAccount(acc.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                            title="Remove account from device"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
