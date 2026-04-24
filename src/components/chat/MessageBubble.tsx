'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, User, ThumbsUp, ThumbsDown, ArrowUpRight } from 'lucide-react';
import { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

export default function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
          } whitespace-pre-line`}
        >
          {message.content}
        </div>

        {!isUser && message.relatedSources?.length ? (
          <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Related sources
            </div>
            <div className="mt-2 space-y-2">
              {message.relatedSources.map((source) => (
                <Link
                  key={source.id}
                  href={source.href}
                  className="group flex items-start justify-between gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {source.label}
                    </div>
                    {source.description ? (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {source.description}
                      </div>
                    ) : null}
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Feedback buttons for AI messages */}
          {!isUser && onFeedback && (
            <div className="flex gap-1">
              <button
                onClick={() => onFeedback(message.id, 'positive')}
                className={`p-0.5 rounded transition-colors ${
                  message.feedback === 'positive'
                    ? 'text-green-500'
                    : 'text-gray-300 dark:text-gray-600 hover:text-green-500'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback(message.id, 'negative')}
                className={`p-0.5 rounded transition-colors ${
                  message.feedback === 'negative'
                    ? 'text-red-500'
                    : 'text-gray-300 dark:text-gray-600 hover:text-red-500'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
