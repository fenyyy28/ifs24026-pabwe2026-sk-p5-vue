<script setup>
import { Gavel, ShieldCheck, Timer, TrendingUp } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})

const highlights = [
  { icon: Timer, text: 'Pantau lelang yang sedang berlangsung secara langsung' },
  { icon: TrendingUp, text: 'Ajukan penawaran dan ikuti perkembangannya' },
  { icon: ShieldCheck, text: 'Kelola lelang milikmu dengan aman' },
]
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <aside
      class="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div class="absolute -right-24 -top-24 size-80 rounded-full bg-white/10" />
      <div class="absolute -bottom-32 -left-20 size-96 rounded-full bg-white/5" />

      <div class="relative flex items-center gap-3">
        <span class="grid size-11 place-items-center rounded-xl bg-white/15">
          <Gavel class="size-6" />
        </span>
        <span class="text-xl font-bold">Delcom Auction</span>
      </div>

      <div class="relative">
        <h2 class="text-4xl font-extrabold leading-tight">
          Temukan, tawar, dan menangkan lelang favoritmu.
        </h2>
        <ul class="mt-8 space-y-4">
          <li
            v-for="item in highlights"
            :key="item.text"
            class="flex items-center gap-3 text-indigo-100"
          >
            <component :is="item.icon" class="size-5 shrink-0" />
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <p class="relative text-sm text-indigo-200">
        &copy; Delcom Auction
      </p>
    </aside>

    <main class="flex items-center justify-center bg-slate-50 px-6 py-12">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-2 lg:hidden">
          <span class="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
            <Gavel class="size-5" />
          </span>
          <span class="text-lg font-bold text-slate-900">Delcom Auction</span>
        </div>

        <h1 class="text-2xl font-bold text-slate-900">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1.5 text-sm text-slate-500">{{ subtitle }}</p>

        <div class="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <slot />
        </div>

        <div class="mt-6 text-center text-sm text-slate-600">
          <slot name="footer" />
        </div>
      </div>
    </main>
  </div>
</template>