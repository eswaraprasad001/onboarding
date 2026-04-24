import { PublicClientApplication, Configuration, AuthenticationResult, InteractionType } from '@azure/msal-browser'
import { Client } from '@microsoft/microsoft-graph-client'
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser'

// MS Teams/Graph API configuration
const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || 'your-client-id',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
}

const graphScopes = [
  'https://graph.microsoft.com/Files.Read.All',
  'https://graph.microsoft.com/Sites.Read.All',
  'https://graph.microsoft.com/Group.Read.All',
  'https://graph.microsoft.com/Channel.ReadBasic.All'
]

export interface TeamsDocument {
  id: string
  name: string
  webUrl: string
  downloadUrl: string
  lastModified: string
  size: number
  mimeType: string
  tags: string[]
  onboardingStep?: string
  relevanceScore: number
  channel: string
  author: string
  description?: string
  documentType: 'template' | 'guide' | 'checklist' | 'example' | 'policy' | 'other'
}

export interface TeamsChannel {
  id: string
  displayName: string
  description?: string
  webUrl: string
}

class TeamsService {
  private msalInstance: PublicClientApplication | null = null
  private graphClient: Client | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.msalInstance = new PublicClientApplication(msalConfig)
      this.initialize()
    }
  }

  private async initialize() {
    if (this.isInitialized || !this.msalInstance) return
    
    try {
      await this.msalInstance.initialize()
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize MSAL:', error)
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      if (!this.msalInstance) return false
      
      await this.initialize()
      
      // Try silent authentication first
      const accounts = this.msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        const silentRequest = {
          scopes: graphScopes,
          account: accounts[0]
        }
        
        try {
          const response = await this.msalInstance.acquireTokenSilent(silentRequest)
          this.setupGraphClient(response.accessToken)
          return true
        } catch (silentError) {
          console.log('Silent authentication failed, trying interactive')
        }
      }

      // Interactive authentication
      const response = await this.msalInstance.acquireTokenPopup({
        scopes: graphScopes
      })
      
      this.setupGraphClient(response.accessToken)
      return true
    } catch (error) {
      console.error('Authentication failed:', error)
      return false
    }
  }

  private setupGraphClient(accessToken: string) {
    if (!this.msalInstance) return
    
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalInstance,
      {
        account: this.msalInstance.getAllAccounts()[0],
        scopes: graphScopes,
        interactionType: InteractionType.Popup
      }
    )

    this.graphClient = Client.initWithMiddleware({ authProvider })
  }

  async getTeamsChannels(teamId?: string): Promise<TeamsChannel[]> {
    if (!this.graphClient) {
      throw new Error('Not authenticated')
    }

    try {
      // If no specific team ID, get all teams the user is a member of
      const teamsResponse = teamId 
        ? await this.graphClient.api(`/teams/${teamId}/channels`).get()
        : await this.graphClient.api('/me/joinedTeams').get()

      if (teamId) {
        return teamsResponse.value.map((channel: any) => ({
          id: channel.id,
          displayName: channel.displayName,
          description: channel.description,
          webUrl: channel.webUrl
        }))
      } else {
        // Get channels for each team
        const allChannels: TeamsChannel[] = []
        for (const team of teamsResponse.value) {
          const channelsResponse = await this.graphClient.api(`/teams/${team.id}/channels`).get()
          const teamChannels = channelsResponse.value.map((channel: any) => ({
            id: channel.id,
            displayName: `${team.displayName} - ${channel.displayName}`,
            description: channel.description,
            webUrl: channel.webUrl
          }))
          allChannels.push(...teamChannels)
        }
        return allChannels
      }
    } catch (error) {
      console.error('Failed to get Teams channels:', error)
      return []
    }
  }

  async getChannelDocuments(teamId: string, channelId: string): Promise<TeamsDocument[]> {
    if (!this.graphClient) {
      throw new Error('Not authenticated')
    }

    try {
      // Get the SharePoint site associated with the team
      const driveResponse = await this.graphClient
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder`)
        .get()

      const filesResponse = await this.graphClient
        .api(`/drives/${driveResponse.parentReference.driveId}/items/${driveResponse.id}/children`)
        .expand('thumbnails')
        .get()

      const documents: TeamsDocument[] = []

      for (const file of filesResponse.value) {
        if (file.file) { // Only process files, not folders
          const document = await this.processDocument(file, teamId, channelId)
          documents.push(document)
        }
      }

      return documents.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } catch (error) {
      console.error('Failed to get channel documents:', error)
      return []
    }
  }

  private async processDocument(file: any, teamId: string, channelId: string): Promise<TeamsDocument> {
    // Extract document information
    const document: TeamsDocument = {
      id: file.id,
      name: file.name,
      webUrl: file.webUrl,
      downloadUrl: file['@microsoft.graph.downloadUrl'] || file.webUrl,
      lastModified: file.lastModifiedDateTime,
      size: file.size,
      mimeType: file.file.mimeType,
      tags: [],
      relevanceScore: 0,
      channel: channelId,
      author: file.lastModifiedBy?.user?.displayName || 'Unknown',
      documentType: 'other'
    }

    // Analyze document for onboarding relevance
    await this.analyzeDocumentRelevance(document)
    
    return document
  }

  private async analyzeDocumentRelevance(document: TeamsDocument): Promise<void> {
    const fileName = document.name.toLowerCase()
    const fileExtension = fileName.split('.').pop() || ''
    
    // Document type classification
    if (fileName.includes('template') || fileName.includes('sample')) {
      document.documentType = 'template'
      document.relevanceScore += 30
    } else if (fileName.includes('guide') || fileName.includes('manual') || fileName.includes('how-to')) {
      document.documentType = 'guide'
      document.relevanceScore += 25
    } else if (fileName.includes('checklist') || fileName.includes('steps')) {
      document.documentType = 'checklist'
      document.relevanceScore += 20
    } else if (fileName.includes('example') || fileName.includes('case-study')) {
      document.documentType = 'example'
      document.relevanceScore += 15
    } else if (fileName.includes('policy') || fileName.includes('procedure')) {
      document.documentType = 'policy'
      document.relevanceScore += 10
    }

    // Onboarding step classification
    const stepKeywords = {
      'access-setup': ['access', 'setup', 'configuration', 'credentials', 'login', 'account'],
      'role-introduction': ['role', 'responsibilities', 'overview', 'introduction', 'expectations'],
      'process-overview': ['process', 'workflow', 'methodology', 'procedure', 'framework'],
      'templates-resources': ['template', 'resource', 'library', 'example', 'sample'],
      'practical-application': ['assignment', 'practice', 'exercise', 'shadowing', 'mentorship'],
      'competency-assessment': ['assessment', 'evaluation', 'test', 'competency', 'certification']
    }

    let maxScore = 0
    let bestMatch = ''

    for (const [stepId, keywords] of Object.entries(stepKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (fileName.includes(keyword) ? 10 : 0)
      }, 0)
      
      if (score > maxScore) {
        maxScore = score
        bestMatch = stepId
      }
    }

    if (bestMatch) {
      document.onboardingStep = bestMatch
      document.relevanceScore += maxScore
    }

    // Role-specific tagging
    const roleTags = {
      'BA': ['business-analyst', 'requirements', 'stakeholder', 'analysis', 'documentation'],
      'SO': ['solution-owner', 'technical', 'architecture', 'delivery', 'coordination']
    }

    for (const [role, keywords] of Object.entries(roleTags)) {
      const roleScore = keywords.reduce((acc, keyword) => {
        return acc + (fileName.includes(keyword) ? 5 : 0)
      }, 0)
      
      if (roleScore > 0) {
        document.tags.push(role.toLowerCase())
        document.relevanceScore += roleScore
      }
    }

    // File type scoring
    const fileTypeScores: { [key: string]: number } = {
      'pdf': 10,
      'docx': 8,
      'doc': 8,
      'pptx': 6,
      'ppt': 6,
      'xlsx': 4,
      'xls': 4,
      'md': 5,
      'txt': 3
    }

    document.relevanceScore += fileTypeScores[fileExtension] || 0

    // Recency scoring (newer documents get higher scores)
    const lastModified = new Date(document.lastModified)
    const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceModified < 30) {
      document.relevanceScore += 10
    } else if (daysSinceModified < 90) {
      document.relevanceScore += 5
    }

    // Generate additional tags based on content analysis
    document.tags.push(document.documentType)
    if (document.onboardingStep) {
      document.tags.push(document.onboardingStep)
    }
  }

  async searchDocuments(query: string, channels?: string[]): Promise<TeamsDocument[]> {
    if (!this.graphClient) {
      throw new Error('Not authenticated')
    }

    try {
      // Use Microsoft Graph search API
      const searchRequest = {
        requests: [{
          entityTypes: ['driveItem'],
          query: {
            queryString: query
          },
          from: 0,
          size: 50
        }]
      }

      const searchResponse = await this.graphClient
        .api('/search/query')
        .post(searchRequest)

      const documents: TeamsDocument[] = []
      
      for (const response of searchResponse.value) {
        for (const hit of response.hitsContainers[0]?.hits || []) {
          const file = hit.resource
          if (file.file) {
            const document = await this.processDocument(file, '', '')
            documents.push(document)
          }
        }
      }

      return documents.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }

  async getDocumentPreview(documentId: string): Promise<string | null> {
    if (!this.graphClient) {
      throw new Error('Not authenticated')
    }

    try {
      const previewResponse = await this.graphClient
        .api(`/drives/items/${documentId}/preview`)
        .post({})

      return previewResponse.getUrl || null
    } catch (error) {
      console.error('Failed to get document preview:', error)
      return null
    }
  }

  async downloadDocument(document: TeamsDocument): Promise<Blob | null> {
    try {
      const response = await fetch(document.downloadUrl)
      if (response.ok) {
        return await response.blob()
      }
      return null
    } catch (error) {
      console.error('Failed to download document:', error)
      return null
    }
  }

  isAuthenticated(): boolean {
    return this.graphClient !== null && this.msalInstance !== null && this.msalInstance.getAllAccounts().length > 0
  }

  async signOut(): Promise<void> {
    try {
      if (this.msalInstance) {
        await this.msalInstance.logoutPopup()
      }
      this.graphClient = null
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }
}

export const teamsService = new TeamsService()
