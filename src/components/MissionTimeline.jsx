import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Camera, FlaskConical, Footprints, Wrench, Microscope, Coffee } from 'lucide-react';
import useMapStore from '../store/useMapStore';

const ACTIVITY_TYPES = {
  traverse: { icon: Footprints, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  sample: { icon: FlaskConical, color: 'text-mars-400', bg: 'bg-mars-400/10', border: 'border-mars-400/30' },
  photo: { icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  rest: { icon: Coffee, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  setup: { icon: Wrench, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  experiment: { icon: Microscope, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' }
};

const MissionTimeline = () => {
  const { missionActivities = [], addActivity, removeActivity, clearActivities } = useMapStore();
  
  const [form, setForm] = useState({
    type: 'traverse',
    duration: 1,
    description: '',
    sol: 1
  });

  const totalDuration = missionActivities.reduce((acc, curr) => acc + (Number(curr.duration) || 1), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description) return;
    addActivity({
      id: Date.now().toString(),
      ...form
    });
    setForm(prev => ({ ...prev, description: '' }));
  };

  return (
    <div className="flex flex-col h-full bg-space-900/30 rounded-2xl border border-space-800/50 overflow-hidden">
      <div className="p-5 border-b border-space-800 bg-space-900/50">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-primary">EVA Planner</h3>
            <div className="text-xs text-secondary flex items-center mt-1">
              <Clock size={12} className="mr-1" /> Est. Duration: <span className="text-primary font-mono ml-1">{totalDuration.toFixed(1)}h</span>
            </div>
          </div>
          <button 
            onClick={clearActivities}
            className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 flex items-center bg-red-400/10 px-2 py-1.5 rounded transition-colors"
          >
            <Trash2 size={12} className="mr-1" /> Clear All
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select 
              className="bg-space-950 border border-space-700 rounded-lg p-2 text-sm text-primary focus:border-mars-500 outline-none transition-colors"
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
            >
              {Object.keys(ACTIVITY_TYPES).map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            <div className="flex items-center bg-space-950 border border-space-700 rounded-lg px-3 transition-colors focus-within:border-mars-500">
              <span className="text-space-400 text-xs font-bold uppercase tracking-wider mr-2">Hrs</span>
              <input 
                type="number" 
                min="0.5" step="0.5"
                className="bg-transparent w-full text-sm text-primary outline-none font-mono"
                value={form.duration}
                onChange={(e) => setForm({...form, duration: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Activity description..."
            className="w-full bg-space-950 border border-space-700 rounded-lg p-2.5 text-sm text-primary focus:border-mars-500 outline-none transition-colors placeholder:text-space-600"
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
          />
          <button 
            type="submit"
            className="w-full bg-mars-500 hover:bg-mars-600 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center shadow-lg shadow-mars-500/20"
          >
            <Plus size={16} className="mr-1.5" /> Add Task to EVA
          </button>
        </form>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-space-800">
          <AnimatePresence>
            {missionActivities.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-space-500 py-4 text-center font-mono"
              >
                No activities planned yet. Add one above.
              </motion.div>
            ) : (
              missionActivities.map((activity, index) => {
                const actType = activity.type || 'traverse';
                const config = ACTIVITY_TYPES[actType] || ACTIVITY_TYPES.traverse;
                const Icon = config.icon;
                
                return (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`relative p-3.5 rounded-xl border ${config.bg} ${config.border} backdrop-blur-md group shadow-sm`}
                  >
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full border-[3px] border-space-900 bg-current" style={{ color: config.color.replace('text-', '') }} />
                    
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        <Icon size={14} className={`${config.color} mr-2`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                          {actType}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-[10px] font-mono text-space-400 bg-space-950/50 px-2 py-0.5 rounded border border-space-800 mr-2">
                          Sol {activity.sol || 1} • {activity.duration || 1}h
                        </span>
                        <button 
                          onClick={() => removeActivity(activity.id)}
                          className="opacity-0 group-hover:opacity-100 text-space-500 hover:text-red-400 transition-opacity p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-primary leading-snug">{activity.description}</p>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MissionTimeline;
