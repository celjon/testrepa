import { describe, expect, it } from '@jest/globals'

import { adjustSearchQueries } from './generateSearchQueries'
import { SearchQueries } from './types'

describe('adjustSearchQueries', () => {
  it('should remove duplicate queries and trim query strings', () => {
    const queries: SearchQueries = [
      { rationale: 'test', type: 'search', numResults: 3, query: ' test query ' },
      { rationale: 'test duplicate', type: 'search', numResults: 2, query: 'test query' }
    ]
    const adjusted = adjustSearchQueries([...queries], 10)
    // Expect only one query to remain after duplicate removal.
    expect(adjusted.length).toBe(1)
    expect(adjusted[0].query).toBe('test query')
  })

  it('should convert invalid website URLs to search and set numResults to 1', () => {
    const queries: SearchQueries = [
      {
        rationale: 'should be website but invalid',
        type: 'website',
        numResults: 5,
        query: 'invalid-url'
      }
    ]
    const adjusted = adjustSearchQueries([...queries], 10)
    expect(adjusted[0].type).toBe('search')
    expect(adjusted[0].numResults).toBeLessThanOrEqual(5)
  })

  it('should cap total results to the specified maximum', () => {
    const queries: SearchQueries = [
      { rationale: 'first', type: 'search', numResults: 16, query: 'query 1' },
      { rationale: 'second', type: 'search', numResults: 16, query: 'query 2' }
    ]
    const adjusted = adjustSearchQueries([...queries], 10)
    const totalResults = adjusted.reduce((sum, q) => sum + q.numResults, 0)
    expect(totalResults).toBeLessThanOrEqual(10)
  })

  it('should leave valid website URLs with numResults equal to 1', () => {
    const queries: SearchQueries = [
      {
        rationale: 'valid website',
        type: 'website',
        numResults: 5,
        query: 'https://example.com'
      }
    ]
    const adjusted = adjustSearchQueries([...queries], 10)
    expect(adjusted[0].type).toBe('website')
    expect(adjusted[0].numResults).toBe(1)
  })

  it('should set numResults to 1 for all websites including invalid ones', () => {
    const queries: SearchQueries = [
      { rationale: 'valid website', type: 'website', numResults: 5, query: 'https://example.com' },
      { rationale: 'invalid website', type: 'website', numResults: 50, query: 'invalid-url' }
    ]
    const adjusted = adjustSearchQueries([...queries], 10)
    expect(adjusted.length).toBe(2)
    expect(adjusted[0].type).toBe('website')
    expect(adjusted[0].numResults).toBe(1)
    expect(adjusted[1].type).toBe('search')
    expect(adjusted[1].numResults).toBe(1)
  })
})
