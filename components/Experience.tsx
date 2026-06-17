'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, Star, Server, Layout } from 'lucide-react';
import ThreeDCard from './ThreeDCard';

interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  project?: string;
  points: string[];
  techStack: string[];
  type: 'fulltime' | 'intern';
}

const experiences: ExperienceItem[] = [
  {
    company: 'Simplita AI Technologies Private Limited',
    role: 'Associate Software Engineer',
    duration: '07/2025 – Present',
    project: 'Low-Code/No-Code Platform & Client Integrations',
    type: 'fulltime',
    points: [
      'Engineered scalable backend services, FastAPI REST APIs, and reusable UI components for an enterprise grade no-code platform.',
      'Designed and implemented zoo-like Zoho CRM webhooks, multi-stage reminder workflows (WhatsApp, Email, Telegram) and secure Google Drive automated structures for ENN Consultancy.',
      'Built multi-channel outreach automation systems integrated with email, WhatsApp, and AI voice agents (Vapi, Bolna) for Project Saravaraj.',
      'Developed real-time automated document storage and secure credential key management systems.'
    ],
    techStack: ['Next.js', 'TypeScript', 'Python', 'FastAPI', 'Supabase', 'OpenAI APIs', 'Zoho CRM', 'MCP Tools', 'Git'],
  },
  {
    company: 'REVOLTRONX',
    role: 'Full Stack Developer Intern',
    duration: '10/2024 – 07/2025',
    type: 'intern',
    points: [
      'Developed and enhanced web application features using the MERN stack with TypeScript, ensuring type safety and maintainable code architecture.',
      'Engineered a gamified reward system including features like boarding passes and visitor visas based on user activity, significantly improving user retention.',
      'Spearheaded UI/UX improvements by fixing bugs, refining layouts, and ensuring full responsiveness across devices.'
    ],
    techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
  },
  {
    company: 'GET INTO DARE',
    role: 'Junior Web Developer Intern',
    duration: '04/2024 – 08/2024',
    type: 'intern',
    points: [
      'Built and maintained end-to-end features using the MERN stack, contributing to a scalable and responsive web application.',
      'Developed an AI-powered quiz generation system within the user profile, delivering daily randomized quizzes with a streak and points reward system.',
      'Identified and resolved critical frontend and backend bugs, optimizing the application for cross-device responsiveness.'
    ],
    techStack: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
  },
];

export default function Experience() {
  return (
    <section
      id="Experience"
      className="relative w-full py-24 border-b border-github-border/40 bg-github-bg overflow-hidden"
    >
      {/* Visual background lights */}
      <div className="absolute top-[30%] left-[5%] h-[400px] w-[400px] rounded-full bg-github-blue/5 blur-[120px] pointer-events-none glow-animate" />
      <div className="absolute bottom-[30%] right-[5%] h-[400px] w-[400px] rounded-full bg-github-gold/5 blur-[120px] pointer-events-none glow-animate" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-github-border bg-github-surface text-xs font-mono text-github-purple"
          >
            <Briefcase className="h-3.5 w-3.5" />
            My Career Path
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-github-gold font-mont uppercase"
          >
            Experience
          </motion.h2>
          <div className="mt-2 h-1 w-20 bg-github-gold rounded-full" />
        </div>

        {/* Timeline Stack Layout */}
        <div className="relative border-l border-github-border/80 ml-4 md:ml-8 space-y-12">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Vertical Timeline Bullet Node */}
              <span className={`absolute -left-[17px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full border bg-github-bg shadow-md ${
                exp.type === 'fulltime' ? 'border-github-gold text-github-gold' : 'border-github-blue text-github-blue'
              }`}>
                {exp.type === 'fulltime' ? <Star className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
              </span>

              {/* Job Detail Card wrapper */}
              <ThreeDCard className="bg-github-surface border-github-border hover:border-github-gold/40 p-6 shadow-lg">
                
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-github-border/60 pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-mont text-github-text">
                      {exp.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                      <span className="text-github-gold font-semibold">{exp.company}</span>
                      <span className="text-github-border">·</span>
                      <span className="rounded-md bg-github-bg border border-github-border px-2 py-0.5 text-xs text-github-subtext uppercase tracking-wider font-mono">
                        {exp.type === 'fulltime' ? 'Full-Time' : 'Internship'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-github-subtext">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{exp.duration}</span>
                  </div>
                </div>

                {/* Optional project title line */}
                {exp.project && (
                  <div className="mb-4 text-xs font-mono font-bold text-github-blue flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5" />
                    <span>Core Domain: {exp.project}</span>
                  </div>
                )}

                {/* Job Achievements Description Points */}
                <ul className="space-y-2.5 text-sm text-github-subtext mb-6 pl-4 list-disc marker:text-github-gold">
                  {exp.points.map((pt, pIdx) => (
                    <li key={pIdx} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>

                {/* Tag list */}
                <div className="flex flex-wrap gap-1.5 border-t border-github-border/60 pt-4">
                  {exp.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded-md bg-github-bg px-2.5 py-1 font-mono text-[10px] font-bold text-github-gold border border-github-border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

              </ThreeDCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
