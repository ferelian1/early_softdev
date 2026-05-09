import { fetchProjects, fetchSocialLinks } from "@/lib/api"
import PageClient from "./PageClient"

export default async function Page() {
  const [projects, socialLinks] = await Promise.all([
    fetchProjects(),
    fetchSocialLinks(),
  ])

  return <PageClient projects={projects} socialLinks={socialLinks} />
}
