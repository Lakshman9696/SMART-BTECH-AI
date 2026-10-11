import { domains } from '../../src/data/domains.js';

const definitions = [
  { id: 'career-guidance', terms: ['career', 'software job', 'software engineer', 'career path', 'job role', 'career goal', 'career roadmap'] },
  { id: 'skill-roadmap', terms: ['skills', 'learn', 'roadmap', 'skill gap', 'what should i learn', 'technical skills'] },
  { id: 'programming-help', terms: ['code', 'coding', 'programming', 'sql', 'python', 'javascript', 'debug', 'explain'] },
  { id: 'interview-preparation', terms: ['interview', 'behavioral', 'communication', 'soft skills'] },
  { id: 'resume-building', terms: ['resume', 'cv', 'cover letter'] },
  { id: 'internship-placement', terms: ['internship', 'placement', 'recruiter', 'job application'] },
  { id: 'company-preparation', terms: ['company preparation', 'aptitude test', 'hiring test', 'company exam'] },
  { id: 'exam-guidance', terms: ['exam', 'examination', 'revision', 'banking', 'government exam', 'competitive exam'] },
  { id: 'project-recommendations', terms: ['project', 'project idea', 'build an app', 'research idea'] },
  { id: 'learning-resources', terms: ['resource', 'tutorial', 'course', 'learn sql', 'study material'] },
  { id: 'ai-tools', terms: ['ai tool', 'artificial intelligence tool', 'chatgpt', 'gemini', 'productivity tool'] },
  { id: 'banking-preparation', terms: ['banking exam', 'bank exam', 'banking role'] },
  { id: 'government-exam-preparation', terms: ['upsc', 'government competitive exam', 'public sector exam'] },
  { id: 'higher-study-guidance', terms: ['higher studies', 'masters', 'm.tech', 'study abroad', 'scholarship'] },
  { id: 'campus-opportunities', terms: ['ambassador program', 'student ambassador', 'campus opportunity'] },
  { id: 'event-planning', terms: ['event planning', 'organize an event', 'college event'] },
  { id: 'general-student-question', terms: [] },
];

/** Intent-to-domain recommendations are resolved through the UI's domain registry.
 * A future domain can join an existing intent by declaring it in supportedIntents. */
export const intentRegistry = definitions.map(intent => Object.defineProperty({ ...intent }, 'domainIds', {
  enumerable: true,
  get: () => domains.filter(domain => domain.enabled && domain.supportedIntents?.includes(intent.id)).map(domain => domain.id),
}));

export const enabledDomainIds = new Set(domains.filter(domain => domain.enabled).map(domain => domain.id));

