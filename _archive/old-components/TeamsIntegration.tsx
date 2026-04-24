'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Link, RefreshCw } from 'lucide-react'
import { teamsService } from '@/services/teamsService'

interface TeamsIntegrationProps {
  selectedRole: 'BA' | 'SO'
}

export default function TeamsIntegration({ selectedRole }: TeamsIntegrationProps) {
  const [isTeamsConnected, setIsTeamsConnected] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [documentCount, setDocumentCount] = useState(0)

  useEffect(() => {
    // Check if Teams is already connected
    setIsTeamsConnected(teamsService.isAuthenticated())
  }, [])

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
      let allDocuments = 0

      for (const channel of channels) {
        try {
          // Extract team and channel IDs from the channel data
          const teamId = channel.id.split('_')[0] // Simplified extraction
          const documents = await teamsService.getChannelDocuments(teamId, channel.id)
          allDocuments += documents.length
        } catch (error) {
          console.warn(`Failed to load documents from channel ${channel.displayName}:`, error)
        }
      }

      // Also search for onboarding-related documents
      const searchResults = await teamsService.searchDocuments(`${selectedRole} onboarding template guide`)
      allDocuments += searchResults.length

      setDocumentCount(allDocuments)
    } catch (error) {
      console.error('Failed to load Teams documents:', error)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  if (!isTeamsConnected) {
    return (
      <button
        onClick={connectToTeams}
        disabled={isLoadingDocuments}
        className="btn-secondary flex items-center justify-center space-x-2 w-full"
      >
        {isLoadingDocuments ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Link className="w-5 h-5" />
        )}
        <span>{isLoadingDocuments ? 'Connecting...' : 'Connect to Teams'}</span>
      </button>
    )
  }

  return (
    <div className="flex items-center justify-center space-x-2 text-green-600 p-3 bg-green-50 rounded-lg">
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">Teams Connected</span>
      {documentCount > 0 && (
        <span className="text-sm text-gray-500">({documentCount} docs)</span>
      )}
    </div>
  )
}
