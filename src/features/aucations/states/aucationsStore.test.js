import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAucationsStore } from './aucationsStore'
import {
  getAucations,
  getAucation,
  postAucation,
  putAucation,
  postCover,
  deleteAucation,
  postBid,
  deleteBid,
  deleteAllAucations,
} from '../api/aucationApi'

vi.mock('../api/aucationApi', () => ({
  getAucations: vi.fn(),
  getAucation: vi.fn(),
  postAucation: vi.fn(),
  putAucation: vi.fn(),
  postCover: vi.fn(),
  deleteAucation: vi.fn(),
  postBid: vi.fn(),
  deleteBid: vi.fn(),
  deleteAllAucations: vi.fn(),
}))

beforeEach(() => {
  vi.resetAllMocks()
  setActivePinia(createPinia())
})

describe('fetchAucations', () => {
  it('menyimpan daftar lelang dan meneruskan filter', async () => {
    getAucations.mockResolvedValue({
      status: 'success',
      data: { aucations: [{ id: 1 }, { id: 2 }] },
    })
    const store = useAucationsStore()

    const result = await store.fetchAucations({ isMe: true })

    expect(result).toBe(true)
    expect(getAucations).toHaveBeenCalledWith({ isMe: true })
    expect(store.aucations).toEqual([{ id: 1 }, { id: 2 }])
    expect(store.isAucation).toBe(false)
  })

  it('memakai filter kosong jika tidak diberikan', async () => {
    getAucations.mockResolvedValue({ status: 'success', data: { aucations: [] } })
    const store = useAucationsStore()

    await store.fetchAucations()

    expect(getAucations).toHaveBeenCalledWith({})
  })

  it('memakai pesan dari API saat gagal', async () => {
    getAucations.mockResolvedValue({ status: 'fail', message: 'Unauthenticated.' })
    const store = useAucationsStore()

    const result = await store.fetchAucations()

    expect(result).toBe(false)
    expect(store.message).toBe('Unauthenticated.')
  })

  it('memakai pesan bawaan jika API tidak memberi pesan', async () => {
    getAucations.mockResolvedValue({ status: 'fail' })
    const store = useAucationsStore()

    await store.fetchAucations()

    expect(store.message).toBe('Gagal memuat data lelang')
  })

  it('mengatur isAucation selama proses', async () => {
    let resolveRequest
    getAucations.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const store = useAucationsStore()

    const pending = store.fetchAucations()
    expect(store.isAucation).toBe(true)

    resolveRequest({ status: 'fail' })
    await pending
    expect(store.isAucation).toBe(false)
  })
})

describe('fetchAucation', () => {
  it('menyimpan detail lelang saat berhasil', async () => {
    getAucation.mockResolvedValue({
      status: 'success',
      data: { aucation: { id: 7, title: 'Oculus' } },
    })
    const store = useAucationsStore()

    const result = await store.fetchAucation(7)

    expect(result).toBe(true)
    expect(getAucation).toHaveBeenCalledWith(7)
    expect(store.aucation).toEqual({ id: 7, title: 'Oculus' })
    expect(store.isAucation).toBe(false)
  })

  it('mengosongkan detail sebelumnya dan memakai pesan API saat gagal', async () => {
    getAucation.mockResolvedValue({ status: 'fail', message: 'Data tidak ditemukan' })
    const store = useAucationsStore()
    store.aucation = { id: 1 }

    const result = await store.fetchAucation(9)

    expect(result).toBe(false)
    expect(store.aucation).toBeNull()
    expect(store.message).toBe('Data tidak ditemukan')
  })

  it('memakai pesan bawaan jika API tidak memberi pesan', async () => {
    getAucation.mockResolvedValue({ status: 'fail' })
    const store = useAucationsStore()

    await store.fetchAucation(9)

    expect(store.message).toBe('Gagal memuat detail lelang')
  })
})

const mutations = [
  {
    name: 'addAucation',
    api: postAucation,
    args: [{ title: 'A' }],
    pending: 'isAucationAdd',
    done: 'isAucationAdded',
    success: 'Berhasil menambahkan lelang',
    fail: 'Gagal menambahkan lelang',
  },
  {
    name: 'changeAucation',
    api: putAucation,
    args: [7, { title: 'B' }],
    pending: 'isAucationChange',
    done: 'isAucationChanged',
    success: 'Berhasil mengubah lelang',
    fail: 'Gagal mengubah lelang',
  },
  {
    name: 'changeCover',
    api: postCover,
    args: [7, new File(['x'], 'cover.jpg')],
    pending: 'isAucationChangeCover',
    done: 'isAucationChangedCover',
    success: 'Berhasil mengubah cover lelang',
    fail: 'Gagal mengubah cover lelang',
  },
  {
    name: 'removeAucation',
    api: deleteAucation,
    args: [7],
    pending: 'isAucationDelete',
    done: 'isAucationDeleted',
    success: 'Berhasil menghapus lelang',
    fail: 'Gagal menghapus lelang',
  },
  {
    name: 'addBid',
    api: postBid,
    args: [7, 6000000],
    pending: 'isBidAdd',
    done: 'isBidAdded',
    success: 'Berhasil mengajukan penawaran',
    fail: 'Gagal mengajukan penawaran',
  },
  {
    name: 'removeBid',
    api: deleteBid,
    args: [7],
    pending: 'isBidDelete',
    done: 'isBidDeleted',
    success: 'Berhasil menghapus penawaran',
    fail: 'Gagal menghapus penawaran',
  },
  {
    name: 'removeAllAucations',
    api: deleteAllAucations,
    args: [],
    pending: 'isAucationDeleteAll',
    done: 'isAucationDeletedAll',
    success: 'Berhasil menghapus semua lelang',
    fail: 'Gagal menghapus semua lelang',
  },
]

describe.each(mutations)('$name', ({ name, api, args, pending, done, success, fail }) => {
  it('berhasil dengan pesan dari API', async () => {
    api.mockResolvedValue({ status: 'success', message: 'Pesan dari API' })
    const store = useAucationsStore()

    const result = await store[name](...args)

    expect(result).toBe(true)
    expect(api).toHaveBeenCalledWith(...args)
    expect(store[done]).toBe(true)
    expect(store[pending]).toBe(false)
    expect(store.message).toBe('Pesan dari API')
  })

  it('berhasil dengan pesan bawaan', async () => {
    api.mockResolvedValue({ status: 'success' })
    const store = useAucationsStore()

    await store[name](...args)

    expect(store.message).toBe(success)
  })

  it('gagal dengan pesan dari API dan mereset penanda berhasil', async () => {
    api.mockResolvedValue({ status: 'fail', message: 'Data tidak valid' })
    const store = useAucationsStore()
    store[done] = true

    const result = await store[name](...args)

    expect(result).toBe(false)
    expect(store[done]).toBe(false)
    expect(store.message).toBe('Data tidak valid')
  })

  it('gagal dengan pesan bawaan', async () => {
    api.mockResolvedValue({ status: 'fail' })
    const store = useAucationsStore()

    await store[name](...args)

    expect(store.message).toBe(fail)
  })

  it('menandai proses berjalan selama permintaan', async () => {
    let resolveRequest
    api.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const store = useAucationsStore()

    const promise = store[name](...args)
    expect(store[pending]).toBe(true)

    resolveRequest({ status: 'fail' })
    await promise
    expect(store[pending]).toBe(false)
  })
})

describe('resetStatus', () => {
  it('mereset semua penanda berhasil', () => {
    const store = useAucationsStore()
    const doneFlags = mutations.map((item) => item.done)
    doneFlags.forEach((flag) => {
      store[flag] = true
    })

    store.resetStatus()

    doneFlags.forEach((flag) => {
      expect(store[flag]).toBe(false)
    })
  })
})