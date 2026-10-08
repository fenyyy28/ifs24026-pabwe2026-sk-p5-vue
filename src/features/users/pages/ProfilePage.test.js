import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ProfilePage from './ProfilePage.vue'
import { getProfile, putProfile, postPhoto, putPassword } from '../api/userApi'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'

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

const profile = { id: 1, name: 'Feny Pasaribu', email: 'feny@delcom.org', photo: null }

async function mountPage() {
  const wrapper = mount(ProfilePage, { global: { plugins: [createPinia()] } })
  await flushPromises()
  return wrapper
}

async function chooseFile(wrapper, file) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: file ? [file] : [],
    configurable: true,
  })
  await input.trigger('change')
  await flushPromises()
}

beforeEach(() => {
  vi.resetAllMocks()
  getProfile.mockResolvedValue({ status: 'success', data: { user: profile } })
})

describe('memuat profil', () => {
  it('menampilkan profil dan mengisi form', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Profil Saya')
    expect(wrapper.find('#name').element.value).toBe('Feny Pasaribu')
    expect(wrapper.find('#email').element.value).toBe('feny@delcom.org')
  })

  it('menampilkan kerangka saat memuat', async () => {
    let resolveRequest
    getProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const wrapper = mount(ProfilePage, { global: { plugins: [createPinia()] } })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.animate-pulse')).toHaveLength(3)

    resolveRequest({ status: 'success', data: { user: profile } })
    await flushPromises()

    expect(wrapper.findAll('.animate-pulse')).toHaveLength(0)
  })

  it('menampilkan dialog error saat gagal memuat', async () => {
    getProfile.mockResolvedValue({ status: 'fail', message: 'Token tidak valid' })

    const wrapper = await mountPage()

    expect(showErrorDialog).toHaveBeenCalledWith('Token tidak valid')
    expect(wrapper.text()).toContain('Profil tidak dapat dimuat.')
    expect(wrapper.find('#name').exists()).toBe(false)
  })
})

describe('ubah profil', () => {
  it('menolak data tidak valid', async () => {
    const wrapper = await mountPage()

    await wrapper.find('#name').setValue('   ')
    await wrapper.find('#email').setValue('abc')
    await wrapper.find('#profile-form').trigger('submit')

    expect(wrapper.text()).toContain('Nama wajib diisi')
    expect(wrapper.text()).toContain('Format email tidak valid')
    expect(putProfile).not.toHaveBeenCalled()
  })

  it('menyimpan perubahan dan menampilkan dialog sukses', async () => {
    putProfile.mockResolvedValue({ status: 'success', message: 'Berhasil mengubah data' })
    const wrapper = await mountPage()

    await wrapper.find('#name').setValue(' Budi ')
    await wrapper.find('#email').setValue(' budi@mail.com ')
    await wrapper.find('#profile-form').trigger('submit')
    await flushPromises()

    expect(putProfile).toHaveBeenCalledWith({ name: 'Budi', email: 'budi@mail.com' })
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil mengubah data')
  })

  it('menampilkan dialog error saat gagal menyimpan', async () => {
    putProfile.mockResolvedValue({ status: 'fail', message: 'Email sudah dipakai' })
    const wrapper = await mountPage()

    await wrapper.find('#profile-form').trigger('submit')
    await flushPromises()

    expect(showErrorDialog).toHaveBeenCalledWith('Email sudah dipakai')
    expect(showSuccessDialog).not.toHaveBeenCalled()
  })

  it('menonaktifkan tombol selama proses', async () => {
    let resolveRequest
    putProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const wrapper = await mountPage()

    await wrapper.find('#profile-form').trigger('submit')

    const button = wrapper.find('#profile-form button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toContain('Menyimpan...')

    resolveRequest({ status: 'fail', message: 'x' })
    await flushPromises()

    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.text()).toBe('Simpan perubahan')
  })
})

describe('ganti kata sandi', () => {
  async function fillPasswords(wrapper, { current, next, confirm }) {
    await wrapper.find('#current-password').setValue(current)
    await wrapper.find('#new-password').setValue(next)
    await wrapper.find('#confirm-password').setValue(confirm)
  }

  it('menolak form kosong', async () => {
    const wrapper = await mountPage()

    await wrapper.find('#password-form').trigger('submit')

    expect(wrapper.text()).toContain('Kata sandi saat ini wajib diisi')
    expect(wrapper.text()).toContain('Kata sandi wajib diisi')
    expect(wrapper.text()).toContain('Konfirmasi kata sandi wajib diisi')
    expect(putPassword).not.toHaveBeenCalled()
  })

  it('mengganti kata sandi lalu mengosongkan form', async () => {
    putPassword.mockResolvedValue({
      status: 'success',
      message: 'Berhasil mengubah kata sandi',
    })
    const wrapper = await mountPage()

    await fillPasswords(wrapper, { current: 'lama123', next: 'rahasia1', confirm: 'rahasia1' })
    await wrapper.find('#password-form').trigger('submit')
    await flushPromises()

    expect(putPassword).toHaveBeenCalledWith({
      password: 'lama123',
      newPassword: 'rahasia1',
      newPasswordConfirmation: 'rahasia1',
    })
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil mengubah kata sandi')
    expect(wrapper.find('#current-password').element.value).toBe('')
    expect(wrapper.find('#new-password').element.value).toBe('')
    expect(wrapper.find('#confirm-password').element.value).toBe('')
  })

  it('menampilkan dialog error saat gagal', async () => {
    putPassword.mockResolvedValue({ status: 'fail', message: 'Kata sandi lama salah' })
    const wrapper = await mountPage()

    await fillPasswords(wrapper, { current: 'salah', next: 'rahasia1', confirm: 'rahasia1' })
    await wrapper.find('#password-form').trigger('submit')
    await flushPromises()

    expect(showErrorDialog).toHaveBeenCalledWith('Kata sandi lama salah')
    expect(wrapper.find('#new-password').element.value).toBe('rahasia1')
  })
})

describe('ganti foto', () => {
  it('membuka pemilih file saat tombol diklik', async () => {
    const wrapper = await mountPage()
    const input = wrapper.find('input[type="file"]')
    const clickSpy = vi.spyOn(input.element, 'click').mockImplementation(() => {})

    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('Ganti foto'))
      .trigger('click')

    expect(clickSpy).toHaveBeenCalled()
  })

  it('mengabaikan jika tidak ada file dipilih', async () => {
    const wrapper = await mountPage()

    await chooseFile(wrapper, null)

    expect(postPhoto).not.toHaveBeenCalled()
    expect(showErrorDialog).not.toHaveBeenCalled()
  })

  it('menolak file yang bukan gambar', async () => {
    const wrapper = await mountPage()

    await chooseFile(wrapper, new File(['x'], 'a.pdf', { type: 'application/pdf' }))

    expect(showErrorDialog).toHaveBeenCalledWith('File harus berupa gambar')
    expect(postPhoto).not.toHaveBeenCalled()
  })

  it('menolak gambar yang terlalu besar', async () => {
    const wrapper = await mountPage()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 })

    await chooseFile(wrapper, file)

    expect(showErrorDialog).toHaveBeenCalledWith('Ukuran foto maksimal 2 MB')
    expect(postPhoto).not.toHaveBeenCalled()
  })

  it('mengunggah foto dan menampilkan dialog sukses', async () => {
    postPhoto.mockResolvedValue({
      status: 'success',
      message: 'Berhasil mengubah photo profile',
    })
    const wrapper = await mountPage()
    const file = new File(['x'], 'a.png', { type: 'image/png' })

    await chooseFile(wrapper, file)

    expect(postPhoto).toHaveBeenCalledWith(file)
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil mengubah photo profile')
  })

  it('menampilkan dialog error saat unggah gagal', async () => {
    postPhoto.mockResolvedValue({ status: 'fail', message: 'Gagal mengunggah' })
    const wrapper = await mountPage()

    await chooseFile(wrapper, new File(['x'], 'a.png', { type: 'image/png' }))

    expect(showErrorDialog).toHaveBeenCalledWith('Gagal mengunggah')
  })
})