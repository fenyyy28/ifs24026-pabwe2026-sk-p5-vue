import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('menampilkan judul aplikasi', () => {
    expect(mount(App).text()).toContain('Delcom Auction')
  })
})