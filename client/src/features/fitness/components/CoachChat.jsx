import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Sparkles, User, Bot, CheckCircle2 } from 'lucide-react';
import { useParseCoachMessage } from '../hooks/useFitness';

export default function CoachChat({ currentState, onUpdateState }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I'm your elite AI coach. Tell me what you're trying to achieve, your experience level, equipment, or any dietary preferences. I'll automatically fill out your plan settings."
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const parseMut = useParseCoachMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || parseMut.isPending) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await parseMut.mutateAsync({
        text: userMessage,
        currentConstraints: currentState
      });

      if (!res.data && !res.extracted && !res.coachResponse) {
        throw new Error("AI returned no data (likely rate limited)");
      }

      const parsedData = res.data?.extracted || res.extracted || {};
      
      // Update wizard state with extracted data
      if (Object.keys(parsedData).length > 0) {
        onUpdateState(parsedData);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.data?.coachResponse || res.coachResponse || "I've updated your settings. Is there anything else you want to tweak, or are we ready to build the plan?",
          extracted: Object.keys(parsedData).length > 0 ? parsedData : null
        }
      ]);
    } catch (err) {
      const isRateLimit = err.message?.includes('rate limited') || err?.response?.status === 429;
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: isRateLimit ? "I'm currently receiving too many requests. Please give me a few seconds and try again." : "Sorry, I had trouble parsing that. Could you rephrase?" }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[var(--th-bg)] rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--th-border)' }}>
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
                style={{ background: msg.role === 'user' ? 'var(--th-primary)' : 'var(--th-card)', border: '1px solid var(--th-border)' }}
              >
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />}
              </div>
              
              <div className="space-y-2">
                <div 
                  className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'rounded-tr-sm text-white' : 'rounded-tl-sm'}`}
                  style={msg.role === 'user' ? { background: 'var(--th-primary)' } : { background: 'var(--th-card)', color: 'var(--th-text)' }}
                >
                  {msg.content}
                </div>

                {/* Extracted Fields Chip */}
                {msg.extracted && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-wrap gap-1.5"
                  >
                    {Object.entries(msg.extracted).slice(0, 3).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-secondary)] border border-[var(--th-border)]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="capitalize">{k}:</span>
                        <span className="font-semibold text-[var(--th-text)]">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                      </div>
                    ))}
                    {Object.keys(msg.extracted).length > 3 && (
                      <div className="text-[10px] px-2 py-1 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-secondary)] border border-[var(--th-border)]">
                        +{Object.keys(msg.extracted).length - 3} more
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          {parseMut.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-[var(--th-card)] border border-[var(--th-border)]">
                <Bot className="w-4 h-4 text-[var(--th-primary)]" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-sm bg-[var(--th-card)] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--th-text-secondary)]" />
                <span className="text-xs text-[var(--th-text-secondary)]">Analyzing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="E.g. 'I want to build muscle, I have dumbbells and 4 days a week...'"
            disabled={parseMut.isPending}
            className="flex-1 bg-[var(--th-bg)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)', '--tw-ring-color': 'var(--th-primary)' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || parseMut.isPending}
            className="w-12 flex-shrink-0 rounded-xl flex items-center justify-center text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            style={{ background: 'var(--th-primary)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
