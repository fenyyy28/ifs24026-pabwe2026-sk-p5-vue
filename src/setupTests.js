import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// Pastikan token (localStorage dan cookie) tidak bocor antar test.
afterEach(() => {
  localStorage.clear()

  document.cookie
    .split('; ')
    .filter(Boolean)
    .forEach((cookie) => {
      const name = cookie.split('=')[0]
      document.cookie = `${name}=; path=/; max-age=0`
    })
})