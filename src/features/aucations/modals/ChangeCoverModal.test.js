import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import ChangeCoverModal from './ChangeCoverModal.vue'
import { useAucationsStore } from '../states/aucationsStore'

import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const auction = {
  id: 10,
  title: 'Lelang Laptop',
  cover_url:
    'https://example.com/old-cover.jpg',
}

function mountModal(props = {}) {
  return mount(ChangeCoverModal, {
    props: {
      aucation: auction,
      ...props,
    },
    global: {
      plugins: [createPinia()],
    },
  })
}

function createImageFile() {
  return new File(
    ['fake-image-content'],
    'cover.jpg',
    {
      type: 'image/jpeg',
    },
  )
}

async function selectFile(wrapper, file) {
  const input = wrapper.find(
    '#change-cover-file',
  )

  Object.defineProperty(
    input.element,
    'files',
    {
      value: file ? [file] : [],
      writable: false,
      configurable: true,
    },
  )

  await input.trigger('change')
}

describe('ChangeCoverModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    vi.clearAllMocks()

    vi.spyOn(
      URL,
      'createObjectURL',
    ).mockReturnValue(
      'blob:http://localhost/cover-preview',
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('menampilkan modal dan form', () => {
    const wrapper = mountModal()

    expect(
      wrapper
        .find('[role="dialog"]')
        .exists(),
    ).toBe(true)

    expect(
      wrapper
        .find(
          '#change-cover-dialog-title',
        )
        .text(),
    ).toBe('Ubah Cover Lelang')

    expect(
      wrapper
        .find('#change-cover-file')
        .exists(),
    ).toBe(true)

    expect(
      wrapper
        .find('button[type="submit"]')
        .text(),
    ).toContain('Simpan Cover')
  })

  it('menampilkan preview cover yang sudah ada', () => {
    const wrapper = mountModal()

    const image = wrapper.find('img')

    expect(image.exists()).toBe(true)

    expect(
      image.attributes('src'),
    ).toBe(
      'https://example.com/old-cover.jpg',
    )

    expect(
      image.attributes('alt'),
    ).toBe('Preview cover lelang')
  })

  it('menangani auction null', () => {
    const wrapper = mountModal({
      aucation: null,
    })

    expect(
      wrapper.find('img').exists(),
    ).toBe(false)
  })

  it('menggunakan cover fallback jika cover_url kosong', () => {
    const wrapper = mountModal({
      aucation: {
        id: 10,
        title: 'Lelang Laptop',
        cover_url: '',
        cover:
          'https://example.com/fallback.jpg',
      },
    })

    expect(
      wrapper
        .find('img')
        .attributes('src'),
    ).toBe(
      'https://example.com/fallback.jpg',
    )
  })

  it('tidak menampilkan preview jika cover kosong', () => {
    const wrapper = mountModal({
      aucation: {
        id: 10,
        title: 'Lelang Laptop',
        cover_url: '',
        cover: '',
      },
    })

    expect(
      wrapper.find('img').exists(),
    ).toBe(false)

    expect(
      wrapper.text(),
    ).not.toContain(
      'Preview Cover',
    )
  })

  it('menolak file yang bukan gambar', async () => {
    const wrapper = mountModal()

    const file = new File(
      ['document'],
      'document.pdf',
      {
        type: 'application/pdf',
      },
    )

    await selectFile(wrapper, file)

    expect(
      wrapper.text(),
    ).toContain(
      'File cover harus berupa gambar',
    )

    expect(
      wrapper.find('img').exists(),
    ).toBe(false)
  })

  it('menangani pemilihan file kosong', async () => {
    const wrapper = mountModal()

    await selectFile(wrapper, null)

    expect(
      wrapper.find('img').exists(),
    ).toBe(true)

    expect(
      wrapper.text(),
    ).not.toContain(
      'File cover harus berupa gambar',
    )
  })

  it('menerima file gambar dan membuat preview', async () => {
    const wrapper = mountModal()

    const file = createImageFile()

    await selectFile(wrapper, file)

    expect(
      URL.createObjectURL,
    ).toHaveBeenCalledWith(file)

    expect(
      wrapper
        .find('img')
        .attributes('src'),
    ).toBe(
      'blob:http://localhost/cover-preview',
    )

    expect(
      wrapper.text(),
    ).not.toContain(
      'File cover harus berupa gambar',
    )
  })

  it('tidak submit jika file belum dipilih', async () => {
    const wrapper = mountModal()

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      wrapper.text(),
    ).toContain(
      'Silakan pilih gambar cover terlebih dahulu',
    )

    expect(
      showErrorDialog,
    ).not.toHaveBeenCalled()
  })

  it('menampilkan error jika data auction tidak memiliki id', async () => {
    const wrapper = mountModal({
      aucation: {
        title: 'Lelang Laptop',
        cover_url:
          'https://example.com/cover.jpg',
      },
    })

    const file = createImageFile()

    await selectFile(wrapper, file)

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Data lelang tidak ditemukan',
    )
  })

  it('berhasil mengubah cover', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)

    const store = useAucationsStore()

    store.changeCover = vi
      .fn()
      .mockResolvedValue(true)

    store.message =
      'Cover berhasil diubah'

    const wrapper = mount(
      ChangeCoverModal,
      {
        props: {
          aucation: auction,
        },
        global: {
          plugins: [pinia],
        },
      },
    )

    const file = createImageFile()

    await selectFile(wrapper, file)

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      store.changeCover,
    ).toHaveBeenCalledWith(
      auction.id,
      file,
    )

    expect(
      showSuccessDialog,
    ).toHaveBeenCalledWith(
      'Cover berhasil diubah',
    )

    expect(
      wrapper.emitted('changed'),
    ).toHaveLength(1)

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('menampilkan error dari server', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)

    const store = useAucationsStore()

    store.changeCover = vi
      .fn()
      .mockResolvedValue(false)

    store.message =
      'Gagal mengubah cover'

    const wrapper = mount(
      ChangeCoverModal,
      {
        props: {
          aucation: auction,
        },
        global: {
          plugins: [pinia],
        },
      },
    )

    const file = createImageFile()

    await selectFile(wrapper, file)

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Gagal mengubah cover',
    )

    expect(
      wrapper.emitted('changed'),
    ).toBeUndefined()

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()
  })

  it('menggunakan pesan error default jika message kosong', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)

    const store = useAucationsStore()

    store.changeCover = vi
      .fn()
      .mockResolvedValue(false)

    store.message = ''

    const wrapper = mount(
      ChangeCoverModal,
      {
        props: {
          aucation: auction,
        },
        global: {
          plugins: [pinia],
        },
      },
    )

    const file = createImageFile()

    await selectFile(wrapper, file)

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Gagal mengubah cover lelang',
    )
  })

  it('mencegah submit ganda saat proses berlangsung', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)

    const store = useAucationsStore()

    let resolveChange

    store.changeCover = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveChange = resolve
        }),
    )

    const wrapper = mount(
      ChangeCoverModal,
      {
        props: {
          aucation: auction,
        },
        global: {
          plugins: [pinia],
        },
      },
    )

    const file = createImageFile()

    await selectFile(wrapper, file)

    const firstSubmit =
      wrapper
        .find('form')
        .trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    await wrapper
      .find('form')
      .trigger('submit.prevent')

    expect(
      store.changeCover,
    ).toHaveBeenCalledTimes(1)

    resolveChange(true)

    await firstSubmit
  })

  it('mencegah close saat proses submit berlangsung', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)

    const store = useAucationsStore()

    let resolveChange

    store.changeCover = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveChange = resolve
        }),
    )

    const wrapper = mount(
      ChangeCoverModal,
      {
        props: {
          aucation: auction,
        },
        global: {
          plugins: [pinia],
        },
      },
    )

    const file = createImageFile()

    await selectFile(wrapper, file)

    const submitPromise =
      wrapper
        .find('form')
        .trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    resolveChange(true)

    await submitPromise
  })

  it('menutup modal melalui tombol batal', async () => {
    const wrapper = mountModal()

    await wrapper
      .findAll('button')
      .find(
        (button) =>
          button.text() === 'Batal',
      )
      .trigger('click')

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('menutup modal melalui tombol tutup', async () => {
    const wrapper = mountModal()

    await wrapper
      .find(
        'button[aria-label="Tutup"]',
      )
      .trigger('click')

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('memperbarui preview ketika props auction berubah', async () => {
    const wrapper = mountModal()

    await wrapper.setProps({
      aucation: {
        id: 20,
        title: 'Lelang Baru',
        cover_url:
          'https://example.com/new-cover.jpg',
      },
    })

    expect(
      wrapper
        .find('img')
        .attributes('src'),
    ).toBe(
      'https://example.com/new-cover.jpg',
    )
  })

  it('menghapus preview ketika props auction menjadi null', async () => {
    const wrapper = mountModal()

    expect(
      wrapper.find('img').exists(),
    ).toBe(true)

    await wrapper.setProps({
      aucation: null,
    })

    expect(
      wrapper.find('img').exists(),
    ).toBe(false)
  })

  it('menonaktifkan tombol saat proses submit berlangsung', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)

    const store = useAucationsStore()

    let resolveChange

    store.changeCover = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveChange = resolve
        }),
    )

    const wrapper = mount(
      ChangeCoverModal,
      {
        props: {
          aucation: auction,
        },
        global: {
          plugins: [pinia],
        },
      },
    )

    const file = createImageFile()

    await selectFile(wrapper, file)

    const submitPromise =
      wrapper
        .find('form')
        .trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    const submitButton =
      wrapper.find(
        'button[type="submit"]',
      )

    const closeButton =
      wrapper.find(
        'button[aria-label="Tutup"]',
      )

    const cancelButton =
      wrapper
        .findAll('button')
        .find(
          (button) =>
            button.text() === 'Batal',
        )

    expect(
      submitButton.attributes(
        'disabled',
      ),
    ).toBeDefined()

    expect(
      closeButton.attributes(
        'disabled',
      ),
    ).toBeDefined()

    expect(
      cancelButton.attributes(
        'disabled',
      ),
    ).toBeDefined()

    expect(
      submitButton.text(),
    ).toContain(
      'Menyimpan...',
    )

    resolveChange(true)

    await submitPromise
  })

  it('menjalankan return closeModal saat sedang submit', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)

    const store = useAucationsStore()

    let resolveChange

    store.changeCover = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveChange = resolve
        }),
    )

    const wrapper = mount(
      ChangeCoverModal,
      {
        props: {
          aucation: auction,
        },
        global: {
          plugins: [pinia],
        },
      },
    )

    const file = createImageFile()

    await selectFile(wrapper, file)

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

    resolveChange(true)

    await submitPromise
  })
})