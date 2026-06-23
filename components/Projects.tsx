'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FolderGit2, ExternalLink, ArrowRight } from 'lucide-react';
import ThreeDCard from './ThreeDCard';

interface ProjectItem {
  title: string;
  img: string;
  lang: string[];
  redirect: string;
}

const projectsList: ProjectItem[] = [
  {
    title: 'Financely',
    img: '/assets/Financely.png',
    lang: ['Html', 'Css', 'Javascript', 'React', 'ReduxToolkit', 'FireBase'],
    redirect: 'https://financely-teal.vercel.app/',
  },
  {
    title: 'PhenomCommerce',
    img: '/assets/phenomCommerce.png',
    lang: ['Next.js', 'React', 'Supabase', 'TypeScript', 'Google OAuth', 'Razorpay', 'JavaScript', 'Cloudinary'],
    redirect: 'https://next-js-commerce-beta.vercel.app/',
  },
  {
    title: 'Podcast Platform',
    img: '/assets/Podcast.png',
    lang: ['Html', 'Css', 'Javascript', 'React', 'ReduxToolkit', 'FireBase'],
    redirect: 'https://podcast-platform-ten.vercel.app/',
  },
  {
    title: 'Cara-Clothing Website',
    img: '/assets/Cara.png',
    lang: ['Html', 'Css', 'Javascript'],
    redirect: 'https://ecommerce-website-five-sable.vercel.app/',
  },
  {
    title: 'E-Invite Editor',
    img: '/assets/E-Invite.png',
    lang: ['Fabric-Js', 'ReactJS', 'TailwindCss', 'JavaScript'],
    redirect: 'https://weddingcardeditor-alpha.vercel.app/',
  },
];

export default function Projects() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 90, damping: 15 },
    },
  };

  return (
    <section
      id="Portfolio"
      className="relative w-full py-24 border-b border-github-border/40 bg-github-bg overflow-hidden"
    >
      {/* Dynamic backdrop mesh highlight */}
      <div className="absolute top-[20%] left-1/4 h-[500px] w-[500px] rounded-full bg-github-purple/5 blur-[120px] pointer-events-none glow-animate" />
      <div className="absolute bottom-[20%] right-1/4 h-[500px] w-[500px] rounded-full bg-github-blue/5 blur-[120px] pointer-events-none glow-animate" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-github-border bg-github-surface text-xs font-mono text-github-purple"
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            Selected Work
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-github-gold font-mont uppercase"
          >
            Projects
          </motion.h2>
          <div className="mt-2 h-1 w-20 bg-github-gold rounded-full" />
        </div>

        {/* Project Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projectsList.map((project, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="h-full"
            >
              <a 
                href={project.redirect} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block h-full focus:outline-hidden"
              >
                <ThreeDCard className="flex flex-col justify-between h-full bg-github-surface border-github-border hover:border-github-gold/50 p-5 overflow-hidden transition-all duration-300">
                  
                  {/* Card Top Branding & Link Button */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-github-gold font-mono text-xs">
                        <span className="font-extrabold">&lt;</span>
                        <span>0{index + 1}</span>
                        <span className="font-extrabold">/&gt;</span>
                      </div>
                      <div className="rounded-full bg-github-bg border border-github-border p-2 text-github-subtext group-hover:text-github-gold group-hover:bg-github-surface transition-all duration-200">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    {/* Card Project Title */}
                    <h3 className="text-xl font-bold font-mont text-github-text group-hover:text-github-gold italic transition-colors">
                      {project.title}
                    </h3>
                  </div>

                  {/* Project Image Panel */}
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-github-border bg-github-bg my-5 shadow-inner">
                    <Image
                      src={project.img}
                      alt={project.title}
                      fill
                      sizes="(max-w-768px) 100vw, 350px"
                      className="object-cover object-top group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Dark overlay with Action Reveal */}
                    <div className="absolute inset-0 bg-github-bg/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-github-bg bg-github-gold px-3.5 py-1.5 rounded-full shadow-lg">
                        Visit Live Demo
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>

                  {/* Tech stack badge container */}
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                    {project.lang.map((langItem, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-github-bg px-2.5 py-1 font-mono text-[10px] font-bold text-github-gold border border-github-border"
                      >
                        {langItem}
                      </span>
                    ))}
                  </div>

                </ThreeDCard>
              </a>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
