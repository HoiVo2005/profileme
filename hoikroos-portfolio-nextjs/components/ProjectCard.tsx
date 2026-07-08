import Link from 'next/link';
import { Download, Eye, Github } from 'lucide-react';
import type { Project } from '@/types';
import ProjectVisual from './ProjectVisual';
export default function ProjectCard({project}:{project:Project}){return <article className="project-card">{project.cover_url?<img className="project-cover" src={project.cover_url} alt={project.title}/>:<ProjectVisual type={project.accent} compact/>}<div className="project-card-content"><h3>{project.title}</h3><p>{project.short_description}</p><div className="tags">{project.technologies.slice(0,3).map(t=><span key={t}>{t}</span>)}</div></div><div className="project-actions"><Link href={`/projects/${project.slug}`}><Eye size={16}/>Xem chi tiết</Link>{project.demo_url&&<a href={project.demo_url} target="_blank"><Download size={16}/>Demo</a>}{project.github_url&&<a className="icon-only" href={project.github_url} target="_blank" rel="noreferrer"><Github size={18}/></a>}</div></article>}
