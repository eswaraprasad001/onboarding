export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  duration: string
  category: 'access' | 'learning' | 'practice' | 'assessment' | 'tools'
  details?: string[]
  detailsWithLinks?: Array<{
    text: string
    link?: string
  }>
  requiredDocuments?: string[]
  teamsChannels?: string[]
  documentTags?: string[]
  roleSpecific?: {
    BA?: {
      title?: string
      description?: string
      details?: string[]
      detailsWithLinks?: Array<{
        text: string
        link?: string
      }>
      requiredDocuments?: string[]
    }
    SO?: {
      title?: string
      description?: string
      details?: string[]
      detailsWithLinks?: Array<{
        text: string
        link?: string
      }>
      requiredDocuments?: string[]
    }
  }
}

export interface OnboardingConfig {
  commonSteps: OnboardingStep[]
  roleSpecificSteps: {
    BA: OnboardingStep[]
    SO: OnboardingStep[]
  }
}

// Unified onboarding framework that works for both roles
export const onboardingConfig: OnboardingConfig = {
  commonSteps: [
    {
      id: 'access-setup',
      title: 'System Access & Setup',
      description: 'Complete all required access requests and system configurations',
      completed: false,
      duration: '60 min',
      category: 'access',
      teamsChannels: ['General', 'IT Support'],
      documentTags: ['access-request', 'system-setup', 'credentials'],
      requiredDocuments: [
        'Access Request Form',
        'System Setup Checklist',
        'Security Guidelines'
      ],
      roleSpecific: {
        BA: {
          detailsWithLinks: [
            { text: 'Changepoint Access', link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Changepoint.pdf?csf=1&web=1&e=L7fLDa' },
            { text: 'Jira Access for requirements tracking' },
            { text: 'Confluence Access for documentation' },
            { text: 'Teams Access (BA Practice Channel)' },
            { text: 'VPN Setup for remote access' },
            { text: 'Sharepoint Access for document management' }
          ]
        },
        SO: {
          detailsWithLinks: [
            { text: 'Changepoint Access', link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Changepoint.pdf?csf=1&web=1&e=L7fLDa' },
            { text: 'LucidChart Access', link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20LucidChart.pdf?csf=1&web=1&e=R5P3uE' },
            { text: 'Setup Teams Audio Conferencing', link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Teams%20Audio%20Conferencing.pdf?csf=1&web=1&e=xHK4Sg' },
            { text: 'Presidio Confluence Access', link: 'https://presidio.sharepoint.com/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Confluence.pdf' },
            { text: 'Presidio JIRA Access', link: 'https://presidio.sharepoint.com/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20JIRA.pdf' },
            { text: 'IT Support (ServiceNow)', link: 'https://presidiocorp.service-now.com/sp?id=p_index' }
          ]
        }
      }
    },
    {
      id: 'role-introduction',
      title: 'Role Introduction & Expectations',
      description: 'Understanding role responsibilities, expectations, and core principles',
      completed: false,
      duration: '90 min',
      category: 'learning',
      teamsChannels: ['Practice Channel', 'Onboarding'],
      documentTags: ['role-overview', 'responsibilities', 'expectations'],
      requiredDocuments: [
        'Role Overview Document',
        'Competency Framework',
        'Performance Expectations'
      ],
      roleSpecific: {
        BA: {
          details: [
            'BA Role Overview and Responsibilities',
            'Requirements Gathering Methodologies',
            'Stakeholder Management Principles',
            'Documentation Standards and Templates',
            'Quality Assurance and Review Processes'
          ]
        },
        SO: {
          detailsWithLinks: [
            { text: 'Solution Owner Overview with Team Lead' },
            { text: 'Core Principles: Deliver Client Value, Grow Business, Lead with Excellence', link: 'https://presidio.sharepoint.com/:w:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/Solution_Ownership_Core%20Principles_Rev00.docx?d=w3b96add577d84688848dff2bd4226443&csf=1&web=1&e=Sz80DQ' },
            { text: 'SO vs PO, PM, Scrum Master, Technical Liaison differentiation' },
            { text: 'Statement of Work Examples (T&M, Fixed Fee, PODs)' },
            { text: 'Understanding the Three-Tier SO Structure (ASO, SO, SSO)' }
          ]
        }
      }
    },
    {
      id: 'process-overview',
      title: 'Process & Methodology Overview',
      description: 'Learn discovery to delivery workflow and methodologies',
      completed: false,
      duration: '120 min',
      category: 'learning',
      teamsChannels: ['Process Documentation', 'Best Practices'],
      documentTags: ['process', 'methodology', 'workflow', 'agile'],
      requiredDocuments: [
        'Process Flow Diagrams',
        'Methodology Guidelines',
        'Workflow Templates'
      ],
      roleSpecific: {
        BA: {
          details: [
            'Requirements Discovery Process',
            'Analysis and Documentation Workflow',
            'Stakeholder Engagement Framework',
            'Change Management Process',
            'Quality Gates and Review Cycles'
          ]
        },
        SO: {
          details: [
            'Solution Design Process',
            'Technical Architecture Review',
            'Delivery Planning and Execution',
            'Risk Management Framework',
            'Client Communication Protocols'
          ]
        }
      }
    },
    {
      id: 'templates-resources',
      title: 'Templates & Resource Library',
      description: 'Explore templates, case studies, and delivery frameworks',
      completed: false,
      duration: '75 min',
      category: 'practice',
      teamsChannels: ['Template Library', 'Case Studies'],
      documentTags: ['templates', 'case-studies', 'examples', 'frameworks'],
      requiredDocuments: [
        'Template Library Index',
        'Case Study Collection',
        'Best Practice Examples'
      ],
      roleSpecific: {
        BA: {
          details: [
            'BRD and PRD Templates',
            'Requirements Traceability Matrix',
            'Stakeholder Analysis Templates',
            'Process Mapping Examples',
            'User Story and Acceptance Criteria Templates'
          ]
        },
        SO: {
          details: [
            'Review Case Studies (Allied, Ardent Mills, Bank United, etc.)',
            'Explore Delivery Templates and Samples',
            'Kickoff Deck Examples',
            'Requirements Documentation Samples',
            'Status Report and SteerCo Templates',
            'Timeline and Roadmap Samples',
            'Financial Tracker Templates'
          ]
        }
      }
    },
    {
      id: 'practical-application',
      title: 'Practical Application & Shadowing',
      description: 'Apply knowledge through assignments and shadow experienced team members',
      completed: false,
      duration: '180 min',
      category: 'practice',
      teamsChannels: ['Mentorship', 'Project Teams'],
      documentTags: ['assignment', 'shadowing', 'mentorship', 'practice'],
      requiredDocuments: [
        'Practice Assignment Brief',
        'Shadowing Schedule',
        'Mentor Assignment'
      ],
      roleSpecific: {
        BA: {
          details: [
            'Complete sample requirements document',
            'Shadow senior BA on client calls',
            'Practice stakeholder interview techniques',
            'Review and provide feedback on existing documentation',
            'Participate in requirements review sessions'
          ]
        },
        SO: {
          detailsWithLinks: [
            { text: 'Create Presidio Profile (regular template or Insights)' },
            { text: 'Review Latest Presidio Org Chart' },
            { text: 'Shadow Team Assignments with Team Lead' },
            { text: 'Schedule 1:1 Sessions with Team Lead' },
            { text: 'Add PTO to SO PTO Calendar' },
            { text: 'Review "The Five Jobs You Have as a Solution Owner" article', link: 'https://codaglobal.atlassian.net/wiki/spaces/SOH/pages/6767116377/The+Five+Jobs+You+have+as+a+Solution+Owner' }
          ]
        }
      }
    },
    {
      id: 'competency-assessment',
      title: 'Knowledge & Competency Assessment',
      description: 'Validate understanding through structured assessment and scenarios',
      completed: false,
      duration: '90 min',
      category: 'assessment',
      teamsChannels: ['Assessment', 'Feedback'],
      documentTags: ['assessment', 'competency', 'evaluation', 'certification'],
      requiredDocuments: [
        'Competency Assessment Framework',
        'Scenario-Based Questions',
        'Evaluation Rubric'
      ],
      roleSpecific: {
        BA: {
          details: [
            'Requirements Analysis Scenarios',
            'Stakeholder Management Situations',
            'Process Improvement Cases',
            'Documentation Quality Review',
            'Communication and Presentation Skills'
          ]
        },
        SO: {
          details: [
            'Business and Customer Focus Assessment',
            'Technical Acumen Evaluation',
            'Agile and Scrum Practices Review',
            'Leadership and Team Management Scenarios',
            'Communication and Collaboration Skills',
            'Strategic Planning and Roadmapping Exercise'
          ]
        }
      }
    }
  ],
  roleSpecificSteps: {
    BA: [],
    SO: []
  }
}

export const categoryColors = {
  access: 'bg-red-100 text-red-800',
  learning: 'bg-green-100 text-green-800',
  practice: 'bg-yellow-100 text-yellow-800',
  assessment: 'bg-purple-100 text-purple-800',
  tools: 'bg-blue-100 text-blue-800'
}

export const categoryIcons = {
  access: 'Shield',
  learning: 'BookOpen',
  practice: 'Target',
  assessment: 'Award',
  tools: 'Settings'
}
