'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, User, BookOpen, Target, Users, ArrowRight, Clock, Award, Settings, Shield, FileText, Download, Eye, Search, Filter, RefreshCw, Link } from 'lucide-react'
import { onboardingConfig, OnboardingStep, categoryColors } from '@/config/onboardingConfig'
import { teamsService, TeamsDocument, TeamsChannel } from '@/services/teamsService'

interface UnifiedOnboardingProps {
  selectedRole: 'BA' | 'SO'
}

const categoryIcons = {
  access: Shield,
  learning: BookOpen,
  practice: Target,
  assessment: Award,
  tools: Settings
}

interface UnifiedOnboardingExports {
  connectToTeams: () => Promise<void>
  isTeamsConnected: boolean
  isLoadingDocuments: boolean
}

export default function UnifiedOnboarding({ selectedRole }: UnifiedOnboardingProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [isTeamsConnected, setIsTeamsConnected] = useState(false)
  const [teamsDocuments, setTeamsDocuments] = useState<TeamsDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<TeamsDocument[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('all')
  const [selectedStep, setSelectedStep] = useState<string>('all')
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<TeamsDocument | null>(null)

  useEffect(() => {
    // Initialize steps with role-specific content
    const initializedSteps = onboardingConfig.commonSteps.map(step => ({
      ...step,
      title: step.roleSpecific?.[selectedRole]?.title || step.title,
      description: step.roleSpecific?.[selectedRole]?.description || step.description,
      details: step.roleSpecific?.[selectedRole]?.details || step.details,
      detailsWithLinks: step.roleSpecific?.[selectedRole]?.detailsWithLinks || step.detailsWithLinks,
      requiredDocuments: step.roleSpecific?.[selectedRole]?.requiredDocuments || step.requiredDocuments
    }))
    
    setSteps(initializedSteps)
    
    // Check if Teams is already connected
    setIsTeamsConnected(teamsService.isAuthenticated())
  }, [selectedRole])

  useEffect(() => {
    // Filter documents based on search and filters
    let filtered = teamsDocuments

    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedDocumentType !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === selectedDocumentType)
    }

    if (selectedStep !== 'all') {
      filtered = filtered.filter(doc => doc.onboardingStep === selectedStep)
    }

    // Sort by relevance score
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore)

    setFilteredDocuments(filtered)
  }, [teamsDocuments, searchQuery, selectedDocumentType, selectedStep])

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  const toggleStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ))
  }

  const toggleExpanded = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  const connectToTeams = async () => {
    setIsLoadingDocuments(true)
    try {
      const success = await teamsService.authenticate()
      if (success) {
        setIsTeamsConnected(true)
        await loadTeamsDocuments()
      }
    } catch (error) {
      console.error('Failed to connect to Teams:', error)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const loadTeamsDocuments = async () => {
    setIsLoadingDocuments(true)
    try {
      // Get all channels and their documents
      const channels = await teamsService.getTeamsChannels()
      const allDocuments: TeamsDocument[] = []

      for (const channel of channels) {
        try {
          // Extract team and channel IDs from the channel data
          const teamId = channel.id.split('_')[0] // Simplified extraction
          const documents = await teamsService.getChannelDocuments(teamId, channel.id)
          allDocuments.push(...documents)
        } catch (error) {
          console.warn(`Failed to load documents from channel ${channel.displayName}:`, error)
        }
      }

      // Also search for onboarding-related documents
      const searchResults = await teamsService.searchDocuments(`${selectedRole} onboarding template guide`)
      allDocuments.push(...searchResults)

      // Remove duplicates based on document ID
      const uniqueDocuments = allDocuments.filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      )

      setTeamsDocuments(uniqueDocuments)
    } catch (error) {
      console.error('Failed to load Teams documents:', error)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const refreshDocuments = async () => {
    if (isTeamsConnected) {
      await loadTeamsDocuments()
    }
  }

  const previewDoc = async (document: TeamsDocument) => {
    setPreviewDocument(document)
  }

  const downloadDoc = async (document: TeamsDocument) => {
    try {
      const blob = await teamsService.downloadDocument(document)
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        a.download = document.name
        window.document.body.appendChild(a)
        a.click()
        window.document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  const getStepDocuments = (stepId: string) => {
    return filteredDocuments.filter(doc => doc.onboardingStep === stepId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      template: 'bg-blue-100 text-blue-800',
      guide: 'bg-green-100 text-green-800',
      checklist: 'bg-yellow-100 text-yellow-800',
      example: 'bg-purple-100 text-purple-800',
      policy: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{selectedRole} Onboarding Progress</h2>
          <span className="text-2xl font-bold text-primary-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{completedSteps} of {steps.length} completed</span>
          <span>Estimated time remaining: {Math.max(0, 10.5 - (completedSteps * 1.75))}h</span>
        </div>
      </div>

      {/* Teams Integration Status - Compact */}
      {isTeamsConnected && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Teams Connected</span>
              <span className="text-sm text-gray-500">({teamsDocuments.length} documents synced)</span>
            </div>
            <button
              onClick={refreshDocuments}
              disabled={isLoadingDocuments}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDocuments ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Document Filters - Only show if connected */}
          {filteredDocuments.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={selectedDocumentType}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Document Types</option>
                    <option value="template">Templates</option>
                    <option value="guide">Guides</option>
                    <option value="checklist">Checklists</option>
                    <option value="example">Examples</option>
                    <option value="policy">Policies</option>
                  </select>
                </div>
                <div>
                  <select
                    value={selectedStep}
                    onChange={(e) => setSelectedStep(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Onboarding Steps</option>
                    {steps.map(step => (
                      <option key={step.id} value={step.id}>{step.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{filteredDocuments.length}</div>
                    <div className="text-sm text-gray-600">Total Documents</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {filteredDocuments.filter(d => d.documentType === 'template').length}
                    </div>
                    <div className="text-sm text-gray-600">Templates</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredDocuments.filter(d => d.documentType === 'guide').length}
                    </div>
                    <div className="text-sm text-gray-600">Guides</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {filteredDocuments.filter(d => d.onboardingStep).length}
                    </div>
                    <div className="text-sm text-gray-600">Step-Mapped</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onboarding Steps */}
      {steps.map((step, index) => {
        const IconComponent = categoryIcons[step.category]
        const isExpanded = expandedStep === step.id
        const stepDocuments = getStepDocuments(step.id)
        
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card transition-all duration-200 ${
              step.completed 
                ? 'bg-green-50 border-green-200 shadow-glow' 
                : 'hover:shadow-lg hover:border-primary-200'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                step.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <IconComponent className="w-6 h-6 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-semibold ${
                    step.completed ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[step.category]}`}>
                      {step.category}
                    </span>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{step.duration}</span>
                    </div>
                    {stepDocuments.length > 0 && (
                      <div className="flex items-center text-blue-600">
                        <FileText className="w-4 h-4 mr-1" />
                        <span className="text-sm">{stepDocuments.length}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className={`mb-3 ${
                  step.completed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      step.completed
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                    }`}
                  >
                    {step.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                  
                  {(step.details || step.detailsWithLinks || stepDocuments.length > 0) && (
                    <button
                      onClick={() => toggleExpanded(step.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-4"
                    >
                      {(step.details || step.detailsWithLinks) && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                          <ul className="space-y-2">
                            {step.detailsWithLinks ? (
                              step.detailsWithLinks.map((detail, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                                  {detail.link ? (
                                    <a
                                      href={detail.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                      {detail.text}
                                    </a>
                                  ) : (
                                    <span className="text-gray-700">{detail.text}</span>
                                  )}
                                </li>
                              ))
                            ) : (
                              step.details?.map((detail, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-gray-700">{detail}</span>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Related Documents */}
                      {stepDocuments.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-3">Related Documents ({stepDocuments.length}):</h4>
                          <div className="space-y-3">
                            {stepDocuments.slice(0, 5).map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-medium text-gray-900">{doc.name}</h5>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(doc.documentType)}`}>
                                      {doc.documentType}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>{doc.author}</span>
                                    <span>{formatFileSize(doc.size)}</span>
                                    <span>Score: {doc.relevanceScore}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => previewDoc(doc)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Preview"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => downloadDoc(doc)}
                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {stepDocuments.length > 5 && (
                              <div className="text-center">
                                <span className="text-sm text-gray-500">
                                  +{stepDocuments.length - 5} more documents
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{previewDocument.name}</h3>
                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{previewDocument.author}</span>
                  <span>{formatFileSize(previewDocument.size)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(previewDocument.documentType)}`}>
                    {previewDocument.documentType}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Document preview not available</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => window.open(previewDocument.webUrl, '_blank')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Open in Teams</span>
                    </button>
                    <button
                      onClick={() => downloadDoc(previewDocument)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
