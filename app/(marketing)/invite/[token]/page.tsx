import { InviteClient } from './invite-client'

type Props = {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props) {
  const { token: _token } = await params
  return { title: 'Join Acme Inc' }
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  return <InviteClient token={token} />
}