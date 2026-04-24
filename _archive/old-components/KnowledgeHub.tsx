'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, Filter, Star, Clock, User, ArrowRight, X } from 'lucide-react'

interface Article {
  id: string
  title: string
  description: string
  category: 'communication' | 'stakeholder' | 'agile' | 'sdlc' | 'tools'
  readTime: string
  author: string
  rating: number
  tags: string[]
  featured?: boolean
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Effective Stakeholder Communication Strategies',
    description: 'Learn how to communicate complex requirements to diverse stakeholders effectively.',
    category: 'communication',
    readTime: '8 min',
    author: 'Sarah Johnson',
    rating: 4.8,
    tags: ['communication', 'stakeholders', 'requirements'],
    featured: true
  },
  {
    id: '2',
    title: 'Agile Requirements Gathering Best Practices',
    description: 'Master the art of gathering requirements in an Agile environment.',
    category: 'agile',
    readTime: '12 min',
    author: 'Mike Chen',
    rating: 4.9,
    tags: ['agile', 'requirements', 'scrum'],
    featured: true
  },
  {
    id: '3',
    title: 'SDLC Phase Management for BAs',
    description: 'Navigate through different phases of software development lifecycle.',
    category: 'sdlc',
    readTime: '15 min',
    author: 'Emily Rodriguez',
    rating: 4.7,
    tags: ['sdlc', 'process', 'management']
  },
  {
    id: '4',
    title: 'Jira for Business Analysts',
    description: 'Complete guide to using Jira effectively for requirement tracking.',
    category: 'tools',
    readTime: '10 min',
    author: 'David Kim',
    rating: 4.6,
    tags: ['jira', 'tools', 'tracking']
  },
  {
    id: '5',
    title: 'Managing Difficult Stakeholders',
    description: 'Strategies for handling challenging stakeholder relationships.',
    category: 'stakeholder',
    readTime: '7 min',
    author: 'Lisa Thompson',
    rating: 4.8,
    tags: ['stakeholders', 'management', 'conflict']
  }
]

const categoryColors = {
  communication: 'bg-blue-100 text-blue-800',
  stakeholder: 'bg-green-100 text-green-800',
  agile: 'bg-yellow-100 text-yellow-800',
  sdlc: 'bg-purple-100 text-purple-800',
  tools: 'bg-red-100 text-red-800'
}

export default function KnowledgeHub() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filteredArticles, setFilteredArticles] = useState(articles)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const categories = ['all', 'communication', 'stakeholder', 'agile', 'sdlc', 'tools']

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterArticles(term, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    filterArticles(searchTerm, category)
  }

  const filterArticles = (search: string, category: string) => {
    let filtered = articles

    if (category !== 'all') {
      filtered = filtered.filter(article => article.category === category)
    }

    if (search) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.description.toLowerCase().includes(search.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    setFilteredArticles(filtered)
  }

  const featuredArticles = articles.filter(article => article.featured)

  const getArticleContent = (article: Article) => {
    const sampleContent: { [key: string]: string } = {
      '1': `# Effective Stakeholder Communication Strategies

## Introduction

Effective stakeholder communication is the cornerstone of successful project delivery. As a Solution Owner or Business Analyst, your ability to communicate complex technical concepts to diverse audiences can make or break your project's success.

## Understanding Your Stakeholders

### Stakeholder Categories

**Executive Stakeholders**
- Focus on business value and ROI
- Prefer high-level summaries with clear outcomes
- Time-constrained, need concise information
- Decision-makers who control project funding

**Technical Stakeholders**
- Interested in implementation details
- Need comprehensive technical specifications
- Value accuracy and completeness
- Concerned with feasibility and architecture

**End Users**
- Focus on usability and functionality
- Need to understand how changes affect their work
- Provide valuable feedback on requirements
- Often resistant to change without proper communication

## Communication Strategies by Stakeholder Type

### For Executives
- **Lead with business value**: Start every communication with the "why"
- **Use visual aids**: Charts, graphs, and dashboards speak volumes
- **Provide executive summaries**: One-page overviews with key decisions needed
- **Focus on outcomes**: What will be achieved, not how it will be done

### For Technical Teams
- **Be specific and detailed**: Provide comprehensive requirements and specifications
- **Use technical language appropriately**: Match their level of expertise
- **Provide context**: Explain the business reasoning behind technical decisions
- **Encourage questions**: Create an environment for technical dialogue

### For End Users
- **Demonstrate benefits**: Show how changes will improve their daily work
- **Use real examples**: Provide scenarios they can relate to
- **Address concerns proactively**: Acknowledge and respond to resistance
- **Provide training roadmaps**: Clear path to competency with new systems

## Best Practices for Effective Communication

### 1. Know Your Audience
- Research stakeholder backgrounds and preferences
- Understand their goals and motivations
- Adapt your communication style accordingly
- Consider cultural and organizational factors

### 2. Be Clear and Concise
- Use simple, jargon-free language when possible
- Structure information logically
- Provide clear action items and next steps
- Summarize key points at the end

### 3. Listen Actively
- Ask clarifying questions
- Paraphrase to confirm understanding
- Pay attention to non-verbal cues
- Create space for stakeholder input

## Conclusion

Effective stakeholder communication is a skill that improves with practice and reflection. By understanding your audience, choosing appropriate channels, and following best practices, you can build strong relationships that drive project success.`,

      '2': `# Agile Requirements Gathering Best Practices

## Introduction to Agile Requirements

In traditional waterfall methodologies, requirements are gathered upfront in a comprehensive document. Agile takes a different approach—requirements evolve throughout the project lifecycle, with continuous collaboration between stakeholders and the development team.

## Core Principles of Agile Requirements

### 1. Individuals and Interactions Over Processes and Tools
- Face-to-face conversations are preferred over lengthy documents
- Regular stakeholder collaboration drives requirement clarity
- Cross-functional team involvement ensures comprehensive understanding

### 2. Working Software Over Comprehensive Documentation
- Focus on delivering functional increments
- Requirements are validated through working prototypes
- Documentation supports development, not the other way around

### 3. Customer Collaboration Over Contract Negotiation
- Continuous stakeholder involvement throughout development
- Flexibility to adapt requirements based on feedback
- Shared ownership of project outcomes

### 4. Responding to Change Over Following a Plan
- Requirements can evolve based on new insights
- Regular retrospectives improve the requirements process
- Embrace change as a competitive advantage

## Agile Requirements Artifacts

### User Stories
**Format**: As a [user type], I want [functionality] so that [benefit]

**Example**: 
"As a customer service representative, I want to view customer order history so that I can quickly resolve customer inquiries."

**Best Practices**:
- Keep stories small and focused
- Include acceptance criteria
- Ensure stories are testable
- Write from the user's perspective

### Acceptance Criteria
Specific conditions that must be met for a story to be considered complete

**Example**:
- Given a customer service rep is logged in
- When they search for a customer by email
- Then they see the customer's complete order history
- And they can filter orders by date range

## Requirements Gathering Techniques

### 1. Story Mapping
Visual technique for organizing user stories

**Process**:
1. Identify user activities (high-level tasks)
2. Break activities into user tasks
3. Organize tasks in chronological order
4. Prioritize tasks by user value
5. Group tasks into releases

### 2. Three Amigos Sessions
Collaborative sessions with Business Analyst, Developer, and Tester

**Benefits**:
- Multiple perspectives on requirements
- Early identification of edge cases
- Shared understanding across disciplines
- Reduced rework and defects

## Conclusion

Agile requirements gathering is an iterative, collaborative process that emphasizes flexibility and continuous improvement. By focusing on user value, maintaining regular stakeholder communication, and embracing change, teams can deliver solutions that truly meet business needs.`,

      '3': `# SDLC Phase Management for Business Analysts

## Introduction to SDLC

The Software Development Life Cycle (SDLC) provides a structured approach to software development. As a Business Analyst, understanding each phase and your role within it is crucial for project success.

## SDLC Methodologies Overview

### Waterfall Model
- Sequential phases with distinct deliverables
- Comprehensive documentation at each stage
- Limited flexibility for changes
- Best for well-defined, stable requirements

### Agile Model
- Iterative development with continuous feedback
- Flexible requirements and adaptive planning
- Regular stakeholder collaboration
- Best for evolving requirements

## Phase 1: Requirements Analysis

### BA Responsibilities
- **Stakeholder Identification**: Map all project stakeholders
- **Requirements Elicitation**: Gather functional and non-functional requirements
- **Requirements Documentation**: Create comprehensive requirement specifications
- **Requirements Validation**: Ensure requirements meet business needs

### Key Activities
1. **Stakeholder Analysis**
   - Identify primary and secondary stakeholders
   - Understand stakeholder influence and interest
   - Develop communication strategies

2. **Requirements Gathering Techniques**
   - Interviews with key stakeholders
   - Workshops and focus groups
   - Document analysis
   - Observation and job shadowing

3. **Requirements Documentation**
   - Business Requirements Document (BRD)
   - Functional Requirements Specification (FRS)
   - Use cases and user stories
   - Process flow diagrams

## Phase 2: System Design

### BA Responsibilities
- **Requirements Clarification**: Support design team with requirement details
- **Design Review**: Ensure design aligns with business requirements
- **Gap Analysis**: Identify discrepancies between requirements and design

## Phase 3: Implementation/Development

### BA Responsibilities
- **Developer Support**: Clarify requirements during development
- **Change Request Management**: Handle scope changes
- **Progress Monitoring**: Track development against requirements

## Conclusion

Effective SDLC phase management requires a deep understanding of each phase's objectives, activities, and deliverables. As a Business Analyst, your role spans all phases, ensuring that business requirements are properly captured, communicated, and implemented.`,

      '4': `# Jira for Business Analysts: Complete Guide

## Introduction to Jira

Jira is a powerful project management and issue tracking tool widely used in software development. For Business Analysts, Jira serves as a central hub for requirements management, stakeholder collaboration, and project tracking.

## Getting Started with Jira

### Basic Concepts

**Projects**: Containers for issues, organized by team or initiative
**Issues**: Individual work items (stories, tasks, bugs, epics)
**Workflows**: Process flows that issues follow from creation to completion
**Boards**: Visual representations of work (Scrum or Kanban)
**Filters**: Saved searches to find specific issues

### Issue Types for Business Analysts

**Epic**: Large body of work that can be broken down into stories
- Example: "Customer Account Management System"

**Story**: Feature or requirement from user perspective
- Example: "As a customer, I want to reset my password"

**Task**: Work item that needs to be completed
- Example: "Create user acceptance test cases"

**Bug**: Defect or issue that needs to be fixed
- Example: "Login button not working on mobile"

## Requirements Management in Jira

### Creating Effective User Stories

**Story Template**:
Title: Concise description of functionality
Description: As a user type, I want functionality so that benefit

Acceptance Criteria:
- Given context
- When action
- Then outcome

Business Value: High/Medium/Low
Priority: Critical/High/Medium/Low

### Epic Management

**Epic Structure**:
- Epic Name: Clear, descriptive title
- Epic Description: High-level overview
- Business Objective: Why this epic matters
- Success Criteria: How success will be measured

## Agile Planning with Jira

### Backlog Management

**Product Backlog**:
- Prioritize stories by business value
- Estimate story points
- Groom backlog regularly
- Maintain ready criteria

### Scrum Boards

**Board Configuration**:
- Set up columns for workflow states
- Configure swimlanes by priority
- Add quick filters
- Customize card display

## Best Practices for BAs

### 1. Consistent Issue Creation
- Use templates for consistency
- Include all required fields
- Add appropriate labels and components
- Link related issues

### 2. Effective Communication
- Use clear, concise descriptions
- Add context and background
- Include visual aids when helpful
- Maintain professional tone

## Conclusion

Jira is a powerful tool for Business Analysts when properly configured and used. By leveraging its features for requirements management, stakeholder collaboration, and project tracking, BAs can significantly improve their effectiveness and project outcomes.`,

      '5': `# Managing Difficult Stakeholders: A Comprehensive Guide

## Introduction

Every Business Analyst encounters challenging stakeholder situations. Whether dealing with conflicting priorities, resistance to change, or communication barriers, managing difficult stakeholders is a critical skill for project success.

## Understanding Difficult Stakeholder Behaviors

### Common Difficult Stakeholder Types

**The Micromanager**
- Wants to control every detail
- Frequently changes requirements
- Doesn't trust the team's expertise
- Creates bottlenecks in decision-making

**The Ghost**
- Rarely available for meetings
- Doesn't respond to communications
- Provides minimal input
- Absent during critical decisions

**The Perfectionist**
- Never satisfied with deliverables
- Constantly requests changes
- Has unrealistic expectations
- Delays project progress

**The Skeptic**
- Questions every decision
- Resistant to new ideas
- Focuses on potential problems
- Creates negative team atmosphere

## Strategies for Managing Difficult Stakeholders

### 1. The CALM Approach

**C - Clarify**
- Understand the stakeholder's perspective
- Ask open-ended questions
- Listen actively to their concerns
- Identify underlying issues

**A - Acknowledge**
- Validate their feelings and concerns
- Show empathy and understanding
- Recognize their expertise and contributions
- Avoid being defensive

**L - Listen**
- Give them your full attention
- Take notes to show you're engaged
- Ask clarifying questions
- Summarize what you've heard

**M - Move Forward**
- Focus on solutions, not problems
- Identify actionable next steps
- Set clear expectations
- Follow up consistently

### 2. Building Trust and Rapport

**Establish Credibility**
- Demonstrate your expertise
- Be prepared for meetings
- Follow through on commitments
- Admit when you don't know something

**Show Genuine Interest**
- Ask about their goals and challenges
- Understand their perspective
- Find common ground
- Respect their expertise

### 3. Communication Strategies

**Adapt Your Style**
- Match their communication preferences
- Use their language and terminology
- Adjust your level of detail
- Choose appropriate channels

**Be Transparent**
- Share project status honestly
- Communicate risks and issues early
- Explain your reasoning
- Provide regular updates

## Specific Strategies by Stakeholder Type

### Managing the Micromanager
- Provide detailed status updates
- Set up regular check-ins
- Give them control over specific areas
- Document decisions and agreements

### Engaging the Ghost
- Use multiple communication channels
- Schedule meetings well in advance
- Send meeting summaries
- Escalate when necessary

### Working with the Perfectionist
- Set clear expectations upfront
- Use iterative reviews
- Focus on business value
- Establish "good enough" criteria

### Handling the Skeptic
- Provide evidence and data
- Address concerns directly
- Use pilot projects or prototypes
- Find internal champions

## Conclusion

Managing difficult stakeholders is both an art and a science. It requires patience, empathy, and strategic thinking. By understanding the root causes of difficult behavior and applying appropriate strategies, Business Analysts can turn challenging relationships into productive partnerships.

Remember: Every difficult stakeholder is an opportunity to demonstrate your professionalism and build stronger project outcomes.`
    }

    return sampleContent[article.id] || `# ${article.title}

## Overview
This is a sample preview of the ${article.title} article.

## Key Topics Covered
- Industry best practices and proven methodologies
- Real-world examples and case studies
- Practical tips and actionable insights
- Step-by-step guidance and frameworks

## Learning Objectives
By reading this article, you will:
- Understand core concepts and principles
- Learn practical application techniques
- Gain insights from industry experts
- Develop skills for immediate implementation

## Additional Resources
- Related articles and guides
- Best practice templates
- Training materials and workshops
- Community discussions and forums

*This is a demo preview. The full article contains comprehensive content with detailed examples and professional insights.*`
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center mb-4">
          <BookOpen className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Hub</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Explore curated articles, best practices, and guides to excel in your role
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles, topics, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && selectedCategory === 'all' && !searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Featured Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[article.category]}`}>
                    {article.category}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{article.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:text-primary-600 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-4">
          {selectedCategory === 'all' ? 'All Articles' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles`}
          <span className="text-gray-500 text-lg ml-2">({filteredArticles.length})</span>
        </h2>
        
        {filteredArticles.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[article.category]} mr-3`}>
                        {article.category}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{article.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{article.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors ml-4 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Article Modal */}
      {selectedArticle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedArticle(null)}
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
                <h2 className="text-2xl font-semibold text-gray-900">{selectedArticle.title}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedArticle.category]}`}>
                    {selectedArticle.category}
                  </span>
                  <span className="text-sm text-gray-600">• {selectedArticle.readTime} read</span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{selectedArticle.rating}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                  {getArticleContent(selectedArticle)}
                </pre>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <span>By {selectedArticle.author}</span>
                <span className="mx-2">•</span>
                <span>{selectedArticle.readTime} read</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  Read Full Article
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
