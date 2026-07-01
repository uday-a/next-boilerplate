import assert from 'node:assert/strict'
import test from 'node:test'
import { safeRedirectPath } from './redirect.ts'

test('safeRedirectPath allows same-site absolute paths', () => {
  assert.equal(safeRedirectPath('/dashboard'), '/dashboard')
  assert.equal(safeRedirectPath('/pricing?plan=pro#checkout'), '/pricing?plan=pro#checkout')
})

test('safeRedirectPath rejects external and ambiguous targets', () => {
  assert.equal(safeRedirectPath('https://evil.example/phish'), '/dashboard')
  assert.equal(safeRedirectPath('//evil.example/phish'), '/dashboard')
  assert.equal(safeRedirectPath('dashboard'), '/dashboard')
  assert.equal(safeRedirectPath('/\\evil.example'), '/dashboard')
})

test('safeRedirectPath supports a custom fallback', () => {
  assert.equal(safeRedirectPath(null, '/login'), '/login')
  assert.equal(safeRedirectPath('https://evil.example/phish', '/login'), '/login')
})
