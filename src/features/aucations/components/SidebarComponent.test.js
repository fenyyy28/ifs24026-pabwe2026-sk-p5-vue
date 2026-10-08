import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SidebarComponent from './SidebarComponent.vue'

const Page = { render: () => null }
let router

beforeEach(async () => {
  router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/my', '/users', '/profile'].map((path) => ({ path, component: Page })),
  })
  await router.push('/')
  await router.isReady()
})

const mountSidebar = (props = {}) =>
  mount(SidebarComponent, { props, global: { plugins: [router] } })

describe('SidebarComponent', () => {
  it('menampilkan empat menu utama', () => {
    const links = mountSidebar().findAll('nav a')

    expect(links.map((link) => link.text())).toEqual([
      'Dashboard Lelang',
      'Lelang Saya',
      'Daftar Pengguna',
      'Profil Saya',
    ])
    expect(links.map((link) => link.attributes('href'))).toEqual([
      '/',
      '/my',
      '/users',
      '/profile',
    ])
  })

  it('tersembunyi dan tanpa latar belakang saat tertutup', () => {
    const wrapper = mountSidebar()

    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false)
    expect(wrapper.find('aside').classes()).toContain('-translate-x-full')
  })

  it('tampil dengan latar belakang saat terbuka', () => {
    const wrapper = mountSidebar({ open: true })

    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true)
    expect(wrapper.find('aside').classes()).toContain('translate-x-0')
  })

  it('menutup saat latar belakang diklik', async () => {
    const wrapper = mountSidebar({ open: true })

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('menutup saat tombol tutup diklik', async () => {
    const wrapper = mountSidebar({ open: true })

    await wrapper.find('button[aria-label="Tutup menu"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('menutup saat salah satu menu diklik', async () => {
    const wrapper = mountSidebar({ open: true })

    await wrapper.findAll('nav a')[1].trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})