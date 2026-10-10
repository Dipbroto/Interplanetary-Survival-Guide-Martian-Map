import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShieldCheck, X, LogOut, Route, FlaskConical, 
  Settings, Clock, MapPin, ChevronRight, Lock, Key, Loader2, Play
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { supabase } from '../lib/supabase';
import { marsAudio } from '../utils/audioSynthesizer';

export default function UserProfileDashboard() {
  const isProfileModalOpen = useMapStore(s => s.isProfileModalOpen);
  const setProfileModalOpen = useMapStore(s => s.setProfileModalOpen);
  const user = useMapStore(s => s.user);
  const profile = useMapStore(s => s.profile);
  const setUser = useMapStore(s => s.setUser);
  const setProfile = useMapStore(s => s.setProfile);
  const setWaypoints = useMapStore(s => s.setWaypoints);

  const [activeTab, setActiveTab] = useState('overview');
  const [missions, setMissions] = useState([]);
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);
  const [scienceLogs, setScienceLogs] = useState([]);
  const [isLoadingScience, setIsLoadingScience] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  // Fetch Missions when opening the missions tab
  useEffect(() => {
    if (isProfileModalOpen && activeTab === 'missions' && user) {
      setIsLoadingMissions(true);
      supabase.from('missions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setMissions(data);
          setIsLoadingMissions(false);
        });
    }
  }, [isProfileModalOpen, activeTab, user]);

  // Fetch Science Logs when opening the science tab
  useEffect(() => {
    if (isProfileModalOpen && activeTab === 'science' && user) {
      setIsLoadingScience(true);
      supabase.from('science_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('discovered_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error("Science logs fetch error:", error);
          if (data) setScienceLogs(data);
          setIsLoadingScience(false);
        });
    }
  }, [isProfileModalOpen, activeTab, user]);


  const handleLogout = async () => {
    marsAudio.playUiClick?.();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setProfileModalOpen(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus('updating');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus('Error: ' + error.message);
    } else {
      setPasswordStatus('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordStatus(''), 3000);
    }
  };

  const handleLoadMission = (mission) => {
    marsAudio.playQuindarTone?.(true);
    setWaypoints(mission.waypoints);
    setProfileModalOpen(false);
  };

  if (!isProfileModalOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={() => setProfileModalOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-space-950/90 border border-white/10 rounded-3xl shadow-hud-glass overflow-hidden flex flex-col md:flex-row h-[80vh]"
        >
          {/* Close Button */}
          <button 
            onClick={() => setProfileModalOpen(false)}
            className="absolute top-4 right-4 z-50 text-space-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors bg-space-900/50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Sidebar */}
          <div className="w-full md:w-64 bg-space-900/60 border-r border-white/10 flex flex-col shrink-0">
            <div className="p-6 border-b border-white/10 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-space-800 border-2 border-mars-500 shadow-neon-mars flex items-center justify-center mb-3">
                <User className="w-10 h-10 text-mars-400" />
              </div>
              <h3 className="font-display font-black text-white text-lg tracking-wider uppercase">
                {profile?.username || 'Astronaut'}
              </h3>
              <div className="text-xs font-mono text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {profile?.rank || 'Active Clearance'}
              </div>
            </div>

            <nav className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all text-left ${activeTab === 'overview' ? 'bg-mars-500/20 text-mars-400 border border-mars-500/50' : 'text-space-400 hover:bg-white/5 hover:text-white'}`}
              >
                <User className="w-4 h-4" /> Overview
              </button>
              <button 
                onClick={() => setActiveTab('missions')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all text-left ${activeTab === 'missions' ? 'bg-mars-500/20 text-mars-400 border border-mars-500/50' : 'text-space-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Route className="w-4 h-4" /> Flight History
              </button>
              <button 
                onClick={() => setActiveTab('science')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all text-left ${activeTab === 'science' ? 'bg-mars-500/20 text-mars-400 border border-mars-500/50' : 'text-space-400 hover:bg-white/5 hover:text-white'}`}
              >
                <FlaskConical className="w-4 h-4" /> Science Logs
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all text-left ${activeTab === 'settings' ? 'bg-mars-500/20 text-mars-400 border border-mars-500/50' : 'text-space-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Settings className="w-4 h-4" /> Security & Settings
              </button>
            </nav>

            <div className="p-4 border-t border-white/10 mt-auto">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/20 hover:border-red-500/50 transition-all text-xs font-mono font-bold uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" /> Terminate Session
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-[#050608] overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-2">Personnel Dossier</h2>
                  <p className="text-space-400 font-mono text-sm">Authenticated via Secure NASA Uplink</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-space-900/50 border border-white/10 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-mars-500/10 rounded-full blur-xl group-hover:bg-mars-500/20 transition-all" />
                    <Route className="w-6 h-6 text-mars-400 mb-2" />
                    <span className="text-3xl font-display font-black text-white">{profile?.total_distance_km || 0} <span className="text-lg text-space-400">km</span></span>
                    <span className="text-xs font-mono text-space-400 uppercase tracking-wider">Total Distance Roved</span>
                  </div>
                  <div className="bg-space-900/50 border border-white/10 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
                    <FlaskConical className="w-6 h-6 text-cyan-400 mb-2" />
                    <span className="text-3xl font-display font-black text-white">{profile?.samples_collected || 0} <span className="text-lg text-space-400">Samples</span></span>
                    <span className="text-xs font-mono text-space-400 uppercase tracking-wider">Astrobiology Cache</span>
                  </div>
                </div>

                <div className="bg-space-900/30 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-sm font-mono text-space-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Identity Timeline
                  </h3>
                  <div className="space-y-4 font-mono text-xs text-space-400">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Clearance Level</span>
                      <span className="text-emerald-400">Level 4 (Planetary Surface)</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Auth Email</span>
                      <span className="text-white">{user.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Commission Date</span>
                      <span className="text-white">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MISSIONS TAB */}
            {activeTab === 'missions' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-2">Flight History</h2>
                  <p className="text-space-400 font-mono text-sm">Your published routes and saved EVA expeditions</p>
                </div>

                {isLoadingMissions ? (
                  <div className="flex flex-col items-center justify-center py-20 text-space-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-mars-500" />
                    <span className="font-mono text-xs uppercase tracking-wider">Decrypting flight logs...</span>
                  </div>
                ) : missions.length === 0 ? (
                  <div className="bg-space-900/30 border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center">
                    <Route className="w-12 h-12 text-space-700 mb-4" />
                    <h4 className="text-white font-bold mb-2">No Flight Logs Found</h4>
                    <p className="text-space-400 text-sm max-w-sm mb-6">You haven't published any routes yet. Draw a route on the map and click "Publish to Global Network" to save it here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missions.map((mission) => (
                      <div key={mission.id} className="bg-space-900/60 border border-white/10 rounded-2xl p-5 hover:border-mars-500/50 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-white font-bold text-lg font-display flex items-center gap-2">
                            {mission.title}
                            {mission.is_public && <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">PUBLIC</span>}
                          </h4>
                          <div className="text-xs font-mono text-space-400 mt-2 flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {mission.waypoints?.length || 0} Waypoints</span>
                            <span className="flex items-center gap-1"><Route className="w-3.5 h-3.5" /> {mission.total_distance?.toFixed(1)} km</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(mission.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleLoadMission(mission)}
                          className="px-4 py-2 bg-mars-500/10 hover:bg-mars-500/20 text-mars-400 border border-mars-500/30 hover:border-mars-500 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Launch Route
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SCIENCE TAB */}
            {activeTab === 'science' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-2">Science Logs</h2>
                  <p className="text-space-400 font-mono text-sm">Specimens cached and cataloged for MSR (Mars Sample Return)</p>
                </div>

                {isLoadingScience ? (
                  <div className="flex flex-col items-center justify-center py-20 text-space-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-cyan-500" />
                    <span className="font-mono text-xs uppercase tracking-wider">Retrieving laboratory records...</span>
                  </div>
                ) : scienceLogs.length === 0 ? (
                  <div className="bg-space-900/30 border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center">
                    <FlaskConical className="w-12 h-12 text-space-700 mb-4" />
                    <h4 className="text-white font-bold mb-2">No Specimens Cached</h4>
                    <p className="text-space-400 text-sm max-w-sm">No samples hermetically sealed yet. Visit the Science Lab modal and use the SuperCam to ablate and cache specimens.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scienceLogs.map((log) => (
                      <div key={log.id} className="bg-space-900/60 border border-white/10 rounded-2xl p-5 hover:border-cyan-500/50 transition-colors group flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-bold text-lg font-display flex items-center gap-2">
                            <FlaskConical className="w-4 h-4 text-cyan-400" />
                            {log.target_name}
                          </h4>
                          <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                            {new Date(log.discovered_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-space-400 font-mono uppercase tracking-wider">Formation & Spectrometry</div>
                          <div className="text-xs text-amber-400 font-mono">{log.mineralogy}</div>
                        </div>
                        {log.notes && (
                          <div className="mt-2 p-2 bg-black/40 rounded border border-white/5 text-[10px] text-space-400 italic">
                            "{log.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-2">Security Override</h2>
                  <p className="text-space-400 font-mono text-sm">Manage your authentication credentials</p>
                </div>

                <form onSubmit={handleChangePassword} className="bg-space-900/50 border border-white/10 rounded-2xl p-6 max-w-md space-y-4">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4 text-mars-400" /> Rotate Passcode
                  </h3>
                  
                  {passwordStatus && (
                    <div className={`p-3 rounded-xl border text-xs font-mono ${passwordStatus.includes('Error') ? 'bg-red-950/50 border-red-500/50 text-red-400' : passwordStatus === 'updating' ? 'bg-blue-950/50 border-blue-500/50 text-blue-400' : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400'}`}>
                      {passwordStatus}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-space-300 uppercase tracking-wider ml-1">New Passcode</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-400" />
                      <input 
                        type="password" 
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new secure passcode"
                        className="w-full bg-space-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-mars-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={passwordStatus === 'updating'}
                    className="w-full py-2.5 mt-2 bg-space-800 hover:bg-space-700 text-white rounded-xl font-bold font-mono text-xs tracking-wide uppercase transition-all border border-white/10 hover:border-mars-500/50 flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {passwordStatus === 'updating' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Override'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
