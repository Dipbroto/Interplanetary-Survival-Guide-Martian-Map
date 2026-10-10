import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ChevronRight, Rocket, ShieldCheck, X, Loader2 } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { supabase } from '../lib/supabase';
import { marsAudio } from '../utils/audioSynthesizer';

export default function AuthModal() {
  const isAuthModalOpen = useMapStore(s => s.isAuthModalOpen);
  const setAuthModalOpen = useMapStore(s => s.setAuthModalOpen);
  
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    marsAudio.playUiClick?.();

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || `Explorer-${Math.floor(Math.random()*9000)+1000}` }
          }
        });
        if (signUpError) throw signUpError;
        
        if (data?.session) {
          // Email confirmation is disabled in Supabase, instant login!
          marsAudio.playQuindarTone?.(true);
          setAuthModalOpen(false);
        } else {
          // Email confirmation is still enabled, prompt to login/verify
          setMode('login');
          setError("Registration successful! Please login."); 
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        
        marsAudio.playQuindarTone?.(true);
        setAuthModalOpen(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={() => setAuthModalOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-space-950/90 border border-white/10 rounded-3xl shadow-hud-glass overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex justify-between items-start bg-space-900/50">
            <div>
              <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mars-400" />
                COMMAND AUTHORIZATION
              </h2>
              <p className="text-space-400 text-xs font-mono mt-1">Nasa Space Apps - MarsWalk System</p>
            </div>
            <button 
              onClick={() => setAuthModalOpen(false)}
              className="text-space-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className={`mb-4 p-3 rounded-xl border text-xs font-mono flex items-center gap-2
                ${error.includes('successful') ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400' : 'bg-red-950/50 border-red-500/50 text-red-400'}
              `}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-space-300 uppercase tracking-wider ml-1">Callsign / Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-400" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Commander Ares"
                      className="w-full bg-space-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-mars-500 transition-colors"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-space-300 uppercase tracking-wider ml-1">Auth ID (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="astronaut@nasa.gov"
                    className="w-full bg-space-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-mars-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-space-300 uppercase tracking-wider ml-1">Passcode</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-space-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-mars-500 transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-mars-500 hover:bg-mars-400 text-white rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-neon-mars flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Initiate Login Sequence' : 'Register Commander'}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Footer Tabs */}
          <div className="flex border-t border-white/[0.08] bg-space-900/30">
            <button 
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${mode === 'login' ? 'text-mars-400 bg-white/[0.02] border-b-2 border-mars-500' : 'text-space-500 hover:text-white'}`}
            >
              Access Identity
            </button>
            <button 
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${mode === 'register' ? 'text-mars-400 bg-white/[0.02] border-b-2 border-mars-500' : 'text-space-500 hover:text-white'}`}
            >
              New Identity
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
