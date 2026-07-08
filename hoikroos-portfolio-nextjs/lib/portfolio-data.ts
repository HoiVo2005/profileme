import { projects as fallbackProjectsData } from '@/data/projects';
import type { DocumentItem, Project, Skill } from '@/types';

export const getFallbackProjects = (): Project[] =>
    (fallbackProjectsData as any[]).map((project: any) => ({
        id: project.slug,
        slug: project.slug,
        title: project.title,
        short_description: project.shortDescription,
        description: project.description,
        category: project.category,
        year: project.year,
        status: project.status,
        role: project.role,
        duration: project.duration,
        accent: project.accent,
        technologies: project.technologies,
        learnings: project.learnings,
        github_url: project.githubUrl || null,
        demo_url: project.demoUrl || null,
        cover_url: null,
        image_urls: [],
        featured: false,
        published: true,
    }));

export const getFallbackProjectBySlug = (slug: string): Project | undefined =>
    getFallbackProjects().find((project) => project.slug === slug);

export const getFallbackSkills = (): Skill[] => [
    { id: 'fallback-1', name: 'Next.js', category: 'Frontend', level: 92, icon_url: null, sort_order: 1 },
    { id: 'fallback-2', name: 'React', category: 'Frontend', level: 90, icon_url: null, sort_order: 2 },
    { id: 'fallback-3', name: 'TypeScript', category: 'Frontend', level: 88, icon_url: null, sort_order: 3 },
    { id: 'fallback-4', name: 'Supabase', category: 'Backend', level: 84, icon_url: null, sort_order: 4 },
    { id: 'fallback-5', name: 'PostgreSQL', category: 'Database', level: 82, icon_url: null, sort_order: 5 },
    { id: 'fallback-6', name: 'REST API', category: 'Backend', level: 86, icon_url: null, sort_order: 6 },
];

export const getFallbackDocuments = (): DocumentItem[] => [
    {
        id: 'fallback-doc-1',
        title: 'Hồ sơ năng lực',
        file_url: '/documents/ho-so-nang-luc.txt',
        file_path: 'documents/ho-so-nang-luc.txt',
        file_type: 'text/plain',
        file_size: 1024,
        project_id: null,
    },
    {
        id: 'fallback-doc-2',
        title: 'Báo cáo dự án',
        file_url: '/documents/bao-cao-du-an.txt',
        file_path: 'documents/bao-cao-du-an.txt',
        file_type: 'text/plain',
        file_size: 1024,
        project_id: null,
    },
];
