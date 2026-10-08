import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from './usersStore'
import {
  getUsers,
  getProfile,
  putProfile,
  postPhoto,
  putPassword,
} from '../api/userApi'

vi.mock('../api/userApi', () => ({
  getUsers: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}))

const profile = { id: 1, name: 'Feny', email: 'a@b.co', photo: null }
const profileResponse = { status: 'success', data: { user: profile } }

beforeEach(() => {
  vi.resetAllMocks()
  setActivePinia(createPinia())
})

describe('fetchUsers', () => {
  it('menyimpan daftar pengguna saat berhasil', async () => {
    getUsers.mockResolvedValue({
      status: 'success',
      data: { users: [{ id: 1, name: 'A' }] },
    })
    const store = useUsersStore()

    const result = await store.fetchUsers()

    expect(result).toBe(true)
    expect(store.users).toEqual([{ id: 1, name: 'A' }])
    expect(store.isLoading).toBe(false)
  })

  it('memakai pesan dari API saat gagal', async () => {
    getUsers.mockResolvedValue({ status: 'fail', message: 'Tidak berwenang' })
    const store = useUsersStore()

    const result = await store.fetchUsers()

    expect(result).toBe(false)
    expect(store.message).toBe('Tidak berwenang')
  })

  it('memakai pesan bawaan jika API tidak memberi pesan', async () => {
    getUsers.mockResolvedValue({ status: 'fail' })
    const store = useUsersStore()

    await store.fetchUsers()

    expect(store.message).toBe('Gagal memuat data pengguna')
  })

  it('mengatur isLoading selama proses', async () => {
    let resolveRequest
    getUsers.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const store = useUsersStore()

    const pending = store.fetchUsers()
    expect(store.isLoading).toBe(true)

    resolveRequest({ status: 'fail' })
    await pending
    expect(store.isLoading).toBe(false)
  })
})

describe('selectUser dan clearUser', () => {
  it('memilih pengguna berdasarkan id lalu menghapus pilihan', () => {
    const store = useUsersStore()
    store.users = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]

    store.selectUser(2)
    expect(store.user).toEqual({ id: 2, name: 'B' })

    store.clearUser()
    expect(store.user).toBeNull()
  })

  it('menghasilkan null jika id tidak ditemukan', () => {
    const store = useUsersStore()
    store.users = [{ id: 1, name: 'A' }]

    store.selectUser(99)

    expect(store.user).toBeNull()
  })
})

describe('fetchProfile', () => {
  it('menyimpan profil saat berhasil', async () => {
    getProfile.mockResolvedValue(profileResponse)
    const store = useUsersStore()

    const result = await store.fetchProfile()

    expect(result).toBe(true)
    expect(store.profile).toEqual(profile)
    expect(store.isLoading).toBe(false)
  })

  it('mengembalikan false dengan pesan dari API saat gagal', async () => {
    getProfile.mockResolvedValue({ status: 'fail', message: 'Token tidak valid' })
    const store = useUsersStore()

    const result = await store.fetchProfile()

    expect(result).toBe(false)
    expect(store.profile).toBeNull()
    expect(store.message).toBe('Token tidak valid')
  })

  it('memakai pesan bawaan jika API tidak memberi pesan', async () => {
    getProfile.mockResolvedValue({ status: 'fail' })
    const store = useUsersStore()

    await store.fetchProfile()

    expect(store.message).toBe('Gagal memuat profil')
  })
})

describe('updateProfile', () => {
  it('mengirim data lalu menyegarkan profil', async () => {
    putProfile.mockResolvedValue({ status: 'success', message: 'Berhasil mengubah data' })
    getProfile.mockResolvedValue(profileResponse)
    const store = useUsersStore()

    const result = await store.updateProfile({ name: 'Feny', email: 'a@b.co' })

    expect(result).toBe(true)
    expect(putProfile).toHaveBeenCalledWith({ name: 'Feny', email: 'a@b.co' })
    expect(getProfile).toHaveBeenCalledTimes(1)
    expect(store.profile).toEqual(profile)
    expect(store.message).toBe('Berhasil mengubah data')
    expect(store.isMutating).toBe(false)
  })

  it('memakai pesan bawaan saat berhasil tanpa pesan API', async () => {
    putProfile.mockResolvedValue({ status: 'success' })
    getProfile.mockResolvedValue(profileResponse)
    const store = useUsersStore()

    await store.updateProfile({})

    expect(store.message).toBe('Berhasil mengubah profil')
  })

  it('tidak menyegarkan profil saat gagal', async () => {
    putProfile.mockResolvedValue({ status: 'fail', message: 'Email sudah dipakai' })
    const store = useUsersStore()

    const result = await store.updateProfile({})

    expect(result).toBe(false)
    expect(getProfile).not.toHaveBeenCalled()
    expect(store.message).toBe('Email sudah dipakai')
  })

  it('memakai pesan bawaan saat gagal tanpa pesan API', async () => {
    putProfile.mockResolvedValue({ status: 'fail' })
    const store = useUsersStore()

    await store.updateProfile({})

    expect(store.message).toBe('Gagal mengubah profil')
  })

  it('mengatur isMutating selama proses', async () => {
    let resolveRequest
    putProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const store = useUsersStore()

    const pending = store.updateProfile({})
    expect(store.isMutating).toBe(true)

    resolveRequest({ status: 'fail' })
    await pending
    expect(store.isMutating).toBe(false)
  })
})

describe('changePhoto', () => {
  it('mengunggah foto lalu menyegarkan profil', async () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    postPhoto.mockResolvedValue({ status: 'success' })
    getProfile.mockResolvedValue(profileResponse)
    const store = useUsersStore()

    const result = await store.changePhoto(file)

    expect(result).toBe(true)
    expect(postPhoto).toHaveBeenCalledWith(file)
    expect(getProfile).toHaveBeenCalledTimes(1)
    expect(store.message).toBe('Berhasil mengubah foto profil')
  })

  it('mengembalikan false saat gagal', async () => {
    postPhoto.mockResolvedValue({ status: 'fail' })
    const store = useUsersStore()

    const result = await store.changePhoto(new File(['x'], 'a.png'))

    expect(result).toBe(false)
    expect(store.message).toBe('Gagal mengubah foto profil')
    expect(getProfile).not.toHaveBeenCalled()
  })
})

describe('changePassword', () => {
  it('berhasil tanpa menyegarkan profil', async () => {
    putPassword.mockResolvedValue({ success: true })
    const store = useUsersStore()

    const result = await store.changePassword({ password: 'rahasia1' })

    expect(result).toBe(true)
    expect(putPassword).toHaveBeenCalledWith({ password: 'rahasia1' })
    expect(getProfile).not.toHaveBeenCalled()
    expect(store.message).toBe('Berhasil mengubah kata sandi')
  })

  it('mengembalikan false dengan pesan dari API saat gagal', async () => {
    putPassword.mockResolvedValue({ status: 'fail', message: 'Kata sandi terlalu lemah' })
    const store = useUsersStore()

    const result = await store.changePassword({ password: '1' })

    expect(result).toBe(false)
    expect(store.message).toBe('Kata sandi terlalu lemah')
  })

  it('memakai pesan bawaan saat gagal tanpa pesan API', async () => {
    putPassword.mockResolvedValue({ status: 'fail' })
    const store = useUsersStore()

    await store.changePassword({ password: '1' })

    expect(store.message).toBe('Gagal mengubah kata sandi')
  })
})

describe('clearState', () => {
  it('mengosongkan semua data pengguna', () => {
    const store = useUsersStore()
    store.users = [{ id: 1 }]
    store.user = { id: 1 }
    store.profile = { id: 1 }
    store.message = 'Pesan lama'

    store.clearState()

    expect(store.users).toEqual([])
    expect(store.user).toBeNull()
    expect(store.profile).toBeNull()
    expect(store.message).toBe('')
  })
})