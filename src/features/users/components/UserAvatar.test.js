import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserAvatar from './UserAvatar.vue'

describe('UserAvatar', () => {
  it('menampilkan gambar jika foto tersedia', () => {
    const wrapper = mount(UserAvatar, {
      props: { name: 'Feny Pasaribu', photo: 'https://x.test/a.png' },
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://x.test/a.png')
    expect(img.attributes('alt')).toBe('Feny Pasaribu')
  })

  it('menampilkan inisial jika foto kosong atau null', () => {
    const empty = mount(UserAvatar, { props: { name: 'Feny Pasaribu' } })
    const nullPhoto = mount(UserAvatar, {
      props: { name: 'Feny Pasaribu', photo: null },
    })

    expect(empty.find('img').exists()).toBe(false)
    expect(empty.text()).toBe('FP')
    expect(nullPhoto.text()).toBe('FP')
  })

  it('beralih ke inisial saat gambar gagal dimuat, lalu pulih saat foto berganti', async () => {
    const wrapper = mount(UserAvatar, {
      props: { name: 'Feny Pasaribu', photo: 'https://x.test/a.png' },
    })

    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('FP')

    await wrapper.setProps({ photo: 'https://x.test/b.png' })
    expect(wrapper.find('img').attributes('src')).toBe('https://x.test/b.png')
  })

  it('memakai ukuran bawaan dan ukuran kustom', () => {
    const defaultSize = mount(UserAvatar, { props: { name: 'A' } })
    const custom = mount(UserAvatar, {
      props: { name: 'A', sizeClass: 'size-24 text-3xl' },
    })

    expect(defaultSize.classes()).toContain('size-12')
    expect(custom.classes()).toContain('size-24')
  })
})