import { describe, it, expect } from 'vitest'
import { useInput } from './useInput'

describe('useInput', () => {
  it('memakai nilai awal default berupa string kosong', () => {
    const { value } = useInput()
    expect(value.value).toBe('')
  })

  it('memperbarui nilai lewat handleChange', () => {
    const { value, handleChange } = useInput('awal')
    expect(value.value).toBe('awal')

    handleChange({ target: { value: 'baru' } })
    expect(value.value).toBe('baru')
  })

  it('mengembalikan nilai awal lewat reset', () => {
    const { value, handleChange, reset } = useInput('awal')
    handleChange({ target: { value: 'baru' } })

    reset()
    expect(value.value).toBe('awal')
  })
})