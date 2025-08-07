import { describe, expect, test } from 'vitest'
import { leaveJSON } from './leave-json'

describe('leaveJSON', () => {
  test('should extract JSON content within curly braces', () => {
    const input = 'Some text before { "key": "value" } some text after'
    expect(leaveJSON(input)).toBe('{ "key": "value" }')
  })

  test('should handle nested curly braces', () => {
    const input = '{ "outer": { "inner": "value" } }'
    expect(leaveJSON(input)).toBe('{ "outer": { "inner": "value" } }')
  })

  test('should return the entire input if no curly braces are found', () => {
    const input = 'No JSON content here'
    expect(leaveJSON(input)).toBe(input)
  })

  test('should handle empty curly braces', () => {
    const input = 'Empty {}'
    expect(leaveJSON(input)).toBe('{}')
  })

  test('should handle complex nested structures', () => {
    const input = '{ "a": 1, "b": { "c": [1, 2, {"d": 3}], "e": {"f": 4} } }'
    expect(leaveJSON(input)).toBe(input)
  })

  test('should handle markdown-like structures', () => {
    const input = '```json\n{ "a": 1, "b": { "c": [1, 2, {"d": 3}], "e": {"f": 4} } }\n```'
    expect(leaveJSON(input)).toBe('{ "a": 1, "b": { "c": [1, 2, {"d": 3}], "e": {"f": 4} } }')
  })
})
