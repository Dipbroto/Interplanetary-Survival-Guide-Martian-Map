import React, { useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { generateForecast } from '../data/weatherSimulation';
import { marsDateFromEarthDate } from '../utils/marsUtils';
import { Thermometer, Wind, CloudFog, Sun, Gauge, Calendar, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const WeatherPanel = () => {
  const { currentSol, weather } = useMapStore();
  
  const forecast = useMemo(() => {
    return generateForecast(currentSol, 7);
  }, [currentSol]);

  const marsDate = useMemo(() => marsDateFromEarthDate(new Date()), []);
  
  if (!weather) return null;

  return (
    <div className="w-full h-full text-primary flex flex-col gap-4 overflow-y-auto custom-scrollbar p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-display text-white flex items-center gap-2">
            <CloudFog className="text-mars-400" size={24} />
            Mars Weather Station
          </h2>
          <div className="text-sm text-secondary flex items-center gap-2 mt-1 font-mono">
            <Calendar size={14} />
            <span>Sol {currentSol}</span>
            <span className="text-space-600">•</span>
            <span>{marsDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-space-800/80 px-3 py-1.5 rounded-full border border-space-700 text-xs text-secondary">
          <Info size={14} className="text-mars-400" />
          <span>Historical REMS/MEDA Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Conditions Main Card */}
        <div className="md:col-span-2 glass-panel p-4 rounded-xl border border-space-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-mars-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <Thermometer size={16} /> Current Conditions
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Temp */}
            <div className="flex flex-col">
              <span className="text-secondary text-xs mb-1">Temperature</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-display ${weather.temperature > -20 ? 'text-mars-400' : 'text-blue-400'}`}>
                  {weather.temperature}°C
                </span>
              </div>
              <div className="text-xs text-secondary mt-2 flex justify-between font-mono">
                <span className="text-blue-400">L: {weather.minTemp}°</span>
                <span className="text-mars-400">H: {weather.maxTemp}°</span>
              </div>
            </div>

            {/* Pressure */}
            <div className="flex flex-col">
              <span className="text-secondary text-xs mb-1">Pressure</span>
              <div className="flex items-end gap-2">
                <Gauge size={28} className="text-space-400 mb-1" />
                <div>
                  <div className="text-2xl font-display text-white">{weather.pressure}</div>
                  <div className="text-xs text-secondary font-mono">Pa</div>
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="flex flex-col">
              <span className="text-secondary text-xs mb-1">Wind</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-space-800 border border-space-700 flex items-center justify-center relative">
                  <div className="absolute w-1 h-1 bg-mars-400 rounded-full"></div>
                  <motion.div 
                    animate={{ rotate: weather.windDirection }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className="absolute w-full h-full flex items-start justify-center pt-1"
                  >
                    <div className="w-1.5 h-3 bg-white rounded-full" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                  </motion.div>
                </div>
                <div>
                  <div className="text-2xl font-display text-white">{weather.windSpeed}</div>
                  <div className="text-xs text-secondary font-mono">m/s</div>
                </div>
              </div>
            </div>

            {/* Environment */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary">Dust (τ)</span>
                  <span className="text-white font-mono">{weather.dustOpacity.toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-full bg-space-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${weather.dustOpacity > 1.5 ? 'bg-red-500' : weather.dustOpacity > 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (weather.dustOpacity / 3) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary text-xs">UV Index</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  weather.uvIndex === 'Extreme' ? 'bg-purple-900/50 text-purple-400 border border-purple-700/50' : 
                  weather.uvIndex === 'High' ? 'bg-red-900/50 text-red-400 border border-red-700/50' : 
                  'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50'
                }`}>
                  {weather.uvIndex}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Season Info Card */}
        <div className="glass-panel p-4 rounded-xl border border-space-700/50 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <Sun size={48} className="text-mars-400/20 absolute -right-4 -bottom-4" />
          <div className="text-secondary text-xs mb-2">Current Season</div>
          <div className="text-2xl font-display text-white mb-1">{weather.season}</div>
          <div className="text-sm text-mars-400 font-mono bg-mars-500/10 px-3 py-1 rounded-full border border-mars-500/20">
            Ls {Math.round(weather.ls)}°
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
        {/* 7-Sol Forecast Strip */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-space-700/50">
          <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar size={16} /> 7-Sol Forecast
          </h3>
          <div className="flex justify-between items-stretch gap-2 overflow-x-auto custom-scrollbar pb-2">
            {forecast.map((day, i) => (
              <div key={day.sol} className="flex-1 min-w-[70px] bg-space-800/40 border border-space-700/50 rounded-lg p-2 flex flex-col items-center justify-between">
                <div className="text-xs text-secondary font-mono mb-2">Sol {day.sol}</div>
                <CloudFog size={20} className={day.dustOpacity > 1.0 ? 'text-mars-400' : 'text-space-400'} />
                <div className="mt-3 text-center">
                  <div className="text-sm text-mars-400 font-display">{day.maxTemp}°</div>
                  <div className="text-xs text-blue-400 font-display">{day.minTemp}°</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="glass-panel p-4 rounded-xl border border-space-700/50">
          <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
            <Thermometer size={16} /> Temp Trend
          </h3>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a334a" vertical={false} />
                <XAxis dataKey="sol" stroke="#606c8b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#606c8b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131825', borderColor: '#2a334a', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f0f2f7' }}
                />
                <Line type="monotone" dataKey="maxTemp" stroke="#f47050" strokeWidth={2} dot={{ r: 2, fill: '#f47050' }} name="Max" />
                <Line type="monotone" dataKey="minTemp" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2, fill: '#60a5fa' }} name="Min" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPanel;
