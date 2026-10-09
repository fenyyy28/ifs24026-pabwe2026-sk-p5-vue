import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { getActivePinia } from 'pinia'
import { createMemoryHistory, createRouter, RouterView, useRoute } from 'vue-router'
import {
  createMockPinia,
  createMemoryRouter,
  renderWithProviders,
  flushPromises,
} from './test-utils'
import { useUsersStore } from './features/users/states/usersStore'

const profile = { id: 1, name: 'Feny Pasaribu', email: 'feny@delcom.org', photo: null }
const Empty = { render: () => null }

const Probe = {
  props: { label: { type: String, default: 'probe' } },
  setup(props, { slots }) {
    const store = useUsersStore()
    const route = useRoute()

    return () =>
      h('div', [
        h('p', { id: 'label' }, props.label),
        h('p', { id: 'name' }, store.profile ? store.profile.name : 'kosong'),
        h('p', { id: 'path' }, route.path),
        slots.default ? slots.default() : null,
      ])
  },
}

describe('createMockPinia', () => {
  it('membuat Pinia kosong dan menjadikannya aktif', () => {
    const pinia = createMockPinia()

    expect(getActivePinia()).toBe(pinia)
    expect(pinia.state.value).toEqual({})
  })

  it('mengisi state awal store', () => {
    const pinia = createMockPinia({ users: { profile } })

    expect(useUsersStore(pinia).profile).toEqual(profile)
  })
})

describe('createMemoryRouter', () => {
  it('menyediakan rute tambahan dan rute cadangan', async () => {
    const router = createMemoryRouter([{ path: '/users', name: 'users', component: Empty }])

    await router.push('/users')
    expect(router.currentRoute.value.name).toBe('users')

    await router.push('/apa-saja')
    expect(router.currentRoute.value.path).toBe('/apa-saja')
    expect(router.currentRoute.value.name).toBeUndefined()
  })

  it('bekerja tanpa rute tambahan', async () => {
    const router = createMemoryRouter()

    await router.push('/')

    expect(router.currentRoute.value.path).toBe('/')
  })
})

describe('renderWithProviders', () => {
  it('memakai nilai bawaan', async () => {
    const { wrapper, pinia, router } = await renderWithProviders(Probe)

    expect(wrapper.find('#label').text()).toBe('probe')
    expect(wrapper.find('#name').text()).toBe('kosong')
    expect(wrapper.find('#path').text()).toBe('/')
    expect(router.currentRoute.value.path).toBe('/')
    expect(getActivePinia()).toBe(pinia)
  })

  it('meneruskan props, slot, rute, dan state awal', async () => {
    const { wrapper } = await renderWithProviders(Probe, {
      props: { label: 'Judul' },
      slots: { default: () => h('em', 'isi slot') },
      route: '/users?x=1',
      initialState: { users: { profile } },
    })

    expect(wrapper.find('#label').text()).toBe('Judul')
    expect(wrapper.find('#name').text()).toBe('Feny Pasaribu')
    expect(wrapper.find('#path').text()).toBe('/users')
    expect(wrapper.find('em').text()).toBe('isi slot')
  })

  it('memakai daftar rute yang diberikan', async () => {
    const { router } = await renderWithProviders(Probe, {
      routes: [{ path: '/users', name: 'users', component: Empty }],
      route: '/users',
    })

    expect(router.currentRoute.value.name).toBe('users')
  })

  it('merender halaman cadangan untuk rute yang tidak terdaftar', async () => {
    const { wrapper, router } = await renderWithProviders(
      { render: () => h(RouterView) },
      { route: '/apa-saja' },
    )

    expect(router.currentRoute.value.path).toBe('/apa-saja')
    expect(wrapper.text()).toBe('')
  })

  it('memakai Pinia yang diberikan', async () => {
    const custom = createMockPinia({ users: { profile } })

    const { wrapper, pinia } = await renderWithProviders(Probe, { pinia: custom })

    expect(pinia).toBe(custom)
    expect(wrapper.find('#name').text()).toBe('Feny Pasaribu')
  })

  it('memakai router yang diberikan', async () => {
    const custom = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/khusus', component: Empty }],
    })

    const { wrapper, router } = await renderWithProviders(Probe, {
      router: custom,
      route: '/khusus',
    })

    expect(router).toBe(custom)
    expect(wrapper.find('#path').text()).toBe('/khusus')
  })
})

describe('flushPromises', () => {
  it('diekspor ulang dari @vue/test-utils', () => {
    expect(typeof flushPromises).toBe('function')
  })
})