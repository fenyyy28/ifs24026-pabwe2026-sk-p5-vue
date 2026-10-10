import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App).use(createPinia()).use(router)

// Tahan render sampai halaman pertama siap, supaya cangkang di index.html
// (berisi main dan h1) tetap tampil dan tidak ada momen halaman kosong.
const mountApp = () => app.mount('#app')
router.isReady().then(mountApp, mountApp)