<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:flex">
    <SidebarComponent :open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <NavbarComponent @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      <main class="flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>