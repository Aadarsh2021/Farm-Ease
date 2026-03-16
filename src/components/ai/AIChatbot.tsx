import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, MinusCircle } from 'lucide-react';
import { chatService, ChatMessage } from '@/lib/chatService';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([chatService.getInitialMessage()]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(userMsg.content);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] h-[520px] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="bg-emerald-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-700/50 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Farm-Ease Intelligence</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                  <MinusCircle size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about markets, weather..."
                  className="flex-1 px-4 py-3 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:scale-100 active:scale-90 transition-all shadow-lg shadow-emerald-200"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-900 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center relative overflow-hidden group border-2 border-emerald-800"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent pointer-events-none" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <MessageSquare size={28} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-emerald-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
