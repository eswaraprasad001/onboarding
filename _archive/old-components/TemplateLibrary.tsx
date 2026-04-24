'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, Star, Filter, Search, Calendar, User, Building, Users, X } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  category: 'Case Studies' | 'Delivery Templates' | 'Requirements' | 'Status Reports' | 'Kickoff Decks' | 'Financial Trackers' | 'Roadmaps' | 'Training Materials'
  format: 'PowerPoint' | 'Word' | 'Excel' | 'PDF' | 'Video'
  lastUpdated: string
  author: string
  downloads: number
  rating: number
  featured?: boolean
  client?: string
}

const templates: Template[] = [
  // Case Studies from Real SO Projects
  {
    id: '1',
    title: 'Allied Solutions Case Study',
    description: 'Complete case study showcasing solution architecture and delivery approach for Allied Solutions engagement.',
    category: 'Case Studies',
    format: 'PowerPoint',
    lastUpdated: '2025-01-15',
    author: 'SO Practice Team',
    downloads: 89,
    rating: 4.9,
    featured: true,
    client: 'Allied Solutions'
  },
  {
    id: '2',
    title: 'Ardent Mills Executive Briefing',
    description: 'Executive-level briefing template used for Ardent Mills engagement, including HiTouch review format.',
    category: 'Case Studies',
    format: 'PowerPoint',
    lastUpdated: '2025-01-10',
    author: 'SO Practice Team',
    downloads: 67,
    rating: 4.8,
    featured: true,
    client: 'Ardent Mills'
  },
  {
    id: '3',
    title: 'Bank United Case Study',
    description: 'Financial services case study demonstrating digital transformation approach and outcomes.',
    category: 'Case Studies',
    format: 'PowerPoint',
    lastUpdated: '2025-01-08',
    author: 'SO Practice Team',
    downloads: 54,
    rating: 4.7,
    client: 'Bank United'
  },
  {
    id: '4',
    title: 'CP Rail Case Study with Branding',
    description: 'Transportation industry case study showcasing infrastructure modernization and branded presentation approach.',
    category: 'Case Studies',
    format: 'PowerPoint',
    lastUpdated: '2025-01-05',
    author: 'SO Practice Team',
    downloads: 43,
    rating: 4.6,
    client: 'CP Rail'
  },
  {
    id: '5',
    title: 'NHL Apple Watch Project Case Study',
    description: 'Sports technology case study featuring mobile app development and wearable integration.',
    category: 'Case Studies',
    format: 'PowerPoint',
    lastUpdated: '2025-01-03',
    author: 'SO Practice Team',
    downloads: 78,
    rating: 4.8,
    featured: true,
    client: 'NHL'
  },
  {
    id: '6',
    title: 'PGA Tour Innovation Process',
    description: 'Sports industry case study demonstrating innovation process re-engineering and digital transformation.',
    category: 'Case Studies',
    format: 'PowerPoint',
    lastUpdated: '2025-01-01',
    author: 'SO Practice Team',
    downloads: 65,
    rating: 4.7,
    client: 'PGA Tour'
  },

  // Delivery Templates
  {
    id: '7',
    title: 'Presidio Digital Engagement Delivery Templates',
    description: 'Comprehensive collection of delivery templates for digital engagements including project planning and execution.',
    category: 'Delivery Templates',
    format: 'PowerPoint',
    lastUpdated: '2025-01-12',
    author: 'SO Practice Team',
    downloads: 156,
    rating: 4.9,
    featured: true
  },
  {
    id: '8',
    title: 'Solution Summary Template',
    description: 'Standard template for creating solution summaries and project overviews for client presentations.',
    category: 'Delivery Templates',
    format: 'PowerPoint',
    lastUpdated: '2025-01-09',
    author: 'SO Practice Team',
    downloads: 134,
    rating: 4.8
  },
  {
    id: '9',
    title: 'Kickoff Deck Examples',
    description: 'Collection of proven kickoff deck templates used in successful SO engagements.',
    category: 'Kickoff Decks',
    format: 'PowerPoint',
    lastUpdated: '2025-01-07',
    author: 'SO Practice Team',
    downloads: 98,
    rating: 4.7
  },

  // Requirements and Documentation
  {
    id: '10',
    title: 'Requirements Documentation Samples',
    description: 'Real-world examples of requirements documentation from successful SO projects.',
    category: 'Requirements',
    format: 'Word',
    lastUpdated: '2025-01-06',
    author: 'SO Practice Team',
    downloads: 187,
    rating: 4.8,
    featured: true
  },
  {
    id: '11',
    title: 'Stakeholder Mapping Template',
    description: 'Excel template for mapping and analyzing project stakeholders with RACI matrix integration.',
    category: 'Requirements',
    format: 'Excel',
    lastUpdated: '2025-01-04',
    author: 'SO Practice Team',
    downloads: 145,
    rating: 4.6
  },

  // Status Reports and Steering Committee
  {
    id: '12',
    title: 'Status Report and SteerCo Templates',
    description: 'Professional templates for weekly status reports and steering committee presentations.',
    category: 'Status Reports',
    format: 'PowerPoint',
    lastUpdated: '2025-01-11',
    author: 'SO Practice Team',
    downloads: 123,
    rating: 4.7
  },
  {
    id: '13',
    title: 'Weekly Status Report (WSR) Template',
    description: 'Standardized weekly status report format used across SO engagements.',
    category: 'Status Reports',
    format: 'PowerPoint',
    lastUpdated: '2025-01-08',
    author: 'SO Practice Team',
    downloads: 167,
    rating: 4.8
  },

  // Financial and Project Management
  {
    id: '14',
    title: 'Financial Tracker Templates',
    description: 'Excel-based financial tracking templates for budget management and cost analysis.',
    category: 'Financial Trackers',
    format: 'Excel',
    lastUpdated: '2025-01-13',
    author: 'SO Practice Team',
    downloads: 89,
    rating: 4.5
  },
  {
    id: '15',
    title: 'Capacity Planner Template',
    description: 'Resource capacity planning template for team allocation and workload management.',
    category: 'Financial Trackers',
    format: 'Excel',
    lastUpdated: '2025-01-02',
    author: 'SO Practice Team',
    downloads: 76,
    rating: 4.6
  },

  // Roadmaps and Planning
  {
    id: '16',
    title: 'Timeline and Roadmap Samples',
    description: 'Collection of project timeline and roadmap templates from successful engagements.',
    category: 'Roadmaps',
    format: 'PowerPoint',
    lastUpdated: '2025-01-14',
    author: 'SO Practice Team',
    downloads: 112,
    rating: 4.7
  },

  // Training Materials
  {
    id: '17',
    title: 'Solution Owner & Project Coordination Engagement Guide',
    description: 'Comprehensive training guide covering SO responsibilities and project coordination best practices.',
    category: 'Training Materials',
    format: 'PDF',
    lastUpdated: '2025-05-01',
    author: 'SO Practice Team',
    downloads: 234,
    rating: 4.9,
    featured: true
  },
  {
    id: '18',
    title: 'SO & PC Engagement Guide Review',
    description: 'Video walkthrough of the engagement guide covering key SO and PC processes.',
    category: 'Training Materials',
    format: 'Video',
    lastUpdated: '2025-05-01',
    author: 'SO Practice Team',
    downloads: 156,
    rating: 4.8
  },
  {
    id: '19',
    title: 'Solution Owner Practice Overview',
    description: 'High-level overview presentation of the Solution Owner practice and methodology.',
    category: 'Training Materials',
    format: 'PowerPoint',
    lastUpdated: '2025-01-16',
    author: 'SO Practice Team',
    downloads: 198,
    rating: 4.8
  },
  {
    id: '20',
    title: 'What is a Solution Owner',
    description: 'Foundational presentation defining the Solution Owner role and responsibilities.',
    category: 'Training Materials',
    format: 'PowerPoint',
    lastUpdated: '2025-01-15',
    author: 'SO Practice Team',
    downloads: 267,
    rating: 4.9
  }
]

const categoryColors = {
  'Case Studies': 'bg-blue-100 text-blue-800',
  'Delivery Templates': 'bg-green-100 text-green-800',
  'Requirements': 'bg-yellow-100 text-yellow-800',
  'Status Reports': 'bg-purple-100 text-purple-800',
  'Kickoff Decks': 'bg-red-100 text-red-800',
  'Financial Trackers': 'bg-indigo-100 text-indigo-800',
  'Roadmaps': 'bg-pink-100 text-pink-800',
  'Training Materials': 'bg-orange-100 text-orange-800'
}

const formatColors = {
  'Word': 'bg-blue-50 text-blue-700',
  'Excel': 'bg-green-50 text-green-700',
  'PowerPoint': 'bg-orange-50 text-orange-700',
  'PDF': 'bg-red-50 text-red-700',
  'Video': 'bg-purple-50 text-purple-700'
}

export default function TemplateLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [filteredTemplates, setFilteredTemplates] = useState(templates)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const categories = ['all', 'Case Studies', 'Delivery Templates', 'Requirements', 'Status Reports', 'Kickoff Decks', 'Financial Trackers', 'Roadmaps', 'Training Materials']
  const formats = ['all', 'PowerPoint', 'Word', 'Excel', 'PDF', 'Video']

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterTemplates(term, selectedCategory, selectedFormat)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    filterTemplates(searchTerm, category, selectedFormat)
  }

  const handleFormatFilter = (format: string) => {
    setSelectedFormat(format)
    filterTemplates(searchTerm, selectedCategory, format)
  }

  const filterTemplates = (search: string, category: string, format: string) => {
    let filtered = templates

    if (category !== 'all') {
      filtered = filtered.filter(template => template.category === category)
    }

    if (format !== 'all') {
      filtered = filtered.filter(template => template.format === format)
    }

    if (search) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(search.toLowerCase()) ||
        template.description.toLowerCase().includes(search.toLowerCase()) ||
        (template.client && template.client.toLowerCase().includes(search.toLowerCase()))
      )
    }

    setFilteredTemplates(filtered)
  }

  const featuredTemplates = templates.filter(template => template.featured)

  const getSampleContent = (template: Template) => {
    const sampleContent: { [key: string]: string } = {
      '1': `# Allied Solutions Case Study

## Executive Summary
Allied Solutions partnered with Presidio to modernize their legacy systems and implement a cloud-first architecture.

## Challenge
- Legacy infrastructure limiting scalability
- Manual processes causing delays
- Need for real-time data analytics

## Solution Approach
- Cloud migration strategy using AWS
- Microservices architecture implementation
- DevOps pipeline automation
- Real-time analytics dashboard

## Key Deliverables
- Infrastructure assessment and roadmap
- Cloud migration plan
- Security framework implementation
- Training and knowledge transfer

## Results
- 40% reduction in operational costs
- 60% improvement in deployment speed
- Enhanced security posture
- Improved customer satisfaction scores`,

      '2': `# Ardent Mills Executive Briefing

## Project Overview
Digital transformation initiative to modernize Ardent Mills' supply chain and operations systems.

## Business Objectives
- Streamline supply chain operations
- Improve inventory management
- Enhance customer experience
- Reduce operational costs

## Technical Architecture
- Cloud-native platform on Azure
- IoT integration for real-time monitoring
- AI/ML for predictive analytics
- Mobile-first user experience

## Implementation Timeline
- Phase 1: Infrastructure setup (3 months)
- Phase 2: Core system migration (6 months)
- Phase 3: Advanced analytics (3 months)
- Phase 4: Optimization and training (2 months)

## Expected Outcomes
- 25% reduction in supply chain costs
- 50% improvement in inventory accuracy
- Enhanced customer satisfaction
- Improved operational efficiency`,

      '17': `# Solution Owner & Project Coordination Engagement Guide

## Table of Contents
1. Solution Owner Role Definition
2. Core Responsibilities
3. Engagement Lifecycle
4. Best Practices
5. Templates and Tools

## 1. Solution Owner Role Definition

The Solution Owner (SO) serves as the primary liaison between business stakeholders and technical delivery teams, ensuring successful project outcomes through strategic collaboration and effective leadership.

### Core Principles
- **Deliver Client Value**: Create meaningful outcomes by aligning solutions to client goals
- **Grow Our Business**: Expand impact through trusted relationships and strategic delivery
- **Lead with Delivery Excellence**: Execute with precision, accountability, and continuous improvement

## 2. Core Responsibilities

### Strategic Leadership
- Define project vision and objectives
- Align stakeholder expectations
- Drive decision-making processes
- Manage project risks and dependencies

### Technical Coordination
- Bridge business and technical requirements
- Oversee solution architecture decisions
- Ensure technical feasibility and scalability
- Coordinate with development teams

### Client Relationship Management
- Maintain regular client communication
- Manage expectations and deliverables
- Facilitate stakeholder meetings
- Ensure client satisfaction

## 3. Engagement Lifecycle

### Discovery Phase
- Stakeholder interviews and analysis
- Requirements gathering and documentation
- Technical assessment and feasibility study
- Project scope and timeline definition

### Planning Phase
- Solution architecture design
- Resource allocation and team formation
- Risk assessment and mitigation planning
- Communication plan development

### Execution Phase
- Sprint planning and backlog management
- Progress monitoring and reporting
- Quality assurance and testing coordination
- Change management and scope control

### Delivery Phase
- Solution deployment and go-live support
- User training and knowledge transfer
- Performance monitoring and optimization
- Project closure and lessons learned

## 4. Best Practices

### Communication
- Establish regular touchpoints with all stakeholders
- Use clear, concise language in all communications
- Document decisions and rationale
- Maintain transparency in project status

### Risk Management
- Identify risks early and often
- Develop mitigation strategies
- Communicate risks to stakeholders
- Monitor and adjust plans as needed

### Quality Assurance
- Define clear acceptance criteria
- Implement continuous testing practices
- Conduct regular code reviews
- Ensure compliance with standards

## 5. Templates and Tools

### Project Management
- Project charter template
- Stakeholder analysis matrix
- Risk register template
- Status report template

### Technical Documentation
- Solution architecture template
- Requirements specification template
- Test plan template
- Deployment guide template

### Communication
- Kickoff presentation template
- Status update template
- Executive briefing template
- Lessons learned template`,

      '19': `# Solution Owner Practice Overview

## What is a Solution Owner?

A Solution Owner is a strategic role that combines technical expertise with business acumen to drive successful project delivery. The SO serves as the primary point of contact between clients and delivery teams.

## Three-Tier Structure

### Associate Solution Owner (ASO)
- **Focus**: Delivers within defined scope
- **Skills**: Understands agile delivery, supports execution
- **Experience**: 2-4 years in delivery roles
- **Responsibilities**: Task execution, team support, documentation

### Solution Owner (SO)
- **Focus**: Leads cross-functional teams
- **Skills**: Aligns to OKRs, mentors team members, owns risk
- **Experience**: 4-8 years with leadership experience
- **Responsibilities**: Project leadership, client management, team coordination

### Senior Solution Owner (SSO)
- **Focus**: Shapes strategy and drives business impact
- **Skills**: Evangelizes delivery excellence, strategic thinking
- **Experience**: 8+ years with proven track record
- **Responsibilities**: Strategic planning, business development, practice leadership

## Core Competencies

### Deliver Client Value
- Translate business problems into technical solutions
- Ensure solutions create measurable value
- Maintain focus on client outcomes
- Drive continuous improvement

### Grow Our Business
- Identify growth opportunities within engagements
- Build lasting trust with clients
- Contribute to account expansion
- Support business development efforts

### Lead with Delivery Excellence
- Manage delivery risk in multi-team environments
- Implement delivery frameworks and best practices
- Ensure product meets business goals and customer needs
- Drive team performance and accountability

## Key Skills and Capabilities

### Technical Skills
- Solution architecture and design
- Agile methodologies (Scrum, Kanban, SAFe)
- Cloud platforms (AWS, Azure, GCP)
- DevOps practices and tools
- Data analytics and reporting

### Business Skills
- Stakeholder management
- Requirements gathering and analysis
- Project management
- Financial planning and budgeting
- Risk assessment and mitigation

### Leadership Skills
- Team building and motivation
- Communication and presentation
- Conflict resolution
- Change management
- Strategic thinking

## Career Development Path

### Entry Level → ASO
- Complete foundational training
- Shadow experienced SOs
- Demonstrate technical competency
- Show ability to work independently

### ASO → SO
- Lead small to medium projects
- Develop client relationship skills
- Demonstrate team leadership
- Show business impact

### SO → SSO
- Drive strategic initiatives
- Mentor other SOs
- Contribute to practice development
- Demonstrate thought leadership

## Success Metrics

### Individual Performance
- Client satisfaction scores
- Project delivery success rate
- Team performance metrics
- Professional development goals

### Business Impact
- Revenue growth from accounts
- New opportunity identification
- Practice capability development
- Knowledge sharing and mentoring`
    }

    return sampleContent[template.id] || `# ${template.title}

## Overview
This is a sample preview of the ${template.title} template.

## Key Features
- Professional formatting and structure
- Industry best practices
- Real-world examples and case studies
- Customizable content sections

## Usage Instructions
1. Download the template
2. Customize with your project details
3. Review and validate content
4. Share with stakeholders

## Additional Resources
- Related templates and tools
- Best practice guidelines
- Training materials
- Support documentation

*This is a demo preview. The full template contains comprehensive content, detailed examples, and professional formatting.*`
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center mb-4">
          <FileText className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">SO Template Library</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Access real Solution Owner templates, case studies, and materials from successful Presidio engagements
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates, case studies, or clients..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Format:</span>
              <select
                value={selectedFormat}
                onChange={(e) => handleFormatFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {formats.map(format => (
                  <option key={format} value={format}>
                    {format === 'all' ? 'All Formats' : format}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && selectedCategory === 'all' && selectedFormat === 'all' && !searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Featured Templates
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[template.category]}`}>
                      {template.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${formatColors[template.format]}`}>
                      {template.format}
                    </span>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{template.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                  {template.title}
                </h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                {template.client && (
                  <div className="flex items-center mb-3 text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-1" />
                    <span className="font-medium">Client: {template.client}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {template.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(template.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <span>{template.downloads} downloads</span>
                </div>
                
                <div className="flex space-x-3">
                  <button className="btn-primary flex items-center space-x-2 flex-1">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button 
                    onClick={() => setSelectedTemplate(template)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-4">
          All Templates
          <span className="text-gray-500 text-lg ml-2">({filteredTemplates.length})</span>
        </h2>
        
        {filteredTemplates.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3 space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[template.category]}`}>
                        {template.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${formatColors[template.format]}`}>
                        {template.format}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{template.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    
                    {template.client && (
                      <div className="flex items-center mb-3 text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-1" />
                        <span className="font-medium">Client: {template.client}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {template.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(template.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                      <span>{template.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    <button className="btn-primary flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button 
                      onClick={() => setSelectedTemplate(template)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTemplate(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedTemplate.title}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedTemplate.category]}`}>
                    {selectedTemplate.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${formatColors[selectedTemplate.format]}`}>
                    {selectedTemplate.format}
                  </span>
                  {selectedTemplate.client && (
                    <span className="text-sm text-gray-600">• {selectedTemplate.client}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                  {getSampleContent(selectedTemplate)}
                </pre>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <span>Last updated: {new Date(selectedTemplate.lastUpdated).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>{selectedTemplate.downloads} downloads</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
