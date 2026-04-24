'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface AIChatProps {
  selectedRole?: 'BA' | 'SO' | null
  currentView?: string
}

export default function AIChat({ selectedRole, currentView }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm your onboarding assistant. I'm here to help you navigate the application, find templates, answer questions about the ${selectedRole || 'BA/SO'} role, and guide you through your onboarding journey. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    // Navigation help
    if (message.includes('navigate') || message.includes('find') || message.includes('where')) {
      if (message.includes('template')) {
        return "To access templates, click on 'Template Library' in the Quick Actions section on your dashboard. There you'll find 20+ real Solution Owner templates including case studies from Allied Solutions, Ardent Mills, NHL, and PGA Tour. You can search by client name or filter by category."
      }
      if (message.includes('knowledge') || message.includes('article')) {
        return "You can access the Knowledge Hub by clicking 'Knowledge Hub' in the Quick Actions. It contains 5 comprehensive articles covering stakeholder communication, agile requirements, SDLC management, Jira usage, and managing difficult stakeholders."
      }
      if (message.includes('dashboard') || message.includes('home')) {
        return "To return to your dashboard, click the 'Dashboard' button in the top navigation bar. From there you can see your progress, onboarding steps, and quick actions."
      }
      return "I can help you navigate to different sections! The main areas are: Dashboard (your progress and steps), Template Library (20+ real SO templates), and Knowledge Hub (comprehensive articles). What would you like to find?"
    }

    // Role-specific help
    if (message.includes('solution owner') || message.includes('so role')) {
      return "As a Solution Owner, you'll focus on solution design, technical coordination, and delivery oversight. Key responsibilities include stakeholder management, requirements translation, and ensuring successful project delivery. Check out the 'Solution Owner Practice Overview' template for detailed role information."
    }
    
    if (message.includes('business analyst') || message.includes('ba role')) {
      return "As a Business Analyst, you'll focus on requirements gathering, stakeholder management, and process analysis. Your role involves bridging business needs with technical solutions. The Knowledge Hub has great articles on stakeholder communication and requirements gathering."
    }

    // Template-specific help
    if (message.includes('allied solutions')) {
      return "The Allied Solutions case study showcases a complete AWS cloud migration project with 40% cost reduction and 60% deployment speed improvement. You can find it in the Template Library under Case Studies - it includes the full solution approach and results."
    }
    
    if (message.includes('nhl') || message.includes('apple watch')) {
      return "The NHL Apple Watch Project case study demonstrates sports technology integration and wearable development. It's a great example of mobile-first solutions and real-time data integration. Find it in the Template Library under Case Studies."
    }

    if (message.includes('case study') || message.includes('client')) {
      return "We have 6 real client case studies available: Allied Solutions (cloud migration), Ardent Mills (supply chain), Bank United (financial services), CP Rail (transportation), NHL (sports tech), and PGA Tour (process innovation). All are in the Template Library under Case Studies."
    }

    // Process and onboarding help
    if (message.includes('onboarding') || message.includes('steps') || message.includes('process')) {
      return `Your ${selectedRole || 'BA/SO'} onboarding includes 6 key steps: System Access Setup, Role Introduction, Process Overview, Template Library exploration, First Assignment, and Knowledge Assessment. Each step has estimated time and clear objectives. You can track progress on your dashboard.`
    }

    if (message.includes('progress') || message.includes('complete')) {
      return "You can track your onboarding progress on the main dashboard. Click on each step to mark it as complete. The progress bar shows your overall completion percentage and estimated time remaining."
    }

    // Tools and systems
    if (message.includes('jira')) {
      return "There's a comprehensive 'Jira for Business Analysts' guide in the Knowledge Hub that covers project setup, issue types, requirements management, and best practices. It's perfect for learning how to use Jira effectively in your role."
    }

    if (message.includes('agile') || message.includes('scrum')) {
      return "Check out the 'Agile Requirements Gathering Best Practices' article in the Knowledge Hub. It covers user stories, acceptance criteria, story mapping, and sprint planning - essential skills for agile environments."
    }

    // Stakeholder management
    if (message.includes('stakeholder') || message.includes('difficult') || message.includes('communication')) {
      return "The Knowledge Hub has excellent articles on 'Effective Stakeholder Communication Strategies' and 'Managing Difficult Stakeholders'. These cover the CALM approach, stakeholder types, and specific strategies for challenging situations."
    }

    // General help
    if (message.includes('help') || message.includes('how') || message.includes('what')) {
      return "I can help you with: 🧭 Navigation (finding templates, articles, dashboard), 📚 Learning (explaining roles, processes, tools), 🔍 Search (finding specific templates or information), and ❓ Questions (about onboarding, roles, or content). What would you like to know?"
    }

    // Default responses
    const defaultResponses = [
      "That's a great question! Based on your current context, I'd recommend checking the Template Library for real-world examples or the Knowledge Hub for detailed guides. What specific area would you like to explore?",
      `As a ${selectedRole || 'BA/SO'}, you have access to comprehensive resources. Would you like me to guide you to specific templates, articles, or help you with navigation?`,
      "I'm here to help with your onboarding journey! You can ask me about templates, articles, navigation, role responsibilities, or any specific topics you'd like to learn about.",
      "Let me help you find what you need! Are you looking for specific templates, want to learn about processes, or need help navigating the application?"
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // 1-2 second delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
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
            className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border z-50 ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-primary-50 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Onboarding Assistant</h3>
                  <p className="text-xs text-gray-500">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' 
                            ? 'bg-primary-600' 
                            : 'bg-gray-200'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="w-3 h-3 text-white" />
                          ) : (
                            <Bot className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-gray-600" />
                        </div>
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about onboarding..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      disabled={isTyping}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Ask about templates, navigation, roles, or onboarding steps
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
