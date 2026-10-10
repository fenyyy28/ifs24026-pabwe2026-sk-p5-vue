import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import AuthLayout from './AuthLayout.vue'

describe('AuthLayout', () => {
  it('menampilkan judul, subjudul, dan slot', () => {
    const wrapper = mount(AuthLayout, {
      props: { title: 'Judul', subtitle: 'Subjudul' },
      slots: {
        default: () => h('p', 'isi form'),
        footer: () => h('span', 'kaki halaman'),
      },
    })

    expect(wrapper.find('h1').text()).toBe('Judul')
    expect(wrapper.text()).toContain('Subjudul')
    expect(wrapper.text()).toContain('isi form')
    expect(wrapper.text()).toContain('kaki halaman')
  })

  it('tidak menampilkan subjudul jika tidak diberikan', () => {
    const wrapper = mount(AuthLayout, { props: { title: 'Judul' } })

    expect(wrapper.find('h1 + p').exists()).toBe(false)
  })
})