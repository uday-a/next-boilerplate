import { ProjectDetailClient } from './project-detail-client'

export const metadata = { title: 'Project' }

type Props = { params: Promise<{ slug: string }> }

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  return <ProjectDetailClient slug={slug} />
}