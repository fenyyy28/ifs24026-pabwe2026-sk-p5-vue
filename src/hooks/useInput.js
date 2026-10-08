import { ref } from 'vue'

export function useInput(initialValue = '') {
  const value = ref(initialValue)

  const handleChange = (event) => {
    value.value = event.target.value
  }

  const reset = () => {
    value.value = initialValue
  }

  return { value, handleChange, reset }
}