import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

const StubPage = { render: () => null }

export { flushPromises }

/**
 * Membuat Pinia untuk test. `initialState` memakai id store sebagai kunci,
 * contoh: { users: { profile: { id: 1, name: 'Feny' } } }
 */
export function createMockPinia(initialState = {}) {
  const pinia = createPinia()
  pinia.state.value = initialState
  setActivePinia(pinia)
  return pinia
}

/** Router memory; rute yang tidak terdaftar jatuh ke halaman kosong. */
export function createMemoryRouter(routes = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [...routes, { path: '/:pathMatch(.*)*', component: StubPage }],
  })
}

/**
 * Me-render komponen dengan Pinia dan router memory, lalu menunggu
 * navigasi awal serta proses async (misalnya onMounted) selesai.
 * Mengembalikan { wrapper, pinia, router }.
 */
export async function renderWithProviders(
  component,
  {
    props = {},
    slots = {},
    route = '/',
    initialState = {},
    pinia = createMockPinia(initialState),
    routes = [],
    router = createMemoryRouter(routes),
  } = {},
) {
  await router.push(route)
  await router.isReady()

  const wrapper = mount(component, {
    props,
    slots,
    global: { plugins: [pinia, router] },
  })
  await flushPromises()

  return { wrapper, pinia, router }
}