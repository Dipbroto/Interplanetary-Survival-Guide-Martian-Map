import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, Cpu } from 'lucide-react';
import { chatWithMissionControl } from '../services/aiService';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';

export default function MissionControlChat() {
  const [history, setHistory] = useState([
    { role: 'model', text: "A.R.E.S. Uplink Established. How can I assist your EVA today, Commander?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  
  const viewMode = useMapStore(s => s.viewMode);
  const currentSol = useMapStore(s => s.currentSol);
  const cursorPosition = useMapStore(s => s.cursorPosition);
  
  const appState = { viewMode, currentSol, cursorPosition };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    marsAudio.playUiClick?.();

    const response = await chatWithMissionControl(userMessage, history, appState);
    
    setHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
    marsAudio.playQuindarTone?.(false);
  };

  return (
    <div className="flex flex-col h-[300px] border border-purple-500/30 bg-[#0B0C10]/80 rounded-xl overflow-hidden mt-4 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
      {/* Header */}
      <div className="bg-purple-900/40 p-2 flex items-center gap-2 border-b border-purple-500/30">
        <Cpu className="w-4 h-4 text-purple-400" />
        <span className="text-[10px] font-mono font-bold text-purple-300 tracking-widest uppercase">A.R.E.S. AI COMMLINK</span>
      </div>
      
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar-y">
        {history.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[8px] font-mono mb-0.5 opacity-60 ${msg.role === 'user' ? 'text-cyan-400' : 'text-purple-400'}`}>
              {msg.role === 'user' ? 'COMMANDER' : 'A.R.E.S.'}
            </span>
            <div className={`text-[11px] font-mono p-2 rounded-lg max-w-[90%] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-cyan-900/30 border border-cyan-500/30 text-cyan-100' 
                : 'bg-purple-900/30 border border-purple-500/30 text-purple-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-purple-400 text-[10px] font-mono p-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>A.R.E.S. is processing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-purple-500/30 bg-black/40 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-purple-500 shrink-0" />
        <input 
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask A.R.E.S. a question..."
          className="flex-1 bg-transparent border-none outline-none text-[11px] font-mono text-white placeholder:text-space-500"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded shrink-0 transition-colors disabled:opacity-50"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
