import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import UsersPage from './UsersPage.vue'
import { getUsers } from '../api/userApi'
import { showErrorDialog } from '../../../helpers/toolsHelper'

vi.mock('../api/userApi', () => ({
  getUsers: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}))

const usersData = [
  { id: 1, name: 'Feny Pasaribu', email: 'feny@delcom.org', photo: null },
  { id: 2, name: 'Budi Santoso', email: 'budi@mail.com', photo: 'img/profile/2.png' },
]

async function mountPage() {
  const wrapper = mount(UsersPage, { global: { plugins: [createPinia()] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.resetAllMocks()
  getUsers.mockResolvedValue({ status: 'success', data: { users: usersData } })
})

describe('UsersPage', () => {
  it('menampilkan daftar pengguna', async () => {
    const wrapper = await mountPage()

    const cards = wrapper.findAll('li button')
    expect(cards).toHaveLength(2)
    expect(cards[0].text()).toContain('Feny Pasaribu')
    expect(cards[0].text()).toContain('feny@delcom.org')
    expect(cards[1].find('img').exists()).toBe(true)
  })

  it('menampilkan kerangka saat memuat', async () => {
    let resolveRequest
    getUsers.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const wrapper = mount(UsersPage, { global: { plugins: [createPinia()] } })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('li.animate-pulse')).toHaveLength(6)

    resolveRequest({ status: 'success', data: { users: usersData } })
    await flushPromises()

    expect(wrapper.findAll('li.animate-pulse')).toHaveLength(0)
  })

  it('menampilkan dialog error dan pesan kosong saat gagal memuat', async () => {
    getUsers.mockResolvedValue({ status: 'fail', message: 'Tidak berwenang' })

    const wrapper = await mountPage()

    expect(showErrorDialog).toHaveBeenCalledWith('Tidak berwenang')
    expect(wrapper.text()).toContain('Pengguna tidak ditemukan.')
  })

  it('mencari berdasarkan nama', async () => {
    const wrapper = await mountPage()

    await wrapper.find('#keyword').setValue('budi')

    const cards = wrapper.findAll('li button')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Budi Santoso')
  })

  it('mencari berdasarkan email tanpa membedakan huruf besar-kecil', async () => {
    const wrapper = await mountPage()

    await wrapper.find('#keyword').setValue('DELCOM.ORG')
    expect(wrapper.findAll('li button')).toHaveLength(1)
    expect(wrapper.text()).toContain('Feny Pasaribu')

    await wrapper.find('#keyword').setValue('mail.com')
    expect(wrapper.findAll('li button')).toHaveLength(1)
    expect(wrapper.text()).toContain('Budi Santoso')
  })

  it('menampilkan pesan jika pencarian tidak menemukan hasil', async () => {
    const wrapper = await mountPage()

    await wrapper.find('#keyword').setValue('zzz')

    expect(wrapper.findAll('li button')).toHaveLength(0)
    expect(wrapper.text()).toContain('Pengguna tidak ditemukan.')
  })

  it('menampilkan dan menutup detail pengguna', async () => {
    const wrapper = await mountPage()
    expect(wrapper.find('[data-testid="user-detail"]').exists()).toBe(false)

    await wrapper.findAll('li button')[0].trigger('click')

    const detail = wrapper.find('[data-testid="user-detail"]')
    expect(detail.text()).toContain('Feny Pasaribu')
    expect(detail.text()).toContain('feny@delcom.org')

    await wrapper.find('button[aria-label="Tutup detail"]').trigger('click')

    expect(wrapper.find('[data-testid="user-detail"]').exists()).toBe(false)
  })
})