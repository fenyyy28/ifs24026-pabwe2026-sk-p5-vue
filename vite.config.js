import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * Menyisipkan CSS utama langsung ke index.html saat build, sehingga
 * browser tidak perlu menunggu file CSS terpisah sebelum menampilkan halaman.
 * Jika file CSS tidak ditemukan, tag <link> aslinya dibiarkan.
 */
function inlineEntryCss() {
  return {
    name: 'inline-entry-css',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        if (!context.bundle) return html

        return html.replace(
          /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+\.css)"[^>]*>/g,
          (tag, href) => {
            const asset = context.bundle[href.replace(/^\//, '')]
            return asset && typeof asset.source === 'string'
              ? `<style>${asset.source}</style>`
              : tag
          },
        )
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  // Prefix '' agar APP_PORT (tanpa awalan VITE_) ikut terbaca
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss(), inlineEntryCss()],

    server: {
      port: Number(env.APP_PORT) || 5173,
    },

    build: {
      sourcemap: true,
    },

    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1',
      ),
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
      testTimeout: 20000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{js,vue}'],
        exclude: ['src/main.js', 'src/setupTests.js', 'src/**/*.test.js'],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  }
})