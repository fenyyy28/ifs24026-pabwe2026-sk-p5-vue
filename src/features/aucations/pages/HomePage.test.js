import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'

import {
  mount,
} from '@vue/test-utils'

import {
  createPinia,
  setActivePinia,
} from 'pinia'

import HomePage from './HomePage.vue'

import {
  useAucationsStore,
} from '../states/aucationsStore'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

const aucationData = [
  {
    id: 1,
    title: 'Lelang Laptop',
    description:
      'Laptop untuk kebutuhan kuliah.',
    start_bid: 100000,
    cover_url:
      'https://example.com/laptop.jpg',
    is_closed: 0,
    is_me: 1,
    bids: [
      {
        bid: 200000,
      },
    ],
  },
  {
    id: 2,
    title: 'Lelang Kamera',
    description:
      'Kamera digital bekas.',
    start_bid: 300000,
    is_closed: 1,
    is_me: 0,
    bids: [],
  },
]

function createTestPinia() {
  const pinia = createPinia()

  setActivePinia(pinia)

  return pinia
}

function mountComponent() {
  const pinia = createTestPinia()

  const store =
    useAucationsStore()

  store.fetchAucations =
    vi.fn().mockResolvedValue(true)

  store.isAucation = false

  return {
    wrapper: mount(HomePage, {
      global: {
        plugins: [pinia],
      },
    }),
    store,
  }
}

describe('HomePage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('menampilkan halaman daftar lelang', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.aucations =
      aucationData

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      'Daftar Lelang',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Lelang Laptop',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Lelang Kamera',
    )
  })

  it('memanggil fetchAucations ketika halaman dimuat', () => {
    const pinia = createTestPinia()

    const store =
      useAucationsStore()

    store.fetchAucations =
      vi.fn().mockResolvedValue(true)

    mount(HomePage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(
      store.fetchAucations,
    ).toHaveBeenCalled()
  })

  it('menampilkan loading ketika data sedang dimuat', async () => {
    const pinia = createTestPinia()

    const store =
      useAucationsStore()

    store.fetchAucations =
      vi.fn().mockResolvedValue(true)

    store.isAucation = true

    const wrapper = mount(HomePage, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      'Memuat data lelang...',
    )
  })

  it('menampilkan pesan error ketika data gagal dimuat', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false
    store.message =
      'Gagal memuat data lelang'
    store.aucations = []

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      'Gagal memuat data lelang',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Coba Lagi',
    )
  })

  it('menampilkan keadaan kosong ketika tidak ada lelang', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false
    store.message = ''
    store.aucations = []

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      'Belum ada lelang',
    )
  })

  it('menampilkan fallback ketika lelang tidak memiliki cover', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false

    store.aucations = [
      {
        id: 3,
        title: 'Lelang Barang',
        description: '',
        start_bid: 50000,
        is_closed: 0,
        bids: [],
      },
    ]

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      'Tidak ada cover',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Lelang Barang',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Tidak ada deskripsi.',
    )
  })

  it('menampilkan cover dari property cover', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false

    store.aucations = [
      {
        id: 4,
        title: 'Lelang HP',
        description: 'HP bekas',
        start_bid: 100000,
        cover:
          'https://example.com/hp.jpg',
        is_closed: false,
        bids: [],
      },
    ]

    await wrapper.vm.$nextTick()

    const image =
      wrapper.find('img')

    expect(
      image.exists(),
    ).toBe(true)

    expect(
      image.attributes('src'),
    ).toBe(
      'https://example.com/hp.jpg',
    )
  })

  it('menampilkan status aktif dan selesai', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false
    store.aucations =
      aucationData

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      'Aktif',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Selesai',
    )
  })

  it('menggunakan startBid ketika start_bid tidak tersedia', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false

    store.aucations = [
      {
        id: 5,
        title: 'Lelang Tablet',
        startBid: 400000,
        bids: [],
      },
    ]

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      '400.000',
    )
  })

  it('menggunakan bid amount ketika property bid tidak tersedia', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false

    store.aucations = [
      {
        id: 6,
        title: 'Lelang Monitor',
        start_bid: 100000,
        bids: [
          {
            amount: 250000,
          },
        ],
      },
    ]

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      '250.000',
    )
  })

  it('menggunakan bid price ketika bid dan amount tidak tersedia', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false

    store.aucations = [
      {
        id: 7,
        title: 'Lelang Keyboard',
        start_bid: 100000,
        bids: [
          {
            price: 300000,
          },
        ],
      },
    ]

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      '300.000',
    )
  })

  it('menggunakan 0 ketika nilai bid tidak tersedia', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.isAucation = false

    store.aucations = [
      {
        id: 8,
        title: 'Lelang Barang',
        bids: [
          {},
        ],
      },
    ]

    await wrapper.vm.$nextTick()

    expect(
      wrapper.text(),
    ).toContain(
      'Lelang Barang',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Rp',
    )

    expect(
      wrapper.text(),
    ).toContain(
      '0',
    )
  })

  it('memfilter lelang aktif', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.aucations =
      aucationData

    await wrapper.vm.$nextTick()

    store.fetchAucations =
      vi.fn().mockResolvedValue(true)

    await wrapper
      .findAll('button')
      .find(
        (button) =>
          button.text() ===
          'Lelang Aktif',
      )
      .trigger('click')

    expect(
      store.fetchAucations,
    ).toHaveBeenCalledWith({
      isClosed: 0,
    })
  })

  it('memfilter lelang selesai', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.aucations =
      aucationData

    await wrapper.vm.$nextTick()

    store.fetchAucations =
      vi.fn().mockResolvedValue(true)

    await wrapper
      .findAll('button')
      .find(
        (button) =>
          button.text() ===
          'Selesai',
      )
      .trigger('click')

    expect(
      store.fetchAucations,
    ).toHaveBeenCalledWith({
      isClosed: 1,
    })
  })

  it('memfilter lelang milik pengguna', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.aucations =
      aucationData

    await wrapper.vm.$nextTick()

    store.fetchAucations =
      vi.fn().mockResolvedValue(true)

    await wrapper
      .findAll('button')
      .find(
        (button) =>
          button.text() ===
          'Lelang Saya',
      )
      .trigger('click')

    expect(
      store.fetchAucations,
    ).toHaveBeenCalledWith({
      isMe: true,
    })
  })

  it('memuat semua lelang ketika filter semua dipilih', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.fetchAucations =
      vi.fn().mockResolvedValue(true)

    await wrapper
      .findAll('button')
      .find(
        (button) =>
          button.text() ===
          'Semua',
      )
      .trigger('click')

    expect(
      store.fetchAucations,
    ).toHaveBeenCalledWith()
  })

  it('memuat ulang data ketika tombol Muat Ulang ditekan', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.fetchAucations =
      vi.fn().mockResolvedValue(true)

    await wrapper
      .findAll('button')
      .find(
        (button) =>
          button.text() ===
          'Muat Ulang',
      )
      .trigger('click')

    expect(
      store.fetchAucations,
    ).toHaveBeenCalled()
  })

  it('membuka halaman detail ketika tombol Lihat Detail ditekan', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.aucations = [
      {
        id: 123,
        title: 'Lelang Laptop',
        start_bid: 100000,
        bids: [],
      },
    ]

    await wrapper.vm.$nextTick()

    const detailButton =
      wrapper
        .findAll('button')
        .find(
          (button) =>
            button.text() ===
            'Lihat Detail',
        )

    expect(
      detailButton,
    ).toBeDefined()

    await detailButton.trigger('click')

    expect(
      pushMock,
    ).toHaveBeenCalledWith(
      '/aucations/123',
    )
  })

  it('tidak melakukan navigasi jika id tidak tersedia', async () => {
    const {
      wrapper,
      store,
    } = mountComponent()

    store.aucations = [
      {
        title: 'Lelang Tanpa ID',
        start_bid: 100000,
        bids: [],
      },
    ]

    await wrapper.vm.$nextTick()

    const detailButton =
      wrapper
        .findAll('button')
        .find(
          (button) =>
            button.text() ===
            'Lihat Detail',
        )

    expect(
      detailButton,
    ).toBeDefined()

    await detailButton.trigger('click')

    expect(
      pushMock,
    ).not.toHaveBeenCalled()
  })
  it('menggunakan array kosong ketika data lelang bernilai null', async () => {
  const {
    wrapper,
    store,
  } = mountComponent()

  store.isAucation = false
  store.aucations = null
  store.message = ''

  await wrapper.vm.$nextTick()

  expect(
    wrapper.text(),
  ).toContain(
    'Belum ada lelang',
  )
})

it('menggunakan Tanpa Judul ketika title tidak tersedia', async () => {
  const {
    wrapper,
    store,
  } = mountComponent()

  store.isAucation = false

  store.aucations = [
    {
      id: 10,
      description: 'Barang tanpa judul',
      start_bid: 100000,
      bids: [],
    },
  ]

  await wrapper.vm.$nextTick()

  expect(
    wrapper.text(),
  ).toContain(
    'Tanpa Judul',
  )
})

it('menggunakan deskripsi fallback ketika description kosong', async () => {
  const {
    wrapper,
    store,
  } = mountComponent()

  store.isAucation = false

  store.aucations = [
    {
      id: 11,
      title: 'Lelang Tanpa Deskripsi',
      description: '',
      start_bid: 100000,
      bids: [],
    },
  ]

  await wrapper.vm.$nextTick()

  expect(
    wrapper.text(),
  ).toContain(
    'Tidak ada deskripsi.',
  )
})
it('menggunakan fallback ketika data lelang tidak memiliki property bids', async () => {
  const {
    wrapper,
    store,
  } = mountComponent()

  store.isAucation = false

  store.aucations = [
    {
      id: 12,
      title: 'Lelang Tanpa Data Bid',
      description: 'Barang tanpa data bid',
      start_bid: 750000,
      is_closed: 0,
    },
  ]

  await wrapper.vm.$nextTick()

  expect(
    wrapper.text(),
  ).toContain(
    'Lelang Tanpa Data Bid',
  )

  expect(
    wrapper.text(),
  ).toContain(
    '750.000',
  )
})
})