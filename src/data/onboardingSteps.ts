import { OnboardingStep, SubTask } from '@/types';

export type StepCategory = 'access' | 'learning' | 'practice' | 'assessment' | 'tools';

export const categoryColors: Record<StepCategory, string> = {
  access: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  learning: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  practice: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  assessment: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  tools: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
};

export const categoryIcons: Record<StepCategory, string> = {
  access: 'Shield',
  learning: 'BookOpen',
  practice: 'Target',
  assessment: 'Award',
  tools: 'Settings',
};

const baSteps: OnboardingStep[] = [
  {
    id: 'access-setup',
    title: 'System Access & Setup',
    description: 'Complete all required access requests and system configurations',
    status: 'not_started',
    duration: '60 min',
    category: 'access',
    subTasks: [
      {
        id: 'access-setup-ba-0',
        title: 'Changepoint Access',
        completed: false,
        link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Changepoint.pdf?csf=1&web=1&e=L7fLDa',
      },
      {
        id: 'access-setup-ba-1',
        title: 'Jira Access for requirements tracking',
        completed: false,
      },
      {
        id: 'access-setup-ba-2',
        title: 'Confluence Access for documentation',
        completed: false,
      },
      {
        id: 'access-setup-ba-3',
        title: 'Teams Access (BA Practice Channel)',
        completed: false,
      },
      {
        id: 'access-setup-ba-4',
        title: 'VPN Setup for remote access',
        completed: false,
      },
      {
        id: 'access-setup-ba-5',
        title: 'Sharepoint Access for document management',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Access Request Form',
      'System Setup Checklist',
      'Security Guidelines',
    ],
    teamsChannels: ['General', 'IT Support'],
    documentTags: ['access-request', 'system-setup', 'credentials'],
  },
  {
    id: 'role-introduction',
    title: 'Role Introduction & Expectations',
    description: 'Understanding role responsibilities, expectations, and core principles',
    status: 'not_started',
    duration: '90 min',
    category: 'learning',
    subTasks: [
      {
        id: 'role-introduction-ba-0',
        title: 'BA Role Overview and Responsibilities',
        completed: false,
      },
      {
        id: 'role-introduction-ba-1',
        title: 'Requirements Gathering Methodologies',
        completed: false,
      },
      {
        id: 'role-introduction-ba-2',
        title: 'Stakeholder Management Principles',
        completed: false,
      },
      {
        id: 'role-introduction-ba-3',
        title: 'Documentation Standards and Templates',
        completed: false,
      },
      {
        id: 'role-introduction-ba-4',
        title: 'Quality Assurance and Review Processes',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Role Overview Document',
      'Competency Framework',
      'Performance Expectations',
    ],
    teamsChannels: ['Practice Channel', 'Onboarding'],
    documentTags: ['role-overview', 'responsibilities', 'expectations'],
  },
  {
    id: 'process-overview',
    title: 'Process & Methodology Overview',
    description: 'Learn discovery to delivery workflow and methodologies',
    status: 'not_started',
    duration: '120 min',
    category: 'learning',
    subTasks: [
      {
        id: 'process-overview-ba-0',
        title: 'Requirements Discovery Process',
        completed: false,
      },
      {
        id: 'process-overview-ba-1',
        title: 'Analysis and Documentation Workflow',
        completed: false,
      },
      {
        id: 'process-overview-ba-2',
        title: 'Stakeholder Engagement Framework',
        completed: false,
      },
      {
        id: 'process-overview-ba-3',
        title: 'Change Management Process',
        completed: false,
      },
      {
        id: 'process-overview-ba-4',
        title: 'Quality Gates and Review Cycles',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Process Flow Diagrams',
      'Methodology Guidelines',
      'Workflow Templates',
    ],
    teamsChannels: ['Process Documentation', 'Best Practices'],
    documentTags: ['process', 'methodology', 'workflow', 'agile'],
  },
  {
    id: 'templates-resources',
    title: 'Templates & Resource Library',
    description: 'Explore the Template Library to review starter resources for kickoff, planning, governance, delivery, and closeout.',
    status: 'not_started',
    duration: '75 min',
    category: 'practice',
    subTasks: [
      {
        id: 'templates-resources-ba-0',
        title: 'Open the Template Library and review the onboarding recommendations',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-ba-1',
        title: 'Preview starter resources to understand when each artifact should be used',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-ba-2',
        title: 'Explore resources for kickoff, planning, governance, delivery, and closeout',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-ba-3',
        title: 'Download the artifacts most relevant to your current engagement',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-ba-4',
        title: 'Favorite or save the resources you expect to reuse regularly',
        completed: false,
        link: '/app/templates',
      },
    ],
    requiredDocuments: [
      'Template Library Index',
      'Case Study Collection',
      'Best Practice Examples',
    ],
    teamsChannels: ['Template Library', 'Case Studies'],
    documentTags: ['templates', 'case-studies', 'examples', 'frameworks'],
  },
  {
    id: 'practical-application',
    title: 'Practical Application & Shadowing',
    description: 'Apply knowledge through assignments and shadow experienced team members',
    status: 'not_started',
    duration: '180 min',
    category: 'practice',
    subTasks: [
      {
        id: 'practical-application-ba-0',
        title: 'Complete sample requirements document',
        completed: false,
      },
      {
        id: 'practical-application-ba-1',
        title: 'Shadow senior BA on client calls',
        completed: false,
      },
      {
        id: 'practical-application-ba-2',
        title: 'Practice stakeholder interview techniques',
        completed: false,
      },
      {
        id: 'practical-application-ba-3',
        title: 'Review and provide feedback on existing documentation',
        completed: false,
      },
      {
        id: 'practical-application-ba-4',
        title: 'Participate in requirements review sessions',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Practice Assignment Brief',
      'Shadowing Schedule',
      'Mentor Assignment',
    ],
    teamsChannels: ['Mentorship', 'Project Teams'],
    documentTags: ['assignment', 'shadowing', 'mentorship', 'practice'],
  },
  {
    id: 'competency-assessment',
    title: 'Knowledge & Competency Assessment',
    description: 'Validate understanding through structured assessment and scenarios',
    status: 'not_started',
    duration: '90 min',
    category: 'assessment',
    subTasks: [
      {
        id: 'competency-assessment-ba-0',
        title: 'Requirements Analysis Scenarios',
        completed: false,
      },
      {
        id: 'competency-assessment-ba-1',
        title: 'Stakeholder Management Situations',
        completed: false,
      },
      {
        id: 'competency-assessment-ba-2',
        title: 'Process Improvement Cases',
        completed: false,
      },
      {
        id: 'competency-assessment-ba-3',
        title: 'Documentation Quality Review',
        completed: false,
      },
      {
        id: 'competency-assessment-ba-4',
        title: 'Communication and Presentation Skills',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Competency Assessment Framework',
      'Scenario-Based Questions',
      'Evaluation Rubric',
    ],
    teamsChannels: ['Assessment', 'Feedback'],
    documentTags: ['assessment', 'competency', 'evaluation', 'certification'],
  },
];

const soSteps: OnboardingStep[] = [
  {
    id: 'access-setup',
    title: 'System Access & Setup',
    description: 'Complete all required access requests and system configurations',
    status: 'not_started',
    duration: '60 min',
    category: 'access',
    subTasks: [
      {
        id: 'access-setup-so-0',
        title: 'Changepoint Access',
        completed: false,
        link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Changepoint.pdf?csf=1&web=1&e=L7fLDa',
      },
      {
        id: 'access-setup-so-1',
        title: 'LucidChart Access',
        completed: false,
        link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20LucidChart.pdf?csf=1&web=1&e=R5P3uE',
      },
      {
        id: 'access-setup-so-2',
        title: 'Setup Teams Audio Conferencing',
        completed: false,
        link: 'https://presidio.sharepoint.com/:b:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Teams%20Audio%20Conferencing.pdf?csf=1&web=1&e=xHK4Sg',
      },
      {
        id: 'access-setup-so-3',
        title: 'Presidio Confluence Access',
        completed: false,
        link: 'https://presidio.sharepoint.com/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20Confluence.pdf',
      },
      {
        id: 'access-setup-so-4',
        title: 'Presidio JIRA Access',
        completed: false,
        link: 'https://presidio.sharepoint.com/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/SOP%20-%20JIRA.pdf',
      },
      {
        id: 'access-setup-so-5',
        title: 'IT Support (ServiceNow)',
        completed: false,
        link: 'https://presidiocorp.service-now.com/sp?id=p_index',
      },
    ],
    requiredDocuments: [
      'Access Request Form',
      'System Setup Checklist',
      'Security Guidelines',
    ],
    teamsChannels: ['General', 'IT Support'],
    documentTags: ['access-request', 'system-setup', 'credentials'],
  },
  {
    id: 'role-introduction',
    title: 'Role Introduction & Expectations',
    description: 'Understanding role responsibilities, expectations, and core principles',
    status: 'not_started',
    duration: '90 min',
    category: 'learning',
    subTasks: [
      {
        id: 'role-introduction-so-0',
        title: 'Solution Owner Overview with Team Lead',
        completed: false,
      },
      {
        id: 'role-introduction-so-1',
        title: 'Core Principles: Deliver Client Value, Grow Business, Lead with Excellence',
        completed: false,
        link: 'https://presidio.sharepoint.com/:w:/r/teams/365-team-digital-delivery/Shared%20Documents/SO/Solution%20Team%20Internal%20Documents/Training/Onboarding/Solution_Ownership_Core%20Principles_Rev00.docx?d=w3b96add577d84688848dff2bd4226443&csf=1&web=1&e=Sz80DQ',
      },
      {
        id: 'role-introduction-so-2',
        title: 'SO vs PO, PM, Scrum Master, Technical Liaison differentiation',
        completed: false,
      },
      {
        id: 'role-introduction-so-3',
        title: 'Statement of Work Examples (T&M, Fixed Fee, PODs)',
        completed: false,
      },
      {
        id: 'role-introduction-so-4',
        title: 'Understanding the Three-Tier SO Structure (ASO, SO, SSO)',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Role Overview Document',
      'Competency Framework',
      'Performance Expectations',
    ],
    teamsChannels: ['Practice Channel', 'Onboarding'],
    documentTags: ['role-overview', 'responsibilities', 'expectations'],
  },
  {
    id: 'process-overview',
    title: 'Process & Methodology Overview',
    description: 'Learn discovery to delivery workflow and methodologies',
    status: 'not_started',
    duration: '120 min',
    category: 'learning',
    subTasks: [
      {
        id: 'process-overview-so-0',
        title: 'Solution Design Process',
        completed: false,
      },
      {
        id: 'process-overview-so-1',
        title: 'Technical Architecture Review',
        completed: false,
      },
      {
        id: 'process-overview-so-2',
        title: 'Delivery Planning and Execution',
        completed: false,
      },
      {
        id: 'process-overview-so-3',
        title: 'Risk Management Framework',
        completed: false,
      },
      {
        id: 'process-overview-so-4',
        title: 'Client Communication Protocols',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Process Flow Diagrams',
      'Methodology Guidelines',
      'Workflow Templates',
    ],
    teamsChannels: ['Process Documentation', 'Best Practices'],
    documentTags: ['process', 'methodology', 'workflow', 'agile'],
  },
  {
    id: 'templates-resources',
    title: 'Templates & Resource Library',
    description: 'Explore the Template Library to review starter resources for kickoff, planning, governance, delivery, and closeout.',
    status: 'not_started',
    duration: '75 min',
    category: 'practice',
    subTasks: [
      {
        id: 'templates-resources-so-0',
        title: 'Open the Template Library and review the onboarding recommendations',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-so-1',
        title: 'Preview starter resources to understand when each artifact should be used',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-so-2',
        title: 'Explore resources for kickoff, planning, governance, delivery, and closeout',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-so-3',
        title: 'Download the artifacts most relevant to your current engagement',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-so-4',
        title: 'Use Preview to compare artifacts before opening the source materials',
        completed: false,
        link: '/app/templates',
      },
      {
        id: 'templates-resources-so-5',
        title: 'Favorite or save the resources you expect to reuse regularly',
        completed: false,
        link: '/app/templates',
      },
    ],
    requiredDocuments: [
      'Template Library Index',
      'Case Study Collection',
      'Best Practice Examples',
    ],
    teamsChannels: ['Template Library', 'Case Studies'],
    documentTags: ['templates', 'case-studies', 'examples', 'frameworks'],
  },
  {
    id: 'practical-application',
    title: 'Practical Application & Shadowing',
    description: 'Apply knowledge through assignments and shadow experienced team members',
    status: 'not_started',
    duration: '180 min',
    category: 'practice',
    subTasks: [
      {
        id: 'practical-application-so-0',
        title: 'Create Presidio Profile (regular template or Insights)',
        completed: false,
      },
      {
        id: 'practical-application-so-1',
        title: 'Review Latest Presidio Org Chart',
        completed: false,
      },
      {
        id: 'practical-application-so-2',
        title: 'Shadow Team Assignments with Team Lead',
        completed: false,
      },
      {
        id: 'practical-application-so-3',
        title: 'Schedule 1:1 Sessions with Team Lead',
        completed: false,
      },
      {
        id: 'practical-application-so-4',
        title: 'Add PTO to SO PTO Calendar',
        completed: false,
      },
      {
        id: 'practical-application-so-5',
        title: 'Review "The Five Jobs You Have as a Solution Owner" article',
        completed: false,
        link: 'https://codaglobal.atlassian.net/wiki/spaces/SOH/pages/6767116377/The+Five+Jobs+You+have+as+a+Solution+Owner',
      },
    ],
    requiredDocuments: [
      'Practice Assignment Brief',
      'Shadowing Schedule',
      'Mentor Assignment',
    ],
    teamsChannels: ['Mentorship', 'Project Teams'],
    documentTags: ['assignment', 'shadowing', 'mentorship', 'practice'],
  },
  {
    id: 'competency-assessment',
    title: 'Knowledge & Competency Assessment',
    description: 'Validate understanding through structured assessment and scenarios',
    status: 'not_started',
    duration: '90 min',
    category: 'assessment',
    subTasks: [
      {
        id: 'competency-assessment-so-0',
        title: 'Business and Customer Focus Assessment',
        completed: false,
      },
      {
        id: 'competency-assessment-so-1',
        title: 'Technical Acumen Evaluation',
        completed: false,
      },
      {
        id: 'competency-assessment-so-2',
        title: 'Agile and Scrum Practices Review',
        completed: false,
      },
      {
        id: 'competency-assessment-so-3',
        title: 'Leadership and Team Management Scenarios',
        completed: false,
      },
      {
        id: 'competency-assessment-so-4',
        title: 'Communication and Collaboration Skills',
        completed: false,
      },
      {
        id: 'competency-assessment-so-5',
        title: 'Strategic Planning and Roadmapping Exercise',
        completed: false,
      },
    ],
    requiredDocuments: [
      'Competency Assessment Framework',
      'Scenario-Based Questions',
      'Evaluation Rubric',
    ],
    teamsChannels: ['Assessment', 'Feedback'],
    documentTags: ['assessment', 'competency', 'evaluation', 'certification'],
  },
];

export function getStepsForRole(role: 'BA' | 'SO'): OnboardingStep[] {
  return role === 'BA' ? baSteps : soSteps;
}
