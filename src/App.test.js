import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { createAppRouter } from './router'
import { renderWithProviders } from './test-utils'
import { getProfile } from './features/users/api/userApi'
import { putAccessToken } from './helpers/apiHelper'

vi.mock('@toast-ui/editor', () => ({ default: class {} }))
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))
vi.mock('./features/users/api/userApi', () => ({
  getUsers: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}))

const profile = { id: 1, name: 'Feny Pasaribu', email: 'feny@delcom.org', photo: null }

const renderApp = (route) =>
  renderWithProviders(App, {
    route,
    router: createAppRouter(createMemoryHistory()),
  })

beforeEach(() => {
  vi.resetAllMocks()
  getProfile.mockResolvedValue({ status: 'success', data: { user: profile } })
})

describe('App (integrasi)', () => {
  it('mengarahkan tamu dari beranda ke halaman login', async () => {
    const { wrapper, router } = await renderApp('/')

    expect(router.currentRoute.value.name).toBe('login')
    expect(wrapper.element).toHaveTextContent('Selamat datang kembali')
  })

  it('menampilkan halaman registrasi', async () => {
    const { wrapper } = await renderApp('/auth/register')

    expect(wrapper.element).toHaveTextContent('Buat akun baru')
  })

  it('menampilkan halaman 404 untuk alamat tidak dikenal', async () => {
    const { wrapper } = await renderApp('/ngawur')

    expect(wrapper.element).toHaveTextContent('Halaman tidak ditemukan')
  })

  it('menampilkan layout lelang dan halaman profil untuk pengguna login', async () => {
    putAccessToken('abc')

    const { wrapper } = await renderApp('/profile')

    expect(wrapper.element).toHaveTextContent('Dashboard Lelang')
    expect(wrapper.element).toHaveTextContent('Profil Saya')
    expect(wrapper.find('#name').element).toHaveValue('Feny Pasaribu')
  })
})