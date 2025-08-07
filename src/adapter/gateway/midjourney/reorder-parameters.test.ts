import { describe, expect, test } from 'vitest'
import { reorderParameters } from './reorder-parameters'

describe('reorderParameters', () => {
  test('returns the same prompt if there are no flags', () => {
    const input = 'just some prompt text'
    expect(reorderParameters(input)).toBe('just some prompt text')
  })

  test('moves supported flags to the end and dedupes', () => {
    const input = 'scene --ar 16:9 --q 2 vivid --chaos 50 --ar 4:3'
    const expected = 'scene vivid --q 2 --chaos 50 --ar 4:3'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('handles list-style flags (Infinity args) correctly', () => {
    const input = 'forest --no trees animals rocks end'
    const expected = 'forest --no trees animals rocks end'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('handles list-style flags with commas', () => {
    const input = 'still life gouache painting --no fruit, apple, pear'
    const expected = 'still life gouache painting --no fruit apple pear'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('only keeps the last occurrence of a list-style flag', () => {
    const input = 'a scene --no cat dog --no rock'
    const expected = 'a scene --no rock'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('escapes unsupported flags', () => {
    const input = 'a scene --no cat dog --foo bar human --no rock'
    const expected = 'a scene "--foo" bar human --no rock'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('handles prompts consisting only of flags', () => {
    const input = '--ar 16:9 --chaos 50'
    const expected = ' --ar 16:9 --chaos 50'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('handles an empty string', () => {
    expect(reorderParameters('')).toBe('')
  })

  test('handles text with quotes', () => {
    const input = 'a "mystical forest" --ar 3:2'
    const expected = 'a "mystical forest" --ar 3:2'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('removes dots at the end of argument', () => {
    const input = 'a "mystical forest" --version 6.'
    const expected = 'a "mystical forest" --version 6'
    expect(reorderParameters(input)).toBe(expected)
  })

  test('removes quotes at the end of argument', () => {
    const input = `'a "mystical forest --version 6" --ar 3:2'`
    const expected = `'a "mystical forest --version 6 --ar 3:2`
    expect(reorderParameters(input)).toBe(expected)
  })

  test('lowercases parameters', () => {
    const input = `International Women's Day --AR 3:2`
    const expected = `International Women's Day --ar 3:2`
    expect(reorderParameters(input)).toBe(expected)
  })

  test('converts em dash to --', () => {
    const input = `International Women's Day —ar 3:2`
    const expected = `International Women's Day --ar 3:2`
    expect(reorderParameters(input)).toBe(expected)
  })

  test('wraps words with em dash "—" if parameter not supported', () => {
    const input = `a pile of beautifully arranged in a circle — neatly and evenly sliced large juicy rich beautiful steaks of various raw meats —without greens`
    const expected = `a pile of beautifully arranged in a circle — neatly and evenly sliced large juicy rich beautiful steaks of various raw meats "—without" greens`
    expect(reorderParameters(input)).toBe(expected)
  })

  test('wraps words with "-" if parameter not supported', () => {
    const input = `G1 1/4 -B; H 39;`
    const expected = `G1 1/4 "-B;" H 39;`
    expect(reorderParameters(input)).toBe(expected)
  })

  test('converts - to --', () => {
    const input = `two cartoon creatures at a techno party, developed sense of color, cartoon style, 8k, rich details, ultra-wide angle, -S 400 -AR 2:3`
    const expected = `two cartoon creatures at a techno party, developed sense of color, cartoon style, 8k, rich details, ultra-wide angle, --s 400 --ar 2:3`
    expect(reorderParameters(input)).toBe(expected)
  })

  test('escapes negative numbers', () => {
    const input = `-10% на всё, -10 на всё, -10.2`
    const expected = `"-10%" на всё, "-10" на всё, "-10.2"`
    expect(reorderParameters(input)).toBe(expected)
  })
})
