import { cache } from 'react'
import type { Metadata } from 'next'
import { GET } from '@/app/api/projects/[slug]/route'
import type { ApiResponse } from '@/lib/api/response'
import { localizedMetadata } from '@/lib/page-title'
import { ProjectDetailClient, type Project } from './project-detail-client'

type Props = { params: Promise<{ slug: string }> }

// Reuse the API route's auth + demo/DB lookup so the server knows the
// project name for <title> and the H1 (no raw-slug flash). cache() dedupes
// the call between generateMetadata and the page render.
const loadProject = cache(async (slug: string): Promise<Project | null> => {
  const res = await GET(new Request(`http://internal/api/projects/${slug}`), { params: Promise.resolve({ slug }) })
  const json = (await res.json()) as ApiResponse<{ project: Project }>
  return json.ok ? json.data.project : null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await loadProject(slug)
  // Detail pages have no nav label of their own; fall back to "Projects".
  return project ? { title: project.name } : localizedMetadata('/projects')
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await loadProject(slug)
  return <ProjectDetailClient slug={slug} initialProject={project} />
}
