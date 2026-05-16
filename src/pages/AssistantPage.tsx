import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, DollarSign, ArrowRight, ArrowRightLeft, Home } from 'lucide-react';
import { askTravelAssistant } from '../lib/gemini';
import { storage } from '../lib/storage';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { VaultContent } from './VaultPage';
import { useI18n } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Add global types for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const EXCHANGE_RATES: Record<string, number> = {
  USD: 25000,
  EUR: 27000,
  GBP: 31000,
  AUD: 16000,
  JPY: 165,
  KRW: 18,
  THB: 680,
};

function ConverterContent() {
  const [convertAmount, setConvertAmount] = useState<string>('');
  const [convertCurrency, setConvertCurrency] = useState<string>('USD');
  const [isVndToForeign, setIsVndToForeign] = useState(false);
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto p-4 pb-20 min-h-0">
      <div className="max-w-5xl mx-auto w-full">
        {/* Currency Converter */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-600 p-1.5 rounded-lg">
                <DollarSign size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">{t('Exchange Rates', 'Tỷ giá hối đoái', 'Rate de schimb')}</h2>
            </div>
            <button 
              onClick={() => setIsVndToForeign(!isVndToForeign)}
              className="text-slate-400 hover:text-brand-500 bg-slate-50 p-2 rounded-full transition-colors cursor-pointer"
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-base font-semibold text-slate-900 outline-none focus:border-brand-500"
              />
              <div className="relative shrink-0">
                <select
                  value={isVndToForeign ? 'VND' : convertCurrency}
                  onChange={(e) => !isVndToForeign && setConvertCurrency(e.target.value)}
                  disabled={isVndToForeign}
                  className="h-full bg-slate-50 border border-slate-200 rounded-xl px-3 pr-8 text-sm font-bold text-slate-700 outline-none appearance-none focus:border-brand-500 disabled:opacity-70 cursor-pointer"
                   style={{ backgroundImage: isVndToForeign ? 'none' : 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.65em auto' }}
                >
                  {isVndToForeign ? (
                    <option value="VND">VND</option>
                  ) : (
                    Object.keys(EXCHANGE_RATES).map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
             <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <ArrowRight size={14} className="text-slate-400" /> 
                {isVndToForeign ? (
                  <select 
                    value={convertCurrency}
                    onChange={(e) => setConvertCurrency(e.target.value)}
                    className="bg-transparent text-slate-700 font-bold focus:outline-none uppercase appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '0.65em auto', paddingRight: '1rem' }}
                  >
                    {Object.keys(EXCHANGE_RATES).map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                ) : (
                  t('VND Estimated', 'Ước tính VND', 'VND Estimat')
                )}
             </div>
             <div className="text-xl font-black text-brand-600 truncate max-w-[200px]" title={
                convertAmount && !isNaN(Number(convertAmount)) 
                  ? isVndToForeign 
                     ? (Number(convertAmount) / EXCHANGE_RATES[convertCurrency]).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ` ${convertCurrency}`
                     : (Number(convertAmount) * EXCHANGE_RATES[convertCurrency]).toLocaleString('en-US') + ' ₫' 
                  : isVndToForeign ? `0 ${convertCurrency}` : '0 ₫'
             }>
               {convertAmount && !isNaN(Number(convertAmount)) 
                 ? isVndToForeign 
                    ? (Number(convertAmount) / EXCHANGE_RATES[convertCurrency]).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ` ${convertCurrency}`
                    : (Number(convertAmount) * EXCHANGE_RATES[convertCurrency]).toLocaleString('en-US') + ' ₫' 
                 : isVndToForeign ? `0 ${convertCurrency}` : '0 ₫'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [view, setView] = useState<'chat' | 'vault' | 'converter'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<{label: string, prompt: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const trips = storage.getTrips();
    const activeTrip = trips && trips.length > 0 ? trips[0] : null;
    
    let welcomeText = 'Chào bạn! (Hello!) I am VoyageAI, your personal travel guide.\n\nI can help you translate phrases, find clean street food, navigate local transport, or organize your itinerary. How can I help you today?';
    
    if (activeTrip) {
      welcomeText = `Chào bạn! (Hello!) I see you have a trip planned to **${activeTrip.destination}**.\n\nI can help you find the best street food in ${activeTrip.destination}, suggest hidden gems, or help you organize your daily itinerary. What would you like to explore first?`;
      setSuggestions([
        { label: `🍜 Food in ${activeTrip.destination}`, prompt: `What are some popular street food locations in ${activeTrip.destination}?` },
        { label: `📍 Hidden Gems`, prompt: `What are the top hidden gems to explore in ${activeTrip.destination}?` },
        { label: `🗣️ Local Phrases`, prompt: `Teach me some essential local phrases for ${activeTrip.destination}.` }
      ]);
    } else {
      setSuggestions([
        { label: `💡 Plan a Trip`, prompt: `Can you help me plan a 5-day trip to Vietnam?` },
        { label: `🎒 Packing List`, prompt: `What should I pack for a tropical vacation?` },
        { label: `🗣️ Local Phrases`, prompt: `What are some essential Vietnamese phrases?` }
      ]);
    }

    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: welcomeText
      }
    ]);
  }, []);

  useEffect(() => {
    if (view === 'chat') {
      scrollToBottom();
    }
  }, [messages, loading, view]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput(''); // clear input before new speech
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const sendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: promptText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const trips = storage.getTrips();
    const activeTrip = trips && trips.length > 0 ? trips[0] : null;

    const response = await askTravelAssistant(userMsg.content, {
      activeTrip
    });
    
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleSend = async () => {
    sendPrompt(input);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 pt-safe font-sans">
      <div className="flex items-center justify-center p-3 bg-white border-b border-slate-100 shadow-sm z-10 shrink-0 relative">
        <button onClick={() => navigate('/')} className="absolute left-3 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="Home">
          <Home size={20} />
        </button>
        <div className="bg-slate-100 p-1 flex items-center rounded-xl overflow-x-auto hide-scrollbar max-w-[calc(100%-80px)]">
           <button 
             onClick={() => setView('chat')}
             className={cn("px-4 py-1.5 text-sm font-bold rounded-lg transition-all shrink-0", view === 'chat' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
           >
              {t('Chat', 'Trò chuyện', 'Chat')}
           </button>
           <button 
             onClick={() => setView('converter')}
             className={cn("px-4 py-1.5 text-sm font-bold rounded-lg transition-all shrink-0", view === 'converter' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
           >
              {t('Converter', 'Quy đổi', 'Convertor')}
           </button>
           <button 
             onClick={() => setView('vault')}
             className={cn("px-4 py-1.5 text-sm font-bold rounded-lg transition-all shrink-0", view === 'vault' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
           >
              {t('Vault', 'Két', 'Seif')}
           </button>
        </div>
      </div>

      {view === 'vault' ? (
        <VaultContent />
      ) : view === 'converter' ? (
        <ConverterContent />
      ) : (
        <div className="flex flex-col flex-1 h-full min-h-0 relative">
          <div className="flex-1 overflow-y-auto p-4 pb-44">
            <div className="max-w-5xl mx-auto w-full space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full gap-3",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-brand-600 shadow-sm mt-1">
                      <Bot size={18} />
                    </div>
                  )}

                  <div className={cn(
                    "relative px-5 py-4 text-[0.95rem] leading-relaxed shadow-sm max-w-[82%] sm:max-w-[75%]",
                    msg.role === 'user' 
                      ? "bg-brand-600 text-white rounded-[1.5rem] rounded-tr-sm" 
                      : "bg-white text-slate-800 border border-slate-100 rounded-[1.5rem] rounded-tl-sm ring-1 ring-slate-100/50"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body prose prose-sm prose-slate max-w-none">
                         <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 shadow-sm mt-1">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {messages.length === 1 && suggestions.length > 0 && (
                <div className="flex flex-col gap-2 mt-2 ml-12 max-w-[80%] sm:max-w-[70%]">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => sendPrompt(s.prompt)}
                      disabled={loading}
                      className="bg-brand-50 border border-brand-100 text-brand-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-100 hover:border-brand-200 transition-all shadow-sm text-left flex items-center"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex w-full gap-3 justify-start items-center">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 text-brand-600 shadow-sm flex items-center justify-center">
                     <Bot size={18} />
                  </div>
                  <div className="bg-white px-5 py-4 rounded-[1.5rem] shadow-sm border border-slate-100 rounded-tl-sm flex gap-2 ring-1 ring-slate-100/50">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 pt-2 pb-3 px-4 pb-safe z-40">
            <div className="flex items-center gap-2 max-w-5xl mx-auto relative w-full pt-1">
              {recognitionRef.current && (
                <button
                  onClick={toggleListening}
                  className={cn(
                    "absolute left-2 p-2 rounded-full transition-all flex items-center justify-center shrink-0",
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  )}
                  title={isListening ? "Stop listening" : "Start speaking"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
              <input
                type="text"
                className={cn(
                  "flex-1 bg-slate-50 border border-slate-200 rounded-full py-3 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-400 text-slate-900",
                  recognitionRef.current ? "pl-11" : "px-5"
                )}
                placeholder={isListening ? "Listening..." : "Ask about your trip..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-brand-500 text-white p-3 rounded-full shadow-sm disabled:opacity-50 transition-opacity"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
