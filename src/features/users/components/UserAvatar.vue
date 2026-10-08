<script setup>
import { computed, ref, watch } from 'vue'
import { getInitials, resolvePhotoUrl } from '../utils/userUtils'

const props = defineProps({
  name: { type: String, default: '' },
  photo: { type: String, default: '' },
  sizeClass: { type: String, default: 'size-12 text-base' },
})

const hasError = ref(false)
const src = computed(() => resolvePhotoUrl(props.photo))

watch(
  () => props.photo,
  () => {
    hasError.value = false
  },
)
</script>

<template>
  <img
    v-if="src && !hasError"
    :src="src"
    :alt="name"
    class="shrink-0 rounded-full object-cover ring-2 ring-white"
    :class="sizeClass"
    @error="hasError = true"
  />
  <span
    v-else
    class="grid shrink-0 place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-700"
    :class="sizeClass"
  >
    {{ getInitials(name) }}
  </span>
</template>