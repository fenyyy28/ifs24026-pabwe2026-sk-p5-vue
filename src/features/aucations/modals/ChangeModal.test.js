import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'

import {
  mount,
  flushPromises,
} from '@vue/test-utils'

import {
  createPinia,
  setActivePinia,
} from 'pinia'

import ChangeModal from './ChangeModal.vue'

import {
  useAucationsStore,
} from '../states/aucationsStore'

import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}))

const MarkdownEditorStub = {
  name: 'MarkdownEditor',

  props: {
    modelValue: {
      type: String,
      default: '',
    },

    height: String,

    placeholder: String,
  },

  emits: ['update:modelValue'],

  template: `
    <div data-testid="markdown-editor">
      <button
        type="button"
        data-testid="set-description"
        @click="$emit(
          'update:modelValue',
          'Deskripsi hasil edit'
        )"
      >
        Editor
      </button>
    </div>
  `,
}

const auction = {
  id: 10,
  title: 'Laptop Lama',
  description: 'Laptop bekas.',
  start_bid: 500000,
  closed_at: '2099-12-31T20:00:00',
}

function mountModal(
  props = {
    aucation: auction,
  },
) {
  setActivePinia(createPinia())

  return mount(ChangeModal, {
    props,

    global: {
      stubs: {
        MarkdownEditor:
          MarkdownEditorStub,
      },
    },
  })
}

function getFutureDateTime() {
  const date = new Date(
    Date.now() +
      24 * 60 * 60 * 1000,
  )

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  const hour = String(
    date.getHours(),
  ).padStart(2, '0')

  const minute = String(
    date.getMinutes(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

function getPastDateTime() {
  const date = new Date(
    Date.now() -
      60 * 60 * 1000,
  )

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  const hour = String(
    date.getHours(),
  ).padStart(2, '0')

  const minute = String(
    date.getMinutes(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

async function setDescription(
  wrapper,
  description,
) {
  const editor =
    wrapper.findComponent({
      name: 'MarkdownEditor',
    })

  editor.vm.$emit(
    'update:modelValue',
    description,
  )

  await wrapper.vm.$nextTick()
}

async function fillValidForm(
  wrapper,
) {
  await wrapper
    .find('#change-auction-title')
    .setValue('Laptop Baru')

  await setDescription(
    wrapper,
    'Laptop hasil perubahan.',
  )

  await wrapper
    .find('#change-auction-start-bid')
    .setValue('750000')

  await wrapper
    .find('#change-auction-closed-at')
    .setValue(
      getFutureDateTime(),
    )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ChangeModal', () => {
  it('menampilkan form ubah lelang', () => {
    const wrapper =
      mountModal()

    expect(
      wrapper.text(),
    ).toContain(
      'Ubah Lelang',
    )

    expect(
      wrapper.find(
        '#change-auction-title',
      ).exists(),
    ).toBe(true)

    expect(
      wrapper.find(
        '#change-auction-start-bid',
      ).exists(),
    ).toBe(true)

    expect(
      wrapper.find(
        '#change-auction-closed-at',
      ).exists(),
    ).toBe(true)

    expect(
      wrapper.findComponent({
        name: 'MarkdownEditor',
      }).exists(),
    ).toBe(true)
  })

  it('mengisi form berdasarkan data lelang', () => {
    const wrapper =
      mountModal()

    expect(
      wrapper.vm.form.title,
    ).toBe('Laptop Lama')

    expect(
      wrapper.vm.form.description,
    ).toBe('Laptop bekas.')

    expect(
      Number(
        wrapper.vm.form.startBid,
      ),
    ).toBe(500000)

    expect(
      wrapper.vm.form.closedAt,
    ).toContain(
      '2099-12-31',
    )
  })

  it('mengosongkan form ketika data lelang tidak tersedia', () => {
    const wrapper =
      mountModal({
        aucation: null,
      })

    expect(
      wrapper.vm.form.title,
    ).toBe('')

    expect(
      wrapper.vm.form.description,
    ).toBe('')

    expect(
      wrapper.vm.form.startBid,
    ).toBe('')

    expect(
      wrapper.vm.form.closedAt,
    ).toBe('')
  })

  it('menggunakan fallback ketika title dan description kosong', () => {
    const wrapper =
      mountModal({
        aucation: {
          id: 11,
          title: '',
          description: '',
          start_bid: 600000,
          closed_at:
            '2099-11-11T11:11:00',
        },
      })

    expect(
      wrapper.vm.form.title,
    ).toBe('')

    expect(
      wrapper.vm.form.description,
    ).toBe('')

    expect(
      Number(
        wrapper.vm.form.startBid,
      ),
    ).toBe(600000)

    expect(
      wrapper.vm.form.closedAt,
    ).toContain(
      '2099-11-11',
    )
  })

  it('menggunakan startBid sebagai fallback', () => {
    const wrapper =
      mountModal({
        aucation: {
          id: 12,
          title: 'Barang',
          description: 'Deskripsi',
          start_bid: null,
          startBid: 700000,
          closed_at:
            '2099-11-11T11:11:00',
        },
      })

    expect(
      Number(
        wrapper.vm.form.startBid,
      ),
    ).toBe(700000)
  })

  it('menggunakan closedAt sebagai fallback', () => {
    const wrapper =
      mountModal({
        aucation: {
          id: 13,
          title: 'Barang',
          description: 'Deskripsi',
          start_bid: 800000,
          closed_at: null,
          closedAt:
            '2099-10-10T10:30:00',
        },
      })

    expect(
      wrapper.vm.form.closedAt,
    ).toContain(
      '2099-10-10',
    )
  })

  it('mengosongkan tanggal ketika tanggal lelang tidak valid', () => {
    const wrapper =
      mountModal({
        aucation: {
          id: 14,
          title: 'Barang',
          description: 'Deskripsi',
          start_bid: 500000,
          closed_at: 'invalid-date',
        },
      })

    expect(
      wrapper.vm.form.closedAt,
    ).toBe('')
  })

  it('mengosongkan tanggal ketika closed_at dan closedAt tidak tersedia', () => {
    const wrapper =
      mountModal({
        aucation: {
          id: 15,
          title: 'Barang',
          description: 'Deskripsi',
          start_bid: 500000,
        },
      })

    expect(
      wrapper.vm.form.closedAt,
    ).toBe('')
  })

  it('menggunakan startBid ketika start_bid tidak tersedia', () => {
    const wrapper =
      mountModal({
        aucation: {
          id: 16,
          title: 'Barang',
          description: 'Deskripsi',
          startBid: 900000,
          closed_at:
            '2099-12-12T12:00:00',
        },
      })

    expect(
      Number(
        wrapper.vm.form.startBid,
      ),
    ).toBe(900000)
  })

  it('mengosongkan startBid ketika kedua sumber harga tidak tersedia', () => {
    const wrapper =
      mountModal({
        aucation: {
          id: 17,
          title: 'Barang',
          description: 'Deskripsi',
          closed_at:
            '2099-12-12T12:00:00',
        },
      })

    expect(
      wrapper.vm.form.startBid,
    ).toBe('')
  })

  it('menutup modal ketika tombol batal ditekan', async () => {
    const wrapper =
      mountModal()

    const cancelButton =
      wrapper
        .findAll('button')
        .find(
          (button) =>
            button.text() ===
            'Batal',
        )

    expect(
      cancelButton,
    ).toBeTruthy()

    await cancelButton.trigger(
      'click',
    )

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('menutup modal ketika tombol close ditekan', async () => {
    const wrapper =
      mountModal()

    const closeButton =
      wrapper.find(
        'button[aria-label="Tutup"]',
      )

    expect(
      closeButton.exists(),
    ).toBe(true)

    await closeButton.trigger(
      'click',
    )

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('menampilkan semua error ketika form kosong', async () => {
    const wrapper =
      mountModal()

    wrapper.vm.form.title = ''
    wrapper.vm.form.description = ''
    wrapper.vm.form.startBid = ''
    wrapper.vm.form.closedAt = ''

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      wrapper.text(),
    ).toContain(
      'Judul lelang wajib diisi',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Deskripsi lelang wajib diisi',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Harga awal wajib diisi',
    )

    expect(
      wrapper.text(),
    ).toContain(
      'Batas waktu penutupan wajib diisi',
    )
  })

  it('menolak harga awal nol', async () => {
    const wrapper =
      mountModal()

    await wrapper
      .find(
        '#change-auction-title',
      )
      .setValue('Laptop')

    await setDescription(
      wrapper,
      'Laptop bekas',
    )

    await wrapper
      .find(
        '#change-auction-start-bid',
      )
      .setValue('0')

    await wrapper
      .find(
        '#change-auction-closed-at',
      )
      .setValue(
        getFutureDateTime(),
      )

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      wrapper.text(),
    ).toContain(
      'Harga awal harus lebih besar dari 0',
    )
  })

  it('menolak harga awal yang bukan angka', async () => {
    const wrapper =
      mountModal()

    wrapper.vm.form.startBid =
      'abc'

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      wrapper.text(),
    ).toContain(
      'Harga awal harus lebih besar dari 0',
    )
  })

  it('menolak tanggal yang sudah lewat', async () => {
    const wrapper =
      mountModal()

    await wrapper
      .find(
        '#change-auction-closed-at',
      )
      .setValue(
        getPastDateTime(),
      )

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      wrapper.text(),
    ).toContain(
      'Batas waktu harus lebih dari waktu sekarang',
    )
  })

  it('menolak format tanggal yang tidak valid', async () => {
    const wrapper =
      mountModal()

    wrapper.vm.form.closedAt =
      'invalid-date'

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      wrapper.text(),
    ).toContain(
      'Format batas waktu tidak valid',
    )
  })

  it('menampilkan error ketika id lelang tidak tersedia', async () => {
    const wrapper =
      mountModal({
        aucation: {
          ...auction,
          id: null,
        },
      })

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Data lelang tidak ditemukan',
    )
  })

  it('berhasil mengubah lelang', async () => {
    const wrapper =
      mountModal()

    const store =
      useAucationsStore()

    const changeSpy =
      vi
        .spyOn(
          store,
          'changeAucation',
        )
        .mockResolvedValue(true)

    await fillValidForm(
      wrapper,
    )

    await wrapper
      .find('form')
      .trigger('submit')

    await flushPromises()

    expect(
      changeSpy,
    ).toHaveBeenCalledWith(
      10,
      {
        title:
          'Laptop Baru',
        description:
          'Laptop hasil perubahan.',
        startBid: 750000,
        closedAt:
          expect.any(String),
      },
    )

    expect(
      showSuccessDialog,
    ).toHaveBeenCalled()

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

  it('menampilkan error dari server ketika perubahan gagal', async () => {
    const wrapper =
      mountModal()

    const store =
      useAucationsStore()

    store.message =
      'Gagal dari server'

    vi
      .spyOn(
        store,
        'changeAucation',
      )
      .mockResolvedValue(false)

    await fillValidForm(
      wrapper,
    )

    await wrapper
      .find('form')
      .trigger('submit')

    await flushPromises()

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Gagal dari server',
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

  it('menggunakan pesan error default ketika store tidak memiliki message', async () => {
    const wrapper =
      mountModal()

    const store =
      useAucationsStore()

    store.message = ''

    vi
      .spyOn(
        store,
        'changeAucation',
      )
      .mockResolvedValue(false)

    await fillValidForm(
      wrapper,
    )

    await wrapper
      .find('form')
      .trigger('submit')

    await flushPromises()

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Gagal mengubah lelang',
    )

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(false)
  })

  it('tidak melakukan submit ulang ketika sedang menyimpan', async () => {
    const wrapper =
      mountModal()

    const store =
      useAucationsStore()

    const changeSpy =
      vi.spyOn(
        store,
        'changeAucation',
      )

    wrapper.vm.isSubmitting =
      true

    await wrapper.vm.$nextTick()

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      changeSpy,
    ).not.toHaveBeenCalled()
  })

  it('tidak menutup modal ketika sedang menyimpan', async () => {
    const wrapper =
      mountModal()

    wrapper.vm.isSubmitting =
      true

    await wrapper.vm.$nextTick()

    wrapper.vm.closeModal()

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()
  })

  it('mengubah status loading saat proses berlangsung', async () => {
    const wrapper =
      mountModal()

    const store =
      useAucationsStore()

    let resolveRequest

    const request =
      new Promise(
        (resolve) => {
          resolveRequest =
            resolve
        },
      )

    vi
      .spyOn(
        store,
        'changeAucation',
      )
      .mockReturnValue(request)

    await fillValidForm(
      wrapper,
    )

    const submitPromise =
      wrapper
        .find('form')
        .trigger('submit')

    await wrapper.vm.$nextTick()

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(true)

    expect(
      wrapper
        .find(
          'button[type="submit"]',
        )
        .attributes(
          'disabled',
        ),
    ).toBeDefined()

    resolveRequest(true)

    await submitPromise
    await flushPromises()

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(false)
  })

  it('mengubah form ketika prop aucation berubah', async () => {
    const wrapper =
      mountModal()

    await wrapper.setProps({
      aucation: {
        id: 20,
        title: 'Barang Baru',
        description:
          'Deskripsi baru.',
        start_bid: 900000,
        closed_at:
          '2099-10-10T10:30:00',
      },
    })

    expect(
      wrapper.vm.form.title,
    ).toBe('Barang Baru')

    expect(
      wrapper.vm.form.description,
    ).toBe('Deskripsi baru.')

    expect(
      Number(
        wrapper.vm.form.startBid,
      ),
    ).toBe(900000)

    expect(
      wrapper.vm.form.closedAt,
    ).toContain(
      '2099-10-10',
    )
  })
})