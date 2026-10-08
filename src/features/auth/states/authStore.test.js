import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore'
import { postLogin, postRegister } from '../api/authApi'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper'

vi.mock('../api/authApi', () => ({ postLogin: vi.fn(), postRegister: vi.fn() }))

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
  setActivePinia(createPinia())
})

describe('state awal', () => {
  it('belum login jika tidak ada token', () => {
    const store = useAuthStore()
    expect(store.token).toBeNull()
    expect(store.isAuthLogin).toBe(false)
    expect(store.isAuthRegister).toBe(false)
    expect(store.isAuthLogout).toBe(false)
  })

  it('dianggap login jika token tersimpan', () => {
    putAccessToken('abc')
    setActivePinia(createPinia())

    const store = useAuthStore()
    expect(store.token).toBe('abc')
    expect(store.isAuthLogin).toBe(true)
  })
})

describe('login', () => {
  it('menyimpan token dan user saat berhasil', async () => {
    postLogin.mockResolvedValue({
      status: 'success',
      message: 'Berhasil login',
      data: { token: 'token-1', user: { id: 1, name: 'Feny' } },
    })
    const store = useAuthStore()

    const result = await store.login({ email: 'a@b.co', password: 'x' })

    expect(result).toBe(true)
    expect(store.token).toBe('token-1')
    expect(store.user).toEqual({ id: 1, name: 'Feny' })
    expect(store.isAuthLogin).toBe(true)
    expect(store.isAuthLogout).toBe(false)
    expect(store.message).toBe('Berhasil login')
    expect(getAccessToken()).toBe('token-1')
  })

  it('mengembalikan false dan memakai pesan dari API saat gagal', async () => {
    postLogin.mockResolvedValue({ status: 'fail', message: 'Email salah' })
    const store = useAuthStore()

    const result = await store.login({})

    expect(result).toBe(false)
    expect(store.isAuthLogin).toBe(false)
    expect(store.message).toBe('Email salah')
    expect(getAccessToken()).toBeNull()
  })

  it('memakai pesan bawaan jika API tidak memberi pesan', async () => {
    postLogin.mockResolvedValue({ status: 'fail' })
    const store = useAuthStore()

    await store.login({})

    expect(store.message).toBe('Login gagal')
  })

  it('mengatur isLoading selama proses', async () => {
    let resolveLogin
    postLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve
      }),
    )
    const store = useAuthStore()

    const pending = store.login({})
    expect(store.isLoading).toBe(true)

    resolveLogin({ status: 'fail' })
    await pending
    expect(store.isLoading).toBe(false)
  })
})

describe('register', () => {
  it('berhasil dengan pesan dari API', async () => {
    postRegister.mockResolvedValue({ success: true, message: 'Berhasil melakukan pendaftaran' })
    const store = useAuthStore()

    const result = await store.register({})

    expect(result).toBe(true)
    expect(store.isAuthRegister).toBe(true)
    expect(store.message).toBe('Berhasil melakukan pendaftaran')
    expect(store.isLoading).toBe(false)
  })

  it('gagal dengan pesan dari API', async () => {
    postRegister.mockResolvedValue({ status: 'fail', message: 'Email sudah dipakai' })
    const store = useAuthStore()

    const result = await store.register({})

    expect(result).toBe(false)
    expect(store.isAuthRegister).toBe(false)
    expect(store.message).toBe('Email sudah dipakai')
  })

  it('memakai pesan bawaan jika API tidak memberi pesan', async () => {
    const store = useAuthStore()

    postRegister.mockResolvedValue({ status: 'success' })
    await store.register({})
    expect(store.message).toBe('Berhasil mendaftar')

    postRegister.mockResolvedValue({ status: 'fail' })
    await store.register({})
    expect(store.message).toBe('Pendaftaran gagal')
  })
})

describe('logout', () => {
  it('menghapus token dan menandai logout', async () => {
    putAccessToken('abc')
    setActivePinia(createPinia())
    const store = useAuthStore()

    const result = await store.logout()

    expect(result).toBe(true)
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthLogin).toBe(false)
    expect(store.isAuthLogout).toBe(true)
    expect(getAccessToken()).toBeNull()
  })
})