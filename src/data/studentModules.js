export const studentModules = [
  { id:'career-navigator', title:'Career Navigator', description:'Explore roles that fit your interests and see the skills each path calls for.', icon:'compass', accent:'blue', domainId:'career', next:'Add your study interests and career direction to get started.' },
  { id:'skills-hub', title:'Skills Hub', description:'Turn a role into a practical learning path, one skill at a time.', icon:'code', accent:'violet', domainId:'skill-job-analysis', next:'Choose a role or skill to shape your learning path.' },
  { id:'resume-builder', title:'Resume Builder', description:'Prepare a role-focused resume with clear sections and project highlights.', icon:'file', accent:'green', domainId:'job-skills-interview-soft-skills', next:'The resume editor and saved resume data are not connected yet.' },
  { id:'interview-prep', title:'Interview Preparation', description:'Build confidence with HR, technical and group discussion practice.', icon:'chat', accent:'amber', domainId:'job-skills-interview-soft-skills', next:'Interview questions and mock sessions are not connected yet.' },
  { id:'internship-placement', title:'Internship & Placement', description:'See the steps that connect early skills, projects and placement preparation.', icon:'briefcase', accent:'blue', domainId:'internships', next:'Start with the stage that matches your current year.' },
  { id:'projects-research', title:'Projects & Research', description:'Shape an idea into a project with a clear scope, stack and milestones.', icon:'bulb', accent:'violet', domainId:'projects', next:'Project records are not available yet. Bring an idea to the assistant.' },
  { id:'resource-hub', title:'Resource Hub', description:'Find curated learning and practice links with their source and verification date.', icon:'book', accent:'green', domainId:'ai-tools-dictionary', next:'Verified resource links will appear here when the content catalogue is connected.' },
  { id:'exam-guidance', title:'Exam Guidance', description:'Plan a focused start with an overview, study path and official exam links.', icon:'layers', accent:'amber', domainId:'government-competitive-exams', next:'Exam content is not connected yet. Official sources will be shown when available.' },
].map((module) => ({ ...module, route: `/modules/${module.id}` }));

export const careerStages = [
  { year:'Year 1', title:'Build your foundation', detail:'Explore branches, careers and essential study skills.' },
  { year:'Year 2', title:'Learn and create', detail:'Develop technical skills and start small projects.' },
  { year:'Year 3', title:'Practise in context', detail:'Build projects, practise coding and explore internships.' },
  { year:'Year 4', title:'Prepare for opportunities', detail:'Refine your resume and practise for interviews.' },
];
