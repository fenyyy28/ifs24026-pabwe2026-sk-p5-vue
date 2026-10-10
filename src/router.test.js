import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import router, { authGuard, createAppRouter } from './router'
import { putAccessToken } from './helpers/apiHelper'

vi.mock('@toast-ui/editor', () => ({ default: class {} }))
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))

beforeEach(() => {
  localStorage.clear()
})

async function navigate(path) {
  const appRouter = createAppRouter(createMemoryHistory())
  await appRouter.push(path)
  await appRouter.isReady()
  return appRouter.currentRoute.value
}

describe('router bawaan', () => {
  it('dibuat dengan riwayat browser', () => {
    expect(router.options.history.base).toBe('')
  })
})

describe('authGuard', () => {
  it('menolak halaman terproteksi tanpa token', () => {
    expect(authGuard({ meta: { requiresAuth: true } })).toBe('/auth/login')
  })

  it('mengizinkan halaman terproteksi dengan token', () => {
    putAccessToken('abc')

    expect(authGuard({ meta: { requiresAuth: true } })).toBe(true)
  })

  it('mengarahkan pengguna login dari halaman tamu ke beranda', () => {
    putAccessToken('abc')

    expect(authGuard({ meta: { guestOnly: true } })).toBe('/')
  })

  it('mengizinkan tamu mengakses halaman tamu', () => {
    expect(authGuard({ meta: { guestOnly: true } })).toBe(true)
  })

  it('mengizinkan halaman tanpa pembatasan', () => {
    expect(authGuard({ meta: {} })).toBe(true)
  })
})

describe('tanpa login', () => {
  it.each(['/', '/my', '/users', '/profile', '/aucations/5'])(
    'mengarahkan %s ke halaman login',
    async (path) => {
      const route = await navigate(path)

      expect(route.name).toBe('login')
    },
  )

  it.each([
    ['/auth/login', 'login'],
    ['/auth/register', 'register'],
    ['/auth', 'login'],
  ])('membuka %s sebagai %s', async (path, name) => {
    const route = await navigate(path)

    expect(route.name).toBe(name)
  })
})

describe('sudah login', () => {
  beforeEach(() => {
    putAccessToken('abc')
  })

  it.each([
    ['/', 'home'],
    ['/my', 'my-aucations'],
    ['/users', 'users'],
    ['/profile', 'profile'],
  ])('membuka %s sebagai %s', async (path, name) => {
    const route = await navigate(path)

    expect(route.name).toBe(name)
  })

  it('mengirim tab "mine" ke halaman Lelang Saya', async () => {
    const route = await navigate('/my')

    expect(route.matched.at(-1).props.default).toEqual({ initialTab: 'mine' })
  })

  it('membaca parameter aucationId pada halaman detail', async () => {
    const route = await navigate('/aucations/12')

    expect(route.name).toBe('aucation-detail')
    expect(route.params.aucationId).toBe('12')
  })

  it.each(['/auth/login', '/auth/register', '/auth'])(
    'mengarahkan %s ke beranda',
    async (path) => {
      const route = await navigate(path)

      expect(route.name).toBe('home')
    },
  )
})

describe('rute tidak dikenal', () => {
  it('menampilkan halaman 404', async () => {
    const route = await navigate('/tidak/ada')

    expect(route.name).toBe('not-found')
    expect(route.params.pathMatch).toEqual(['tidak', 'ada'])
  })
})