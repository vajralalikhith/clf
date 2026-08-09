import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  FileText,
  Search,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { aiAssistantService, AssistantMessage } from '../services/aiAssistantService';

const SUGGESTED_PROMPTS = [
  'How do I report a lost item?',
  'How do I contact the owner?',
  'What should I do if I found an ID card?',
  'Where can I find my reports?'
];

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! 👋 Welcome to the **Campus Lost & Found AI Assistant**.

I'm here to help you navigate item reports, contact owners, recover lost valuables, and answer any campus lost and found policies.

How can I help you today? Choose a suggested question below or type your own message!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Report Lost Item', link: '/report-lost' },
        { label: 'Search Catalog', link: '/search' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isThinking) return;

    setInputQuery('');

    // Add user message
    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await aiAssistantService.generateResponse(textToSend);
      const assistantMsg: AssistantMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.actions
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error in AI Assistant:', err);
      const errorMsg: AssistantMessage = {
        id: `error_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving an answer. Please try asking again or check our quick search catalog.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `Chat history cleared. How else can I assist you with the Campus Lost & Found portal?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Report Lost Item', link: '/report-lost' },
          { label: 'Search Catalog', link: '/search' }
        ]
      }
    ]);
  };

  // Helper to render bold text and numbered lists safely
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold syntax **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <React.Fragment key={idx}>
          {formattedParts}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                AI Campus Assistant
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase tracking-wider border border-blue-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-300" />
                Gemini Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Instant answers for reporting items, security handoffs, and campus recovery guidelines.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0 text-xs font-bold flex items-center gap-1.5"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isThinking}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all text-left flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
          {messages.map((msg) => {
            const isAssistant = msg.sender === 'assistant';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${
                  isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${
                    isAssistant
                      ? 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white'
                      : 'bg-slate-800 dark:bg-slate-700 text-white'
                  }`}
                >
                  {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div className="space-y-2">
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isAssistant
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}
                  >
                    <div>{renderFormattedText(msg.text)}</div>

                    {/* Action Links Pill */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <Link
                            key={aIdx}
                            to={action.link}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors border border-blue-200/50 dark:border-blue-800/50"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] text-slate-400 font-medium px-1 ${
                      isAssistant ? 'text-left' : 'text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                </div>
                <span>Generating campus guidance...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question (e.g., 'How do I report a lost wallet?')..."
            className="flex-1 p-3 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all shadow-md shadow-blue-500/20 font-bold flex items-center gap-2 text-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
