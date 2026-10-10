<script setup>
defineProps({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  label: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  type: { type: String, default: 'text' },
  value: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
})

defineEmits(['input'])
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="relative mt-1.5">
      <component
        :is="icon"
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600"
      />
      <input
        :id="id"
        :name="name"
        :type="type"
        :value="value"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="Boolean(error)"
        class="w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-600 focus:ring-2"
        :class="
          error
            ? 'border-rose-400 focus:ring-rose-200'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
        "
        @input="$emit('input', $event)"
      />
    </div>
    <p v-if="error" class="mt-1.5 text-xs text-rose-600">{{ error }}</p>
  </div>
</template>