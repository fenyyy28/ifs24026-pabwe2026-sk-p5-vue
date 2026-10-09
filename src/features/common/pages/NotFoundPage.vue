<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, Gavel, Home } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
    <div class="w-full max-w-md text-center">
      <span
        class="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-600 text-white"
      >
        <Gavel class="size-7" />
      </span>

      <p class="mt-8 text-7xl font-extrabold tracking-tight text-indigo-600">404</p>
      <h1 class="mt-4 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
      <p class="mt-2 text-sm text-slate-500">
        Alamat yang kamu tuju tidak ada atau sudah dipindahkan. Periksa kembali
        alamatnya, atau kembali ke beranda.
      </p>

      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="router.back()"
        >
          <ArrowLeft class="size-4" />
          Kembali
        </button>
        <RouterLink
          to="/"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Home class="size-4" />
          Ke beranda
        </RouterLink>
      </div>
    </div>
  </main>
</template>