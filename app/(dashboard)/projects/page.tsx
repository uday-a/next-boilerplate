import { localizedMetadata } from '@/lib/page-title'
import { ProjectsClient } from './projects-client'

export function generateMetadata() {
  return localizedMetadata('/projects')
}

export default function ProjectsPage() {
  return <ProjectsClient />
}