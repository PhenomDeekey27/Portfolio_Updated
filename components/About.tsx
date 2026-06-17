'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Code2, Cpu, Sparkles } from 'lucide-react';

export default function About() {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 15 },
    },
  };

  return (
    <section
      id="About"
      className="relative w-full py-24 border-b border-github-border/40 bg-github-bg"
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(188,140,255,0.03),transparent)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-github-border bg-github-surface text-xs font-mono text-github-purple"
          >
            <User className="h-3.5 w-3.5" />
            Who I Am
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-github-gold font-mont"
          >
            About Me
          </motion.h2>
          <div className="mt-2 h-1 w-20 bg-github-gold rounded-full" />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Main About Card (GitHub-Readme styled file block) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="md:col-span-8 rounded-xl border border-github-border bg-github-surface shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            {/* Readme Title Bar */}
            <div className="flex items-center justify-between border-b border-github-border bg-github-card px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-github-blue" />
                <span className="font-mono text-xs text-github-text font-medium">README.md</span>
              </div>
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-github-border" />
                <span className="h-3 w-3 rounded-full bg-github-border" />
                <span className="h-3 w-3 rounded-full bg-github-border" />
              </div>
            </div>

            {/* Readme Content */}
            <div className="p-6 sm:p-8 font-sans space-y-6 text-github-text leading-relaxed">
              <p className="text-lg font-medium text-github-text/95 border-l-2 border-github-gold pl-4 italic">
                &ldquo;Full Stack Developer with 2+ years of experience building scalable web applications using the MERN stack and AI-powered automation solutions.&rdquo;
              </p>
              
              <div className="h-[1px] bg-github-border" />

              <p className="text-base text-github-subtext">
                I specialize in developing end-to-end features, from designing RESTful APIs and backend microservices (FastAPI, Express) to building responsive, modern user interfaces with React, Next.js, and TypeScript.
              </p>
              <p className="text-base text-github-subtext">
                My hands-on experience includes engineering workflow automation (Zoho CRM, Meta APIs), real-time notification reminder systems (WhatsApp, Telegram, Email), and secure database configurations (MongoDB, PostgreSQL, Supabase).
              </p>
            </div>

            {/* Readme Footer bar */}
            <div className="border-t border-github-border bg-github-card px-6 py-4 flex items-center justify-between text-xs font-mono text-github-subtext">
              <span>Lines: 12  ·  UTF-8</span>
              <span>TypeScript / React</span>
            </div>
          </motion.div>

          {/* Quick Metrics & Focus Cards */}
          <div className="md:col-span-4 flex flex-col gap-6 justify-between">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-github-border bg-github-surface p-6 shadow-md flex-1 flex flex-col justify-center"
            >
              <div className="flex items-center gap-3 mb-3 text-github-gold">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold text-github-text text-sm uppercase tracking-wider font-mono">My Philosophy</h3>
              </div>
              <p className="text-xs text-github-subtext leading-relaxed">
                Design with intent, build for scale, write readable code, and ensure 100% responsiveness on every screen.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-github-border bg-github-surface p-6 shadow-md flex-1 flex flex-col justify-center"
            >
              <div className="flex items-center gap-3 mb-3 text-github-blue">
                <Cpu className="h-5 w-5" />
                <h3 className="font-semibold text-github-text text-sm uppercase tracking-wider font-mono">Core Focus</h3>
              </div>
              <ul className="text-xs text-github-subtext space-y-2 font-mono">
                <li className="flex items-center gap-1.5">
                  <span className="text-github-green">✓</span> Full Stack Architectures
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-github-blue">✓</span> Responsive UI Engineering
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-github-purple">✓</span> API Integrations & Webhooks
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
