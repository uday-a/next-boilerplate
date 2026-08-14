'use client'

import { AuthSignUp } from '@/components/blocks/AuthSignUp'

export function SignUpClient() {
  function onSubmit() {
    alert('Email signup is not wired. Use GitHub OAuth or continue from /login with demo mode.')
  }

  function onOauth(provider: 'github' | 'google') {
    if (provider !== 'github') {
      alert('Only GitHub OAuth is wired right now.')
      return
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- API endpoint redirects to external OAuth provider
    window.location.href = '/api/auth/github'
  }

  return (
    <AuthSignUp
      signInHref="/login"
      oauthProviders={['github']}
      onSubmit={onSubmit}
      onOauth={onOauth}
    />
  )
}