import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AddModal from './AddModal.vue'
import { useAucationsStore } from '../states/aucationsStore'
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
        @click="$emit('update:modelValue', 'Deskripsi dari editor')"
      >
        Editor
      </button>
    </div>
  `,
}

const mountModal = () => {
  setActivePinia(createPinia())

  return mount(AddModal, {
    global: {
      stubs: {
        MarkdownEditor: MarkdownEditorStub,
      },
    },
  })
}

function getFutureDateTime() {
  const date = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  )

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

function getPastDateTime() {
  const date = new Date(
    Date.now() - 60 * 60 * 1000,
  )

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

async function setDescription(wrapper, description) {
  const editor = wrapper.findComponent({
    name: 'MarkdownEditor',
  })

  editor.vm.$emit(
    'update:modelValue',
    description,
  )

  await wrapper.vm.$nextTick()
}

async function fillValidForm(wrapper) {
  await wrapper
    .find('#add-auction-title')
    .setValue('Laptop Bekas')

  await setDescription(
    wrapper,
    'Laptop bekas berkualitas.',
  )

  await wrapper
    .find('#add-auction-start-bid')
    .setValue('100000')

  await wrapper
    .find('#add-auction-closed-at')
    .setValue(getFutureDateTime())
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AddModal', () => {
  it('menampilkan form tambah lelang', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain(
      'Tambah Lelang',
    )

    expect(
      wrapper.find('#add-auction-title').exists(),
    ).toBe(true)

    expect(
      wrapper.find('#add-auction-start-bid').exists(),
    ).toBe(true)

    expect(
      wrapper.find('#add-auction-closed-at').exists(),
    ).toBe(true)

    expect(
      wrapper
        .findComponent({
          name: 'MarkdownEditor',
        })
        .exists(),
    ).toBe(true)
  })

  it('menutup modal saat tombol batal ditekan', async () => {
    const wrapper = mountModal()

    const cancelButton = wrapper
      .findAll('button')
      .find(
        (button) => button.text() === 'Batal',
      )

    expect(cancelButton).toBeTruthy()

    await cancelButton.trigger('click')

    expect(
      wrapper.emitted('close'),
    ).toBeTruthy()

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })

  it('menampilkan error ketika semua form kosong', async () => {
    const wrapper = mountModal()

    await wrapper
      .find('form')
      .trigger('submit')

    expect(wrapper.text()).toContain(
      'Judul lelang wajib diisi',
    )

    expect(wrapper.text()).toContain(
      'Deskripsi lelang wajib diisi',
    )

    expect(wrapper.text()).toContain(
      'Harga awal wajib diisi',
    )

    expect(wrapper.text()).toContain(
      'Batas waktu penutupan wajib diisi',
    )
  })

  it('menolak harga awal yang tidak valid', async () => {
    const wrapper = mountModal()

    await wrapper
      .find('#add-auction-title')
      .setValue('Laptop')

    await setDescription(
      wrapper,
      'Laptop bekas',
    )

    await wrapper
      .find('#add-auction-start-bid')
      .setValue('0')

    await wrapper
      .find('#add-auction-closed-at')
      .setValue(getFutureDateTime())

    await wrapper
      .find('form')
      .trigger('submit')

    expect(wrapper.text()).toContain(
      'Harga awal harus lebih besar dari 0',
    )
  })

  it('menolak batas waktu yang sudah lewat', async () => {
    const wrapper = mountModal()

    await wrapper
      .find('#add-auction-title')
      .setValue('Laptop')

    await setDescription(
      wrapper,
      'Laptop bekas',
    )

    await wrapper
      .find('#add-auction-start-bid')
      .setValue('100000')

    await wrapper
      .find('#add-auction-closed-at')
      .setValue(getPastDateTime())

    await wrapper
      .find('form')
      .trigger('submit')

    expect(wrapper.text()).toContain(
      'Batas waktu harus lebih dari waktu sekarang',
    )
  })

  it('menolak format batas waktu yang tidak valid', async () => {
    const wrapper = mountModal()

    await wrapper
      .find('#add-auction-title')
      .setValue('Laptop')

    await setDescription(
      wrapper,
      'Laptop bekas',
    )

    await wrapper
      .find('#add-auction-start-bid')
      .setValue('100000')

    const closedAtInput = wrapper.find(
      '#add-auction-closed-at',
    )

    Object.defineProperty(
      closedAtInput.element,
      'value',
      {
        value: 'invalid-date',
        writable: true,
      },
    )

    await closedAtInput.trigger('input')

    await wrapper
      .find('form')
      .trigger('submit')

    expect(wrapper.text()).toContain(
      'Format batas waktu tidak valid',
    )
  })

  it('berhasil menambahkan lelang', async () => {
    const wrapper = mountModal()
    const store = useAucationsStore()

    const addAucationSpy = vi
      .spyOn(
        store,
        'addAucation',
      )
      .mockResolvedValue(true)

    await fillValidForm(wrapper)

    await wrapper
      .find('form')
      .trigger('submit')

    await flushPromises()

    expect(
      addAucationSpy,
    ).toHaveBeenCalledWith({
      title: 'Laptop Bekas',
      description:
        'Laptop bekas berkualitas.',
      startBid: 100000,
      closedAt: expect.any(String),
    })

    expect(
      showSuccessDialog,
    ).toHaveBeenCalled()

    expect(
      wrapper.emitted('added'),
    ).toBeTruthy()

    expect(
      wrapper.emitted('close'),
    ).toBeTruthy()
  })

  it('menampilkan dialog error ketika penambahan gagal', async () => {
    const wrapper = mountModal()
    const store = useAucationsStore()

    store.message = 'Gagal dari server'

    const addAucationSpy = vi
      .spyOn(
        store,
        'addAucation',
      )
      .mockResolvedValue(false)

    await fillValidForm(wrapper)

    await wrapper
      .find('form')
      .trigger('submit')

    await flushPromises()

    expect(
      addAucationSpy,
    ).toHaveBeenCalled()

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Gagal dari server',
    )

    expect(
      wrapper.emitted('added'),
    ).toBeUndefined()

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()
  })

  it('menampilkan pesan error default ketika store tidak memiliki message', async () => {
    const wrapper = mountModal()
    const store = useAucationsStore()

    store.message = ''

    vi.spyOn(
      store,
      'addAucation',
    ).mockImplementation(
      async () => {
        store.message = ''
        return false
      },
    )

    await fillValidForm(wrapper)

    await wrapper
      .find('form')
      .trigger('submit')

    await flushPromises()

    expect(
      showErrorDialog,
    ).toHaveBeenCalledWith(
      'Gagal menambahkan lelang',
    )

    expect(
      wrapper.emitted('added'),
    ).toBeUndefined()

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()
  })

  it('menonaktifkan tombol ketika proses penyimpanan berlangsung', async () => {
    const wrapper = mountModal()
    const store = useAucationsStore()

    let resolveRequest

    const request = new Promise(
      (resolve) => {
        resolveRequest = resolve
      },
    )

    vi.spyOn(
      store,
      'addAucation',
    ).mockReturnValue(request)

    await fillValidForm(wrapper)

    const submitPromise = wrapper
      .find('form')
      .trigger('submit')

    await wrapper.vm.$nextTick()

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(true)

    const submitButton = wrapper
      .find('form')
      .find('button[type="submit"]')

    expect(
      submitButton.exists(),
    ).toBe(true)

    expect(
      submitButton.attributes(
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

  it('tidak menutup modal ketika proses penyimpanan sedang berlangsung', async () => {
    const wrapper = mountModal()

    wrapper.vm.isSubmitting = true

    await wrapper.vm.$nextTick()

    const cancelButton = wrapper
      .findAll('button')
      .find(
        (button) => button.text() === 'Batal',
      )

    expect(cancelButton).toBeTruthy()

    await cancelButton.trigger('click')

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()
  })

  it('tidak menjalankan submit ulang ketika proses penyimpanan sedang berlangsung', async () => {
    const wrapper = mountModal()
    const store = useAucationsStore()

    const addAucationSpy = vi.spyOn(
      store,
      'addAucation',
    )

    wrapper.vm.isSubmitting = true

    await wrapper.vm.$nextTick()

    await wrapper
      .find('form')
      .trigger('submit')

    expect(
      addAucationSpy,
    ).not.toHaveBeenCalled()
  })

  it('menjalankan guard closeModal secara langsung saat sedang menyimpan', async () => {
    const wrapper = mountModal()

    wrapper.vm.isSubmitting = true

    await wrapper.vm.$nextTick()

    expect(
      wrapper.vm.isSubmitting,
    ).toBe(true)

    wrapper.vm.closeModal()

    expect(
      wrapper.emitted('close'),
    ).toBeUndefined()
  })

  it('tetap bisa menutup modal setelah proses penyimpanan selesai', async () => {
    const wrapper = mountModal()

    wrapper.vm.isSubmitting = false

    await wrapper.vm.$nextTick()

    wrapper.vm.closeModal()

    expect(
      wrapper.emitted('close'),
    ).toBeTruthy()

    expect(
      wrapper.emitted('close'),
    ).toHaveLength(1)
  })
})
