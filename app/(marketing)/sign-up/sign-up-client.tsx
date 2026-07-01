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