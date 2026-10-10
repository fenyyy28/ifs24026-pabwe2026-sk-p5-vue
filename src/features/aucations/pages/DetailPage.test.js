
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  flushPromises,
  mount,
} from '@vue/test-utils'

import {
  defineComponent,
  h,
  nextTick,
  reactive,
} from 'vue'

import DetailPage from './DetailPage.vue'

const mocks = vi.hoisted(() => ({
  route: {
    params: {
      id: '1',
    },
  },
  router: {
    push: vi.fn(),
  },
  store: {
    fetchAucation: vi.fn(),
    removeAucation: vi.fn(),
    aucation: null,
    isAucation: false,
    message: '',
  },
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

mocks.store = reactive(mocks.store)

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router,
}))

vi.mock('../states/aucationsStore', () => ({
  useAucationsStore: () => mocks.store,
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: mocks.showErrorDialog,
  showSuccessDialog: mocks.showSuccessDialog,
}))

function makeAucation(overrides = {}) {
  return {
    id: 1,
    title: 'Lelang Laptop',
    description: 'Laptop bekas dengan kondisi baik',
    start_bid: 1000000,
    cover: null,
    cover_url: '',
    is_me: false,
    is_closed: false,
    bids: [],
    ...overrides,
  }
}

const aucationData = makeAucation()

function createModalStub(name) {
  return defineComponent({
    name,
    props: ['aucation'],
    emits: ['close', 'changed'],
    setup(_, { emit }) {
      return () => h('div', [
        h(
          'button',
          {
            type: 'button',
            onClick: () => emit('close'),
          },
          'Tutup Modal',
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => emit('changed'),
          },
          'Simpan Perubahan',
        ),
      ])
    },
  })
}

const modalStubs = {
  BidModal: createModalStub('BidModal'),
  ChangeModal: createModalStub('ChangeModal'),
  ChangeCoverModal: createModalStub('ChangeCoverModal'),
}

function mountComponent(data = aucationData, state = {}) {
  mocks.store.aucation = data
  mocks.store.isAucation = state.isAucation ?? false
  mocks.store.message = state.message ?? ''

  return mount(DetailPage, {
    global: {
      stubs: modalStubs,
    },
  })
}

async function settle() {
  await flushPromises()
  await nextTick()
}

function findButton(wrapper, text) {
  return wrapper.findAll('button').find((button) =>
    button.text().includes(text),
  )
}

async function openModal(wrapper, buttonText, modalName) {
  const button = findButton(wrapper, buttonText)

  expect(button).toBeTruthy()

  await button.trigger('click')
  await settle()

  const modal = wrapper.findComponent({
    name: modalName,
  })

  expect(modal.exists()).toBe(true)

  return modal
}

describe('DetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.route.params.id = '1'

    mocks.store.aucation = null
    mocks.store.isAucation = false
    mocks.store.message = ''

    mocks.store.fetchAucation.mockResolvedValue(true)
    mocks.store.removeAucation.mockResolvedValue(true)
  })

  // Rendering dan pemuatan detail

  it('merender halaman detail lelang', async () => {
    const wrapper = mountComponent()

    await settle()

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('memanggil fetchAucation dengan ID dari route', async () => {
    const wrapper = mountComponent()

    await settle()

    expect(mocks.store.fetchAucation).toHaveBeenCalledWith('1')

    wrapper.unmount()
  })

  it('menggunakan ID route terbaru ketika halaman dimuat', async () => {
    mocks.route.params.id = '10'

    const wrapper = mountComponent()

    await settle()

    expect(mocks.store.fetchAucation).toHaveBeenCalledWith('10')

    wrapper.unmount()
  })

  it('menampilkan informasi lelang ketika data tersedia', async () => {
    const wrapper = mountComponent()

    await settle()

    expect(wrapper.text()).toContain('Lelang Laptop')
    expect(wrapper.text()).toContain('Laptop bekas dengan kondisi baik')

    wrapper.unmount()
  })

  it('menampilkan loading saat detail sedang dimuat', async () => {
    mocks.store.fetchAucation.mockImplementation(
      () => new Promise(() => {}),
    )

    const wrapper = mountComponent(null, {
      isAucation: true,
    })

    await settle()

    expect(wrapper.text()).toContain('Memuat detail lelang...')

    wrapper.unmount()
  })

  it('menampilkan pesan error jika detail tidak ditemukan', async () => {
    mocks.store.fetchAucation.mockResolvedValue(false)

    const wrapper = mountComponent(null, {
      message: 'Gagal memuat detail lelang',
    })

    await settle()

    expect(wrapper.text()).toContain('Gagal memuat detail lelang')
    expect(findButton(wrapper, 'Coba Lagi')).toBeTruthy()

    wrapper.unmount()
  })

  it('mencoba memuat ulang detail ketika tombol Coba Lagi ditekan', async () => {
    mocks.store.fetchAucation.mockResolvedValue(false)

    const wrapper = mountComponent(null, {
      message: 'Gagal memuat detail',
    })

    await settle()

    const retryButton = findButton(wrapper, 'Coba Lagi')

    expect(retryButton).toBeTruthy()

    mocks.store.fetchAucation.mockClear()
    mocks.store.fetchAucation.mockResolvedValue(true)

    await retryButton.trigger('click')
    await settle()

    expect(mocks.store.fetchAucation).toHaveBeenCalledWith('1')

    wrapper.unmount()
  })

  it('menampilkan kondisi data lelang kosong tanpa pesan error', async () => {
    const wrapper = mountComponent(null)

    await settle()

    expect(wrapper.text()).toContain('Data lelang tidak ditemukan')
    expect(wrapper.text()).toContain('Lelang yang kamu cari tidak tersedia.')

    wrapper.unmount()
  })

  it('menampilkan dialog error ketika ID route tidak tersedia', async () => {
    mocks.route.params.id = ''

    const wrapper = mountComponent()

    await settle()

    expect(mocks.showErrorDialog).toHaveBeenCalledWith(
      'ID lelang tidak ditemukan',
    )
    expect(mocks.store.fetchAucation).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('dapat dibongkar tanpa error', async () => {
    const wrapper = mountComponent()

    await settle()

    expect(() => wrapper.unmount()).not.toThrow()
  })

  // Judul, deskripsi, cover, dan harga

  it('menggunakan judul dan deskripsi default jika kosong', async () => {
    const wrapper = mountComponent(
      makeAucation({
        title: '',
        description: '',
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('Tanpa Judul')
    expect(wrapper.text()).toContain('Tidak ada deskripsi.')

    wrapper.unmount()
  })

  it('menampilkan cover dari cover_url', async () => {
    const wrapper = mountComponent(
      makeAucation({
        cover_url: 'https://example.com/cover.jpg',
      }),
    )

    await settle()

    const image = wrapper.find('img')

    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('https://example.com/cover.jpg')
    expect(image.attributes('alt')).toBe('Cover Lelang Laptop')

    wrapper.unmount()
  })

  it('menggunakan cover jika cover_url kosong', async () => {
    const wrapper = mountComponent(
      makeAucation({
        cover_url: '',
        cover: 'https://example.com/alternate.jpg',
      }),
    )

    await settle()

    expect(wrapper.find('img').attributes('src')).toBe(
      'https://example.com/alternate.jpg',
    )

    wrapper.unmount()
  })

  it('menampilkan placeholder ketika cover tidak tersedia', async () => {
    const wrapper = mountComponent(
      makeAucation({
        cover_url: '',
        cover: null,
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('Tidak ada cover')
    expect(wrapper.find('img').exists()).toBe(false)

    wrapper.unmount()
  })

  it('menggunakan startBid sebagai alternatif harga awal', async () => {
    const wrapper = mountComponent(
      makeAucation({
        start_bid: null,
        startBid: 2500000,
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('2.500.000')

    wrapper.unmount()
  })

  it('menggunakan nol jika harga awal tidak tersedia', async () => {
    const wrapper = mountComponent(
      makeAucation({
        start_bid: null,
        startBid: null,
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('Harga awal')
    expect(wrapper.text()).toContain('Rp')

    wrapper.unmount()
  })

  // Status pemilik dan status lelang

  it.each([true, 1, '1'])(
    'menampilkan label Lelang Saya jika is_me bernilai %s',
    async (isMe) => {
      const wrapper = mountComponent(
        makeAucation({
          is_me: isMe,
        }),
      )

      await settle()

      expect(wrapper.text()).toContain('Lelang Saya')
      expect(findButton(wrapper, 'Ubah Lelang')).toBeTruthy()
      expect(findButton(wrapper, 'Ubah Cover')).toBeTruthy()
      expect(findButton(wrapper, 'Hapus Lelang')).toBeTruthy()

      wrapper.unmount()
    },
  )

  it('menampilkan tombol Ajukan Bid untuk lelang aktif milik orang lain', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: false,
        is_closed: false,
      }),
    )

    await settle()

    expect(findButton(wrapper, 'Ajukan Bid')).toBeTruthy()
    expect(findButton(wrapper, 'Ubah Lelang')).toBeFalsy()

    wrapper.unmount()
  })

  it('menyembunyikan tombol Ajukan Bid jika lelang sudah ditutup', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: false,
        is_closed: true,
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('Selesai')
    expect(findButton(wrapper, 'Ajukan Bid')).toBeFalsy()

    wrapper.unmount()
  })

  it.each([true, 1, '1'])(
    'menampilkan status Selesai jika is_closed bernilai %s',
    async (isClosed) => {
      const wrapper = mountComponent(
        makeAucation({
          is_closed: isClosed,
        }),
      )

      await settle()

      expect(wrapper.text()).toContain('Selesai')

      wrapper.unmount()
    },
  )

  it('menampilkan status Aktif jika lelang belum ditutup', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_closed: false,
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('Aktif')

    wrapper.unmount()
  })

  // Riwayat penawaran

  it('menampilkan pesan jika belum ada penawaran', async () => {
    const wrapper = mountComponent(
      makeAucation({
        start_bid: 500000,
        bids: [],
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('0 penawaran')
    expect(wrapper.text()).toContain('Belum ada penawaran.')
    expect(wrapper.text()).toContain('500.000')

    wrapper.unmount()
  })

  it('menggunakan daftar penawaran kosong jika bids bernilai undefined', async () => {
    const data = makeAucation()
    delete data.bids

    const wrapper = mountComponent(data)

    await settle()

    expect(wrapper.text()).toContain('0 penawaran')
    expect(wrapper.text()).toContain('Belum ada penawaran.')

    wrapper.unmount()
  })

  it('menggunakan daftar penawaran kosong jika bids bernilai null', async () => {
    const wrapper = mountComponent(
      makeAucation({
        bids: null,
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('0 penawaran')
    expect(wrapper.text()).toContain('Belum ada penawaran.')

    wrapper.unmount()
  })

  it('menampilkan bid tertinggi dari daftar penawaran', async () => {
    const wrapper = mountComponent(
      makeAucation({
        bids: [
          {
            id: 1,
            bid: 1500000,
            user: { name: 'Andi' },
            created_at: '2026-10-01T10:00:00.000Z',
          },
          {
            id: 2,
            bid: 2500000,
            user: { name: 'Budi' },
            created_at: '2026-10-02T10:00:00.000Z',
          },
        ],
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('2 penawaran')
    expect(wrapper.text()).toContain('Andi')
    expect(wrapper.text()).toContain('Budi')
    expect(wrapper.text()).toContain('2.500.000')

    wrapper.unmount()
  })

  it('mendukung variasi format harga dan nama penawar', async () => {
    const wrapper = mountComponent(
      makeAucation({
        bids: [
          {
            id: 1,
            amount: 1200000,
            user: {
              username: 'user_satu',
            },
            createdAt: '2026-10-01T10:00:00.000Z',
          },
          {
            id: 2,
            price: 1300000,
            username: 'user_dua',
          },
          {
            id: 3,
            bid: 1400000,
            name: 'User Tiga',
          },
          {
            id: 4,
          },
        ],
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('user_satu')
    expect(wrapper.text()).toContain('user_dua')
    expect(wrapper.text()).toContain('User Tiga')
    expect(wrapper.text()).toContain('Pengguna')
    expect(wrapper.text()).toContain('1.200.000')
    expect(wrapper.text()).toContain('1.300.000')
    expect(wrapper.text()).toContain('1.400.000')

    wrapper.unmount()
  })

  it('menggunakan index sebagai key alternatif jika bid tidak memiliki ID', async () => {
    const wrapper = mountComponent(
      makeAucation({
        bids: [
          {
            bid: 1000000,
            user: { name: 'Pengguna Tanpa ID' },
            created_at: '2026-10-01T10:00:00.000Z',
          },
        ],
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('Pengguna Tanpa ID')
    expect(wrapper.text()).toContain('1.000.000')

    wrapper.unmount()
  })

  it('menampilkan tanda minus untuk tanggal bid yang kosong', async () => {
    const wrapper = mountComponent(
      makeAucation({
        bids: [
          {
            id: 1,
            bid: 1000000,
            created_at: '',
          },
        ],
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('Pengguna')
    expect(wrapper.text()).toContain('1.000.000')

    wrapper.unmount()
  })

  it('menampilkan nilai tanggal asli jika format tanggal tidak valid', async () => {
    const wrapper = mountComponent(
      makeAucation({
        bids: [
          {
            id: 1,
            bid: 1000000,
            created_at: 'tanggal-tidak-valid',
          },
        ],
      }),
    )

    await settle()

    expect(wrapper.text()).toContain('tanggal-tidak-valid')

    wrapper.unmount()
  })

  // Navigasi

  it('kembali ke halaman daftar lelang', async () => {
    const wrapper = mountComponent()

    await settle()

    const button = findButton(wrapper, 'Kembali')

    expect(button).toBeTruthy()

    await button.trigger('click')

    expect(mocks.router.push).toHaveBeenCalledWith('/aucations')

    wrapper.unmount()
  })

  // Modal bid

  it('membuka dan menutup modal bid', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: false,
        is_closed: false,
      }),
    )

    await settle()

    const modal = await openModal(wrapper, 'Ajukan Bid', 'BidModal')

    expect(modal.props('aucation').title).toBe('Lelang Laptop')

    await modal.findAll('button')[0].trigger('click')
    await settle()

    expect(wrapper.findComponent({ name: 'BidModal' }).exists()).toBe(false)

    wrapper.unmount()
  })

  it('memuat ulang detail setelah bid berubah', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: false,
        is_closed: false,
      }),
    )

    await settle()

    const modal = await openModal(wrapper, 'Ajukan Bid', 'BidModal')

    mocks.store.fetchAucation.mockClear()

    await modal.findAll('button')[1].trigger('click')
    await settle()

    expect(mocks.store.fetchAucation).toHaveBeenCalledWith('1')
    expect(wrapper.findComponent({ name: 'BidModal' }).exists()).toBe(false)

    wrapper.unmount()
  })

  // Modal perubahan lelang

  it('membuka dan menutup modal perubahan lelang', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: true,
      }),
    )

    await settle()

    const modal = await openModal(wrapper, 'Ubah Lelang', 'ChangeModal')

    await modal.findAll('button')[0].trigger('click')
    await settle()

    expect(wrapper.findComponent({ name: 'ChangeModal' }).exists()).toBe(false)

    wrapper.unmount()
  })

  it('memuat ulang detail setelah informasi lelang berubah', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: true,
      }),
    )

    await settle()

    const modal = await openModal(wrapper, 'Ubah Lelang', 'ChangeModal')

    mocks.store.fetchAucation.mockClear()

    await modal.findAll('button')[1].trigger('click')
    await settle()

    expect(mocks.store.fetchAucation).toHaveBeenCalledWith('1')
    expect(wrapper.findComponent({ name: 'ChangeModal' }).exists()).toBe(false)

    wrapper.unmount()
  })

  // Modal perubahan cover

  it('membuka dan menutup modal perubahan cover', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: true,
      }),
    )

    await settle()

    const modal = await openModal(wrapper, 'Ubah Cover', 'ChangeCoverModal')

    await modal.findAll('button')[0].trigger('click')
    await settle()

    expect(wrapper.findComponent({ name: 'ChangeCoverModal' }).exists()).toBe(false)

    wrapper.unmount()
  })

  it('memuat ulang detail setelah cover berubah', async () => {
    const wrapper = mountComponent(
      makeAucation({
        is_me: true,
      }),
    )

    await settle()

    const modal = await openModal(wrapper, 'Ubah Cover', 'ChangeCoverModal')

    mocks.store.fetchAucation.mockClear()

    await modal.findAll('button')[1].trigger('click')
    await settle()

    expect(mocks.store.fetchAucation).toHaveBeenCalledWith('1')
    expect(wrapper.findComponent({ name: 'ChangeCoverModal' }).exists()).toBe(false)

    wrapper.unmount()
  })

  // Penghapusan lelang

  it('menampilkan error jika data lelang tidak memiliki ID', async () => {
    const wrapper = mountComponent(
      makeAucation({
        id: null,
        is_me: true,
      }),
    )

    await settle()

    await findButton(wrapper, 'Hapus Lelang').trigger('click')
    await settle()

    expect(mocks.showErrorDialog).toHaveBeenCalledWith(
      'Data lelang tidak ditemukan',
    )
    expect(mocks.store.removeAucation).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('menampilkan error jika penghapusan gagal dengan pesan dari store', async () => {
    mocks.store.removeAucation.mockResolvedValue(false)

    const wrapper = mountComponent(
      makeAucation({ is_me: true }),
      {
        message: 'Tidak dapat menghapus lelang',
      },
    )

    await settle()

    await findButton(wrapper, 'Hapus Lelang').trigger('click')
    await settle()

    expect(mocks.store.removeAucation).toHaveBeenCalledWith(1)
    expect(mocks.showErrorDialog).toHaveBeenCalledWith(
      'Tidak dapat menghapus lelang',
    )
    expect(mocks.showSuccessDialog).not.toHaveBeenCalled()
    expect(mocks.router.push).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('menggunakan pesan default jika penghapusan gagal tanpa pesan', async () => {
    mocks.store.removeAucation.mockResolvedValue(false)

    const wrapper = mountComponent(
      makeAucation({
        is_me: true,
      }),
    )

    await settle()

    await findButton(wrapper, 'Hapus Lelang').trigger('click')
    await settle()

    expect(mocks.showErrorDialog).toHaveBeenCalledWith(
      'Gagal menghapus lelang',
    )

    wrapper.unmount()
  })

  it('menghapus lelang dan kembali ke daftar ketika berhasil', async () => {
    mocks.store.removeAucation.mockResolvedValue(true)

    const wrapper = mountComponent(
      makeAucation({ is_me: true }),
      {
        message: 'Berhasil menghapus lelang',
      },
    )

    await settle()

    await findButton(wrapper, 'Hapus Lelang').trigger('click')
    await settle()

    expect(mocks.store.removeAucation).toHaveBeenCalledWith(1)
    expect(mocks.showSuccessDialog).toHaveBeenCalledWith(
      'Berhasil menghapus lelang',
    )
    expect(mocks.router.push).toHaveBeenCalledWith('/aucations')

    wrapper.unmount()
  })

  it('menggunakan pesan sukses default jika store tidak memiliki pesan', async () => {
    mocks.store.removeAucation.mockResolvedValue(true)

    const wrapper = mountComponent(
      makeAucation({
        is_me: true,
      }),
    )

    await settle()

    await findButton(wrapper, 'Hapus Lelang').trigger('click')
    await settle()

    expect(mocks.showSuccessDialog).toHaveBeenCalledWith(
      'Berhasil menghapus lelang',
    )

    wrapper.unmount()
  })

  it('mengabaikan penghapusan kedua ketika proses masih berlangsung', async () => {
    let resolveRemoval

    mocks.store.removeAucation.mockImplementation(
      () => new Promise((resolve) => {
        resolveRemoval = resolve
      }),
    )

    const wrapper = mountComponent(
      makeAucation({ is_me: true }),
    )

    await settle()

    const button = findButton(wrapper, 'Hapus Lelang')

    const firstClick = button.trigger('click')
    const secondClick = button.trigger('click')

    await Promise.all([firstClick, secondClick])
    await nextTick()

    expect(mocks.store.removeAucation).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Menghapus...')

    resolveRemoval(true)
    await settle()

    expect(mocks.showSuccessDialog).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('menampilkan status Menghapus selama penghapusan berlangsung', async () => {
    let resolveRemoval

    mocks.store.removeAucation.mockImplementation(
      () => new Promise((resolve) => {
        resolveRemoval = resolve
      }),
    )

    const wrapper = mountComponent(
      makeAucation({
        is_me: true,
      }),
    )

    await settle()

    await findButton(wrapper, 'Hapus Lelang').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Menghapus...')
    expect(
      findButton(wrapper, 'Menghapus...').attributes('disabled'),
    ).toBeDefined()

    resolveRemoval(true)
    await settle()

    expect(mocks.showSuccessDialog).toHaveBeenCalled()

    wrapper.unmount()
  })
})
