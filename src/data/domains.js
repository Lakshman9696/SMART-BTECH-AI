/** Central registry. Domain names/order come from the supplied document list; descriptions and capabilities are starter metadata. */
const supportedIntents = {
  'ai-tools-dictionary':['ai-tools','learning-resources'],
  'skill-job-analysis':['career-guidance','skill-roadmap'],
  'banking-exams-roles':['exam-guidance','banking-preparation'],
  'government-competitive-exams':['exam-guidance','government-exam-preparation'],
  'company-conducted-exams':['company-preparation','placement-preparation'],
  'abroad-scholarships':['higher-study-guidance','scholarship-search'],
  'job-skills-interview-soft-skills':['interview-preparation','resume-building','communication-skills'],
  'academic-learning':['academic-learning','learning-resources','general-student-question'],
  'ambassador-programs':['campus-opportunities'],
  'internships':['internship-placement'],
  'event-handling':['event-planning'],
  coding:['programming-help','technical-skill-practice','skill-roadmap'],
  projects:['project-recommendations','project-planning'],
  career:['career-guidance','career-roadmap'],
};

export const domains = [
  { id:'ai-tools-dictionary', sourceNumber:1, sourceFile:'01-ai-tools-dictionary.docx', name:'AI Tools Dictionary', category:'AI & Digital', description:'Explore AI tools and understand what each one can help you do.', capabilities:['AI tools','artificial intelligence','tool selection','productivity'], route:'/domains/ai-tools-dictionary', status:'planned', enabled:true, icon:'✳', color:'lavender' },
  { id:'skill-job-analysis', sourceNumber:2, sourceFile:'02-skill-and-job-analysis.docx', name:'Skill & Job Analysis', category:'Career', description:'Compare your current skills with roles and identify useful next skills to build.', capabilities:['skills','job analysis','career roles','skill gaps'], route:'/domains/skill-job-analysis', status:'planned', enabled:true, icon:'⌕', color:'mint' },
  { id:'banking-exams-roles', sourceNumber:3, sourceFile:'03-banking-exams-and-roles.docx', name:'Banking Exams & Roles', category:'Exams & opportunities', description:'Explore banking exam pathways, role types and preparation needs.', capabilities:['banking exams','banking jobs','bank roles','banking preparation'], route:'/domains/banking-exams-roles', status:'planned', enabled:true, icon:'▤', color:'butter' },
  { id:'government-competitive-exams', sourceNumber:4, sourceFile:'04-government-competitive-exams.docx', name:'Government Competitive Exams', category:'Exams & opportunities', description:'Compare government competitive exams and understand their preparation paths.', capabilities:['government exams','competitive exams','public sector','exam preparation'], route:'/domains/government-competitive-exams', status:'planned', enabled:true, icon:'✎', color:'sky' },
  { id:'company-conducted-exams', sourceNumber:5, sourceFile:'05-company-conducted-exams.docx', name:'Company-Conducted Exams', category:'Exams & opportunities', description:'Learn about company hiring tests, assessment rounds and preparation.', capabilities:['company exams','placement tests','aptitude tests','hiring assessments'], route:'/domains/company-conducted-exams', status:'planned', enabled:true, icon:'⌗', color:'peach' },
  { id:'abroad-scholarships', sourceNumber:6, sourceFile:'06-abroad-and-scholarships.docx', name:'Abroad & Scholarships', category:'Study & funding', description:'Explore study-abroad pathways, scholarships and application planning.', capabilities:['study abroad','scholarships','international study','funding'], route:'/domains/abroad-scholarships', status:'planned', enabled:true, icon:'↗', color:'lavender' },
  { id:'job-skills-interview-soft-skills', sourceNumber:7, sourceFile:'07-job-skills-interview-and-soft-skills.docx', name:'Job Skills, Interviews & Soft Skills', category:'Career', description:'Practise job-ready skills, interviews and professional communication.', capabilities:['job skills','interviews','soft skills','communication','presentations'], route:'/domains/job-skills-interview-soft-skills', status:'planned', enabled:true, icon:'◖', color:'mint' },
  { id:'academic-learning', sourceNumber:8, sourceFile:'08-academic-learning.docx', name:'Academic Learning', category:'Learning', description:'Find support for coursework, concepts, study habits and revision.', capabilities:['academics','coursework','learning','study','revision','exams'], route:'/domains/academic-learning', status:'planned', enabled:true, icon:'◷', color:'butter' },
  { id:'ambassador-programs', sourceNumber:9, sourceFile:'09-ambassador-programs.docx', name:'Ambassador Programs', category:'Campus & community', description:'Explore student ambassador opportunities and ways to participate.', capabilities:['ambassador programs','student ambassador','campus opportunities','leadership'], route:'/domains/ambassador-programs', status:'planned', enabled:true, icon:'◎', color:'sky' },
  { id:'internships', sourceNumber:11, sourceFile:'11-internships.docx', name:'Internships', category:'Career', description:'Explore internship opportunities and organize your preparation and applications.', capabilities:['internships','internship applications','jobs','career','placements'], route:'/domains/internships', status:'planned', enabled:true, icon:'⌕', color:'peach' },
  { id:'event-handling', sourceNumber:13, sourceFile:'13-event-handling.docx', name:'Event Handling', category:'Campus & community', description:'Plan student events with checklists, timelines and coordination support.', capabilities:['events','event planning','event coordination','organizing'], route:'/domains/event-handling', status:'planned', enabled:true, icon:'⌑', color:'butter' },
  { id:'coding', sourceNumber:14, sourceFile:'14-programming.docx', name:'Programming', category:'Technical skills', description:'Build programming knowledge through concepts, practice and debugging.', capabilities:['programming','coding','debugging','software development','technical skills'], route:'/domains/coding', status:'planned', enabled:true, icon:'{ }', color:'mint' },
  { id:'projects', sourceNumber:15, sourceFile:'15-projects-and-idea-analysis.docx', name:'Projects & Idea Analysis', category:'Build', description:'Evaluate project ideas and shape them into clear, practical next steps.', capabilities:['projects','idea analysis','project ideas','research','building'], route:'/domains/projects', status:'planned', enabled:true, icon:'⌘', color:'sky' },
  { id:'career', sourceNumber:16, sourceFile:'16-career-roadmap.docx', name:'Career Roadmap', category:'Career', description:'Map interests and goals to skills, roles and career milestones.', capabilities:['career roadmap','career planning','career goals','roles','skills'], route:'/domains/career', status:'planned', enabled:true, icon:'↗', color:'lavender' },
].map(domain => ({
  ...domain,
  supportedIntents: supportedIntents[domain.id] || [],
  integration: { kind: domain.status === 'ready' ? 'module' : 'preview', component: null, contractVersion: 1 },
  prompt: `Help me explore ${domain.name.toLowerCase()}.`,
}));

export const getDomain = id => domains.find(domain => domain.id === id);
export const enabledDomains = () => domains.filter(domain => domain.enabled);
export const domainSupportsIntent = (domainId, intentId) => Boolean(getDomain(domainId)?.enabled && getDomain(domainId)?.supportedIntents.includes(intentId));

// Local demo matcher. Replace its implementation behind the same interface with an API call later.
const intentRules = [
  { ids:['internships','career','skill-job-analysis','job-skills-interview-soft-skills'], terms:['internship','job','career','resume','cv','placement','interview','skill gap','skills'] },
  { ids:['coding','projects','ai-tools-dictionary'], terms:['code','coding','programming','debug','project','build','idea','ai tool'] },
  { ids:['banking-exams-roles','government-competitive-exams','company-conducted-exams','academic-learning'], terms:['exam','test','revision','study','course','class','banking','government','company test','aptitude'] },
  { ids:['abroad-scholarships','ambassador-programs','event-handling'], terms:['abroad','scholarship','international','ambassador','event','organize'] },
  { ids:['academic-learning','skill-job-analysis'], terms:['plan','deadline','schedule','organized','week','time'] },
];
export function recommendDomains(text = '', profile = {}) {
  const query = [text, profile.skills, profile.interests, profile.careerGoals, profile.challenges, profile.helpNeeded].flat().filter(Boolean).join(' ').toLowerCase();
  const scores = new Map();
  for (const rule of intentRules) {
    const hits = rule.terms.filter(term => query.includes(term)).length;
    if (hits) rule.ids.forEach((id,index) => { if (getDomain(id)?.enabled) scores.set(id, (scores.get(id)||0)+hits*(index===0?2:1)); });
  }
  for (const domain of enabledDomains()) {
    const hits = domain.capabilities.filter(cap => query.includes(cap.toLowerCase())).length;
    if (hits) scores.set(domain.id, (scores.get(domain.id)||0)+hits*2);
  }
  const ordered = [...scores.entries()].sort((a,b)=>b[1]-a[1]).map(([id])=>getDomain(id)).filter(Boolean);
  const unique = ordered.filter((domain,index)=>ordered.findIndex(d=>d.id===domain.id)===index).slice(0,3);
  if (unique.length) return unique;
  return ['academic-learning','career','coding'].map(getDomain).filter(domain=>domain?.enabled).slice(0,2);
}
export function reasonFor(domain, profile = {}, message = '') {
  const text = [message, profile.skills, profile.interests, profile.careerGoals, profile.challenges, profile.helpNeeded].flat().filter(Boolean).join(' ').toLowerCase();
  const reasons = {
    'ai-tools-dictionary': [/\b(ai|gemini|chatgpt|artificial intelligence)\b/, 'You asked about AI tools, so this section can help compare useful options.'],
    'skill-job-analysis': [/\b(skill|skills|job|role|software career)\b/, 'This connects the skills you are building with roles you may want to pursue.'],
    'banking-exams-roles': [/\b(bank|banking)\b/, 'This is the registered section for banking roles and exam preparation.'],
    'government-competitive-exams': [/\b(government|upsc|competitive exam)\b/, 'This is the registered section for government exam pathways.'],
    'company-conducted-exams': [/\b(company|placement test|aptitude|assessment)\b/, 'This connects your placement goal with company hiring assessments.'],
    'abroad-scholarships': [/\b(abroad|scholarship|master|m\.tech)\b/, 'This section matches your interest in further study or funding.'],
    'job-skills-interview-soft-skills': [/\b(interview|resume|cv|communication|soft skill)\b/, 'This section covers the interview or communication practice you asked for.'],
    'academic-learning': [/\b(study|subject|course|revision|academic|class)\b/, 'This can help you make progress with the subject or study task you mentioned.'],
    'ambassador-programs': [/\b(ambassador|campus opportunity|leadership)\b/, 'This matches your interest in student ambassador opportunities.'],
    internships: [/\b(internship)\b/, 'This section matches your interest in finding and preparing for internships.'],
    'event-handling': [/\b(event|organize|organise)\b/, 'This section is for planning and coordinating student events.'],
    coding: [/\b(sql|python|java|javascript|programming|coding|debug)\b/, 'You asked about a technical skill, so this is the closest registered practice area.'],
    projects: [/\b(project|idea|research|build)\b/, 'This section helps turn your project or research idea into a practical first step.'],
    career: [/\b(career|confused|career path|goal|role)\b/, 'This section can help you compare directions and plan a career path.'],
  };
  const match = reasons[domain.id];
  if (match && match[0].test(text)) return match[1];
  const matched = domain.capabilities.find(cap=>text.includes(cap.toLowerCase()));
  return matched ? `Connects with what you shared about ${matched}.` : `A useful starting point for ${domain.category.toLowerCase()}.`;
}
