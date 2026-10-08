import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownEditor from './MarkdownEditor.vue'

const { instances } = vi.hoisted(() => ({ instances: [] }))

vi.mock('@toast-ui/editor', () => {
  class FakeEditor {
    constructor(options) {
      this.options = options
      this.markdown = options.initialValue
      this.destroy = vi.fn()
      this.setMarkdown = vi.fn((value) => {
        this.markdown = value
      })
      instances.push(this)
    }

    getMarkdown() {
      return this.markdown
    }
  }
  return { default: FakeEditor }
})
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))

beforeEach(() => {
  instances.length = 0
})

describe('MarkdownEditor', () => {
  it('membuat editor dengan nilai awal dan opsi bawaan', () => {
    mount(MarkdownEditor, { props: { modelValue: '# Judul' } })

    expect(instances).toHaveLength(1)
    expect(instances[0].options).toMatchObject({
      initialValue: '# Judul',
      height: '320px',
      initialEditType: 'markdown',
      placeholder: 'Tulis deskripsi dengan Markdown...',
      usageStatistics: false,
    })
  })

  it('memakai tinggi dan placeholder kustom', () => {
    mount(MarkdownEditor, { props: { height: '200px', placeholder: 'Isi di sini' } })

    expect(instances[0].options).toMatchObject({
      initialValue: '',
      height: '200px',
      placeholder: 'Isi di sini',
    })
  })

  it('mengirim update:modelValue saat isi editor berubah', () => {
    const wrapper = mount(MarkdownEditor)

    instances[0].markdown = 'diketik pengguna'
    instances[0].options.events.change()

    expect(wrapper.emitted('update:modelValue')).toEqual([['diketik pengguna']])
  })

  it('menyinkronkan editor saat nilai berubah dari luar', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: 'awal' } })

    await wrapper.setProps({ modelValue: 'dari luar' })

    expect(instances[0].setMarkdown).toHaveBeenCalledWith('dari luar')
  })

  it('tidak menimpa editor jika nilainya sama dengan isi editor', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: 'awal' } })

    instances[0].markdown = 'diketik'
    await wrapper.setProps({ modelValue: 'diketik' })

    expect(instances[0].setMarkdown).not.toHaveBeenCalled()
  })

  it('menghancurkan editor saat komponen dilepas', () => {
    const wrapper = mount(MarkdownEditor)

    wrapper.unmount()

    expect(instances[0].destroy).toHaveBeenCalled()
  })
})