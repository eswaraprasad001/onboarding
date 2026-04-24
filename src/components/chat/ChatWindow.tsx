'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Trash2 } from 'lucide-react';
import { ChatMessage } from '@/types';
import { RuleEngine, ChatContext } from '@/lib/ruleEngine';
import chatRules from '@/data/chatRules';
import { useOnboarding } from '@/context/OnboardingContext';
import { useGame } from '@/context/GameContext';
import MessageBubble from './MessageBubble';
import SuggestedQuestions from './SuggestedQuestions';

const STORAGE_KEY = 'presidio-chat';
const ruleEngine = new RuleEngine(chatRules);

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  content: "Hi! I'm your onboarding assistant. Ask me about your steps, templates, knowledge articles, or the Solution Owner Playbook.",
  sender: 'ai',
  timestamp: new Date().toISOString(),
};

const DEFAULT_SUGGESTIONS = [
  'What step should I work on next?',
  'What are the five phases of the Solution Owner framework?',
  'How do I use the Knowledge Hub?',
];

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { selectedRole, currentView, completedSteps, totalSteps, currentStep, completedSubTasks, totalSubTasks, progressPercentage } = useOnboarding();
  const { addXP, checkBadge } = useGame();

  // Load messages from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (messages.length > 1 || messages[0]?.id !== 'welcome') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Listen for toggle-chat event
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-chat', handler);
    return () => window.removeEventListener('toggle-chat', handler);
  }, []);

  // Listen for Cmd+/ shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const buildContext = useCallback((): ChatContext => ({
    role: selectedRole,
    currentView,
    stepsCompleted: completedSteps,
    totalSteps,
    currentStepTitle: currentStep?.title ?? null,
    completedSubTasks,
    totalSubTasks,
    progressPercentage,
  }), [selectedRole, currentView, completedSteps, totalSteps, currentStep, completedSubTasks, totalSubTasks, progressPercentage]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(36),
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Evaluate with rule engine
    const context = buildContext();
    const result = ruleEngine.evaluate(trimmed, context);

    // Track chat usage for badge
    const msgCount = messages.filter((m) => m.sender === 'user').length + 1;
    if (msgCount >= 10) {
      checkBadge('chat-pro');
    }
    addXP(2, 'Asked a question');

    // Simulate slight delay
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(36),
        content: result.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        relatedSources: result.relatedSources,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setSuggestions(result.suggestedQuestions);
    }, 300);
  }, [buildContext, messages, checkBadge, addXP]);

  const handleFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
    );
  }, []);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setSuggestions(DEFAULT_SUGGESTIONS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 flex items-center justify-center transition-colors"
            aria-label="Open AI Assistant"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[540px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-primary-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onFeedback={msg.sender === 'ai' ? handleFeedback : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
              <SuggestedQuestions questions={suggestions} onSelect={sendMessage} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="p-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1.5">
                Press ⌘/ to toggle • Powered by rule engine
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
