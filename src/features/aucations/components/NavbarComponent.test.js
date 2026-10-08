import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import NavbarComponent from './NavbarComponent.vue'
import { getProfile } from '../../users/api/userApi'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper'
import { showConfirmDialog } from '../../../helpers/toolsHelper'

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

const Page = { render: () => null }
const profile = { id: 1, name: 'Feny Pasaribu', email: 'feny@delcom.org', photo: null }

let pinia
let router

beforeEach(async () => {
  localStorage.clear()
  vi.resetAllMocks()
  getProfile.mockResolvedValue({ status: 'success', data: { user: profile } })

  pinia = createPinia()
  setActivePinia(pinia)
  router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/my', '/users', '/profile', '/auth/login'].map((path) => ({
      path,
      component: Page,
    })),
  })
  await router.push('/')
  await router.isReady()
})

async function mountNavbar() {
  const wrapper = mount(NavbarComponent, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}

describe('identitas akun', () => {
  it('memuat profil dan menampilkan nama', async () => {
    const wrapper = await mountNavbar()

    expect(getProfile).toHaveBeenCalledTimes(1)
    const link = wrapper.find('a[href="/profile"]')
    expect(link.text()).toContain('Feny Pasaribu')
  })

  it('tidak memuat ulang jika profil sudah ada', async () => {
    useUsersStore().profile = profile

    const wrapper = await mountNavbar()

    expect(getProfile).not.toHaveBeenCalled()
    expect(wrapper.find('a[href="/profile"]').text()).toContain('Feny Pasaribu')
  })

  it('menampilkan nama pengganti jika profil gagal dimuat', async () => {
    getProfile.mockResolvedValue({ status: 'fail' })

    const wrapper = await mountNavbar()

    expect(wrapper.find('a[href="/profile"]').text()).toContain('Pengguna')
  })
})

describe('menu', () => {
  it('menampilkan menu cepat', async () => {
    const wrapper = await mountNavbar()

    const links = wrapper.findAll('nav[aria-label="Menu cepat"] a')
    expect(links.map((link) => link.attributes('href'))).toEqual(['/my', '/users'])
  })

  it('meminta sidebar dibuka lewat tombol menu', async () => {
    const wrapper = await mountNavbar()

    await wrapper.find('button[aria-label="Buka menu"]').trigger('click')

    expect(wrapper.emitted('toggle-sidebar')).toHaveLength(1)
  })
})

describe('logout', () => {
  async function clickLogout(wrapper) {
    const button = wrapper.findAll('button').find((item) => item.text().includes('Keluar'))
    await button.trigger('click')
    await flushPromises()
  }

  it('keluar, mengosongkan profil, dan menuju halaman login saat dikonfirmasi', async () => {
    putAccessToken('abc')
    showConfirmDialog.mockResolvedValue(true)
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = await mountNavbar()

    await clickLogout(wrapper)

    expect(showConfirmDialog).toHaveBeenCalled()
    expect(useAuthStore().isAuthLogout).toBe(true)
    expect(getAccessToken()).toBeNull()
    expect(useUsersStore().profile).toBeNull()
    expect(pushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('tidak melakukan apa-apa jika dibatalkan', async () => {
    putAccessToken('abc')
    showConfirmDialog.mockResolvedValue(false)
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = await mountNavbar()

    await clickLogout(wrapper)

    expect(useAuthStore().isAuthLogout).toBe(false)
    expect(getAccessToken()).toBe('abc')
    expect(useUsersStore().profile).toEqual(profile)
    expect(pushSpy).not.toHaveBeenCalled()
  })
})