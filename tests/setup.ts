import { beforeAll, afterAll, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Make React globally available for JSX
global.React = React

// Mock environment variables
process.env.NEXT_PUBLIC_MOCK_MODE = 'true'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key'

beforeAll(() => {
  // Global test setup
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    }),
  })
})

afterEach(() => {
  // Cleanup after each test
})

afterAll(() => {
  // Global test cleanup
})