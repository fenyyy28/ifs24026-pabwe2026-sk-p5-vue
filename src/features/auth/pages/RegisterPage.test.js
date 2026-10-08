import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import RegisterPage from './RegisterPage.vue'
import { postRegister } from '../api/authApi'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('vue-router', async () => {
  const { h } = await import('vue')
  return {
    useRouter: () => ({ push: pushMock }),
    RouterLink: {
      props: ['to'],
      setup:
        (props, { slots }) =>
        () =>
          h('a', { href: props.to }, slots.default()),
    },
  }
})
vi.mock('../api/authApi', () => ({ postLogin: vi.fn(), postRegister: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}))

const mountPage = () => mount(RegisterPage, { global: { plugins: [createPinia()] } })

async function fill(wrapper, { name, email, password, confirm }) {
  await wrapper.find('#name').setValue(name)
  await wrapper.find('#email').setValue(email)
  await wrapper.find('#password').setValue(password)
  await wrapper.find('#confirmPassword').setValue(confirm)
}

const validForm = {
  name: ' Feny ',
  email: ' a@b.co ',
  password: 'rahasia',
  confirm: 'rahasia',
}

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
})

describe('RegisterPage', () => {
  it('menampilkan form registrasi', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Buat akun baru')
    expect(wrapper.find('button[type="submit"]').text()).toBe('Daftar')
    expect(wrapper.find('a').attributes('href')).toBe('/auth/login')
  })

  it('menampilkan error untuk semua kolom saat form kosong', async () => {
    const wrapper = mountPage()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Nama wajib diisi')
    expect(wrapper.text()).toContain('Email wajib diisi')
    expect(wrapper.text()).toContain('Kata sandi wajib diisi')
    expect(wrapper.text()).toContain('Konfirmasi kata sandi wajib diisi')
    expect(postRegister).not.toHaveBeenCalled()
  })

  it('menolak konfirmasi kata sandi yang berbeda', async () => {
    const wrapper = mountPage()

    await fill(wrapper, { ...validForm, confirm: 'lain-lain' })
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Konfirmasi kata sandi tidak sama')
    expect(postRegister).not.toHaveBeenCalled()
  })

  it('menampilkan dialog error saat registrasi gagal', async () => {
    postRegister.mockResolvedValue({ status: 'fail', message: 'Email sudah dipakai' })
    const wrapper = mountPage()

    await fill(wrapper, validForm)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(showErrorDialog).toHaveBeenCalledWith('Email sudah dipakai')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('menampilkan dialog sukses dan menuju halaman login saat berhasil', async () => {
    postRegister.mockResolvedValue({
      status: 'success',
      message: 'Berhasil melakukan pendaftaran',
    })
    const wrapper = mountPage()

    await fill(wrapper, validForm)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(postRegister).toHaveBeenCalledWith({
      name: 'Feny',
      email: 'a@b.co',
      password: 'rahasia',
    })
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil melakukan pendaftaran')
    expect(pushMock).toHaveBeenCalledWith('/auth/login')
  })

  it('menonaktifkan tombol selama proses registrasi', async () => {
    let resolveRegister
    postRegister.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve
      }),
    )
    const wrapper = mountPage()

    await fill(wrapper, validForm)
    await wrapper.find('form').trigger('submit')

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toContain('Memproses...')

    resolveRegister({ status: 'fail', message: 'x' })
    await flushPromises()

    expect(button.attributes('disabled')).toBeUndefined()
  })
})