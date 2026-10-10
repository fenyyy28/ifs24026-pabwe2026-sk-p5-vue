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

import BidModal from './BidModal.vue'

import {
  useAucationsStore,
} from '../states/aucationsStore'

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const auction = {
  id: 1,
  title: 'Lelang Laptop',
  start_bid: 100000,
  bids: [
    {
      bid: 150000,
    },
    {
      bid: 200000,
    },
  ],
}

const auctionWithoutBids = {
  id: 2,
  title: 'Lelang Kamera',
  start_bid: 300000,
  bids: [],
}

const auctionWithAmountBids = {
  id: 3,
  title: 'Lelang HP',
  start_bid: 100000,
  bids: [
    {
      amount: 250000,
    },
  ],
}

const auctionWithPriceBids = {
  id: 4,
  title: 'Lelang Tablet',
  start_bid: 100000,
  bids: [
    {
      price: 350000,
    },
  ],
}

function mountComponent(props = {}) {
  const pinia = createPinia()

  setActivePinia(pinia)

  return mount(BidModal, {
    props: {
      aucation: auction,
      ...props,
    },
    global: {
      plugins: [pinia],
    },
  })
}

describe('BidModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('menampilkan modal dan informasi bid tertinggi', () => {
    const wrapper = mountComponent()

    expect(
      wrapper.find(
        '[role="dialog"]',
      ).exists(),
    ).toBe(true)

    expect(
      wrapper.text(),
    ).toContain(
      'Ajukan Penawaran',
    )

    expect(
      wrapper.text(),
    ).toContain(
      '200.000',
    )

    expect(
      wrapper.text(),
    ).toContain(
      '200.001',
    )
  })

  it('menggunakan harga awal ketika belum ada bid', () => {
    const wrapper =
      mountComponent({
        aucation:
          auctionWithoutBids,
      })

    expect(
      wrapper.text(),
    ).toContain(
      '300.000',
    )

    expect(
      wrapper.text(),
    ).toContain(
      '300.001',
    )
  })

  it('mendukung data bid menggunakan property amount', () => {
    const wrapper =
      mountComponent({
        aucation:
          auctionWithAmountBids,
      })

    expect(
      wrapper.text(),
    ).toContain(
      '250.000',
    )
  })

  it('mendukung data bid menggunakan property price', () => {
    const wrapper =
      mountComponent({
        aucation:
          auctionWithPriceBids,
      })

    expect(
      wrapper.text(),
    ).toContain(
      '350.000',
    )
  })

  it('menggunakan nilai fallback ketika data bid tidak memiliki nilai', () => {
    const wrapper =
      mountComponent({
        aucation: {
          id: 6,
          title:
            'Lelang Tanpa Nilai Bid',
          start_bid: 100000,
          bids: [
            {},
          ],
        },
      })

    expect(
      wrapper.text(),
    ).toContain(
      '0',
    )

    expect(
      wrapper.text(),
    ).toContain(
      '1',
    )
  })

  it('menggunakan startBid sebagai alternatif start_bid', () => {
    const wrapper =
      mountComponent({
        aucation: {
          id: 5,
          title: 'Lelang Barang',
          startBid: 400000,
          bids: [],
        },
      })

    expect(
      wrapper.text(),
    ).toContain(
      '400.000',
    )

    expect(
      wrapper.text(),
    ).toContain(
      '400.001',
    )
  })

  it('mereset input dan error ketika data lelang berubah', async () => {
    const wrapper = mountComponent()

    const input =
      wrapper.find('#bid-amount')

    await input.setValue('250000')

    expect(
      input.element.value,
    ).toBe('250000')

    await wrapper.setProps({
      aucation:
        auctionWithoutBids,
    })

    expect(
      input.element.value,
    ).toBe('')

    expect(
      wrapper.find('.text-red-600').exists(),
    ).toBe(false)
  })

  it('menampilkan error ketika data lelang tidak ditemukan', async () => {
    const wrapper =
      mountComponent({
        aucation: null,
      })

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Data lelang tidak ditemukan',
    )
  })

  it('menampilkan error ketika id lelang tidak tersedia', async () => {
    const wrapper =
      mountComponent({
        aucation: {
          title: 'Tanpa ID',
          start_bid: 100000,
          bids: [],
        },
      })

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Data lelang tidak ditemukan',
    )
  })

  it('menampilkan error ketika nominal bid kosong', async () => {
    const wrapper = mountComponent()

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Nominal penawaran wajib diisi',
    )
  })

  it('menampilkan error ketika nominal bukan angka', async () => {
    const wrapper = mountComponent()

    wrapper.vm.bid = 'abc'

    await wrapper.vm.submitForm()

    expect(
      wrapper.text(),
    ).toContain(
      'Nominal penawaran harus berupa angka',
    )
  })

  it('menampilkan error ketika bid sama dengan bid tertinggi', async () => {
    const wrapper = mountComponent()

    await wrapper
      .find('#bid-amount')
      .setValue('200000')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Penawaran harus lebih tinggi dari Rp 200.000',
    )
  })

  it('menampilkan error ketika bid lebih rendah dari bid tertinggi', async () => {
    const wrapper = mountComponent()

    await wrapper
      .find('#bid-amount')
      .setValue('150000')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Penawaran harus lebih tinggi dari Rp 200.000',
    )
  })

  it('menampilkan error ketika bid bernilai nol', async () => {
    const wrapper =
      mountComponent({
        aucation: {
          id: 10,
          start_bid: -100,
          bids: [],
        },
      })

    await wrapper
      .find('#bid-amount')
      .setValue('0')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Nominal penawaran harus lebih dari 0',
    )
  })

  it('menampilkan error ketika bid bernilai negatif', async () => {
    const wrapper =
      mountComponent({
        aucation: {
          id: 11,
          start_bid: -100,
          bids: [],
        },
      })

    await wrapper
      .find('#bid-amount')
      .setValue('-50')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Nominal penawaran harus lebih dari 0',
    )
  })

  it('berhasil mengajukan bid', async () => {
    const wrapper = mountComponent()

    const store =
      useAucationsStore()

    store.addBid = vi
      .fn()
      .mockResolvedValue(true)

    store.message =
      'Berhasil mengajukan penawaran'

    await wrapper
      .find('#bid-amount')
      .setValue('250000')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      store.addBid,
    ).toHaveBeenCalledWith(
      1,
      250000,
    )

    expect(
      wrapper.emitted('changed'),
    ).toHaveLength(1)

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(false)
  })

  it('menggunakan pesan fallback ketika bid gagal', async () => {
    const wrapper = mountComponent()

    const store =
      useAucationsStore()

    store.addBid = vi
      .fn()
      .mockResolvedValue(false)

    store.message = ''

    await wrapper
      .find('#bid-amount')
      .setValue('250000')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      store.addBid,
    ).toHaveBeenCalledWith(
      1,
      250000,
    )

    expect(
      wrapper.emitted('changed'),
    ).toBeUndefined()

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(false)
  })

  it('menggunakan pesan store ketika bid gagal', async () => {
    const wrapper = mountComponent()

    const store =
      useAucationsStore()

    store.addBid = vi
      .fn()
      .mockResolvedValue(false)

    store.message =
      'Bid terlalu rendah'

    await wrapper
      .find('#bid-amount')
      .setValue('250000')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      store.addBid,
    ).toHaveBeenCalledWith(
      1,
      250000,
    )

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(false)
  })

  it('menutup modal ketika tombol batal ditekan', async () => {
    const wrapper = mountComponent()

    const buttons =
      wrapper.findAll(
        'button[type="button"]',
      )

    await buttons[1].trigger('click')

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('menutup modal melalui tombol X', async () => {
    const wrapper = mountComponent()

    await wrapper
      .find(
        'button[aria-label="Tutup"]',
      )
      .trigger('click')

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('tidak menutup modal ketika sedang submit', async () => {
    const wrapper = mountComponent()

    let resolveBid

    const store =
      useAucationsStore()

    store.addBid = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveBid = resolve
        }),
    )

    await wrapper
      .find('#bid-amount')
      .setValue('250000')

    const submitPromise =
      wrapper
        .find('form')
        .trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(true)

    await wrapper.vm.closeModal()

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()

    resolveBid(true)

    await submitPromise
  })

  it('tidak menjalankan submit kedua ketika sedang submit', async () => {
    const wrapper = mountComponent()

    let resolveBid

    const store =
      useAucationsStore()

    store.addBid = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveBid = resolve
        }),
    )

    await wrapper
      .find('#bid-amount')
      .setValue('250000')

    const firstSubmit =
      wrapper
        .find('form')
        .trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      store.addBid,
    ).toHaveBeenCalledTimes(1)

    resolveBid(true)

    await firstSubmit
  })

  it('selalu mengembalikan isSubmitting menjadi false setelah proses selesai', async () => {
    const wrapper = mountComponent()

    const store =
      useAucationsStore()

    store.addBid = vi
      .fn()
      .mockResolvedValue(false)

    await wrapper
      .find('#bid-amount')
      .setValue('250000')

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(false)
  })
})