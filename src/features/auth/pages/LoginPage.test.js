import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LoginPage from './LoginPage.vue'
import { postLogin } from '../api/authApi'
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

const mountPage = () => mount(LoginPage, { global: { plugins: [createPinia()] } })

async function fill(wrapper, email, password) {
  await wrapper.find('#email').setValue(email)
  await wrapper.find('#password').setValue(password)
}

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
})

describe('LoginPage', () => {
  it('menampilkan form login', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Selamat datang kembali')
    expect(wrapper.find('button[type="submit"]').text()).toBe('Masuk')
    expect(wrapper.find('a').attributes('href')).toBe('/auth/register')
  })

  it('menampilkan error saat form kosong', async () => {
    const wrapper = mountPage()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Email wajib diisi')
    expect(wrapper.text()).toContain('Kata sandi wajib diisi')
    expect(postLogin).not.toHaveBeenCalled()
  })

  it('menolak format email tidak valid', async () => {
    const wrapper = mountPage()

    await fill(wrapper, 'abc', 'rahasia')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Format email tidak valid')
    expect(postLogin).not.toHaveBeenCalled()
  })

  it('menampilkan dialog error saat login gagal', async () => {
    postLogin.mockResolvedValue({ status: 'fail', message: 'Email atau kata sandi salah' })
    const wrapper = mountPage()

    await fill(wrapper, ' a@b.co ', 'rahasia')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(postLogin).toHaveBeenCalledWith({ email: 'a@b.co', password: 'rahasia' })
    expect(showErrorDialog).toHaveBeenCalledWith('Email atau kata sandi salah')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('menampilkan dialog sukses dan berpindah halaman saat berhasil', async () => {
    postLogin.mockResolvedValue({
      status: 'success',
      message: 'Berhasil login',
      data: { token: 'token-1', user: { id: 1 } },
    })
    const wrapper = mountPage()

    await fill(wrapper, 'a@b.co', 'rahasia')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil login')
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('menonaktifkan tombol selama proses login', async () => {
    let resolveLogin
    postLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve
      }),
    )
    const wrapper = mountPage()

    await fill(wrapper, 'a@b.co', 'rahasia')
    await wrapper.find('form').trigger('submit')

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toContain('Memproses...')

    resolveLogin({ status: 'fail', message: 'x' })
    await flushPromises()

    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.text()).toBe('Masuk')
  })
})