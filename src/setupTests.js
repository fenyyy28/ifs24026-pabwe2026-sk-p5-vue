import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// Pastikan token dan data lain di localStorage tidak bocor antar test.
afterEach(() => {
  localStorage.clear()
})