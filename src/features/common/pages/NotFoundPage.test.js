import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotFoundPage from './NotFoundPage.vue'

let router

beforeEach(async () => {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  })
  await router.push('/')
  await router.isReady()
})

const mountPage = () => mount(NotFoundPage, { global: { plugins: [router] } })

describe('NotFoundPage', () => {
  it('menampilkan kode 404 dan pesan', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('404')
    expect(wrapper.find('h1').text()).toBe('Halaman tidak ditemukan')
  })

  it('menyediakan tautan ke beranda', () => {
    const link = mountPage().find('a')

    expect(link.attributes('href')).toBe('/')
    expect(link.text()).toContain('Ke beranda')
  })

  it('kembali ke halaman sebelumnya saat tombol Kembali diklik', async () => {
    const backSpy = vi.spyOn(router, 'back').mockImplementation(() => {})
    const wrapper = mountPage()

    await wrapper.find('button').trigger('click')

    expect(backSpy).toHaveBeenCalledTimes(1)
  })
})