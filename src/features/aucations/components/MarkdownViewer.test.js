import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownViewer from './MarkdownViewer.vue'

const { instances } = vi.hoisted(() => ({ instances: [] }))

vi.mock('@toast-ui/editor', () => {
  class FakeEditor {
    static factory(options) {
      const viewer = new FakeEditor()
      viewer.options = options
      viewer.destroy = vi.fn()
      viewer.setMarkdown = vi.fn()
      instances.push(viewer)
      return viewer
    }
  }
  return { default: FakeEditor }
})
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))

beforeEach(() => {
  instances.length = 0
})

describe('MarkdownViewer', () => {
  it('membuat viewer dengan nilai awal', () => {
    mount(MarkdownViewer, { props: { value: '**tebal**' } })

    expect(instances).toHaveLength(1)
    expect(instances[0].options).toMatchObject({
      viewer: true,
      initialValue: '**tebal**',
      usageStatistics: false,
    })
  })

  it('memakai nilai awal kosong jika tidak diberikan', () => {
    mount(MarkdownViewer)

    expect(instances[0].options.initialValue).toBe('')
  })

  it('memperbarui isi saat nilai berubah', async () => {
    const wrapper = mount(MarkdownViewer, { props: { value: 'awal' } })

    await wrapper.setProps({ value: 'baru' })

    expect(instances[0].setMarkdown).toHaveBeenCalledWith('baru')
  })

  it('menghancurkan viewer saat komponen dilepas', () => {
    const wrapper = mount(MarkdownViewer)

    wrapper.unmount()

    expect(instances[0].destroy).toHaveBeenCalled()
  })
})