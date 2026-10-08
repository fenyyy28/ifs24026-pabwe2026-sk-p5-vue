import { describe, it, expect, vi, beforeEach } from 'vitest'
import { h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AucationLayout from './AucationLayout.vue'
import { getProfile } from '../../users/api/userApi'

vi.mock('../../users/api/userApi', () => ({
  getUsers: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper', () => ({
  showConfirmDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}))

const profile = { id: 1, name: 'Feny Pasaribu', email: 'feny@delcom.org', photo: null }
const HomeStub = { render: () => h('p', 'Isi halaman') }
const Empty = { render: () => null }

let wrapper

beforeEach(async () => {
  vi.resetAllMocks()
  getProfile.mockResolvedValue({ status: 'success', data: { user: profile } })

  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeStub },
      ...['/my', '/users', '/profile'].map((path) => ({ path, component: Empty })),
    ],
  })
  await router.push('/')
  await router.isReady()

  wrapper = mount(AucationLayout, { global: { plugins: [pinia, router] } })
  await flushPromises()
})

describe('AucationLayout', () => {
  it('menampilkan sidebar, navbar, dan isi halaman', () => {
    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').text()).toContain('Isi halaman')
    expect(wrapper.text()).toContain('Delcom Auction')
    expect(wrapper.text()).toContain('Feny Pasaribu')
  })

  it('membuka dan menutup sidebar lewat tombol menu', async () => {
    const hasBackdrop = () => wrapper.find('[data-testid="sidebar-backdrop"]').exists()
    expect(hasBackdrop()).toBe(false)

    await wrapper.find('button[aria-label="Buka menu"]').trigger('click')
    expect(hasBackdrop()).toBe(true)

    await wrapper.find('button[aria-label="Buka menu"]').trigger('click')
    expect(hasBackdrop()).toBe(false)
  })

  it('menutup sidebar saat latar belakang diklik', async () => {
    await wrapper.find('button[aria-label="Buka menu"]').trigger('click')

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger('click')

    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false)
  })
})