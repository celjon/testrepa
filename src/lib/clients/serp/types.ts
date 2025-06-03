import { SearchParams, SearchResults } from '@/adapter/gateway/webSearch/types'

export type SerpApiClient = {
  getSearchResults: (params: SearchParams) => Promise<SearchResults>
  getGoogleScholarSearchResults: (params: SearchParams) => Promise<GoogleScholarSearchResults>
}

export type RawSearchResults = {
  search_metadata: {
    id: string
    status: string
  }
  recipes_results: {
    title: string
    link: string
    source: string
    total_time: string
    ingredients: string[]
    thumbnail: string
  }[]
  shopping_results: {
    position: number
    block_position: string
    title: string
    price: string
    extracted_price: number
    link: string
    source: string
    reviews: number
    thumbnail: string
  }[]

  local_results: {
    more_locations_link: string
    places: {
      position: 1
      title: string
      place_id: string
      lsig: string
      place_id_search: string
      rating: number
      reviews: number
      price: string
      type: string
      address: string
      thumbnail: string
      gps_coordinates: {
        latitude: number
        longitude: number
      }
    }[]
  }

  organic_results: {
    position: number
    title: string
    link: string
    redirect_link: string
    displayed_link: string
    date?: string
    snippet: string
    sitelinks: {
      inline: { title: string; link: string }[]
    }
    rich_snippet?: {
      bottom: {
        extensions: string[]
        detected_extensions: Record<string, number>
      }
    }
    about_this_result: {
      source: {
        description: string
        source_info_link: string
        security: string
        icon: string
      }
      keywords: string[]
      related_keywords: string[]
      languages: string[]
      regions: string[]
    }
    about_page_link: string
    about_page_serpapi_link: string
    cached_page_link: string
    related_pages_link?: string
  }[]

  related_searches: {
    query: string
    link: string
  }[]
}
export type RawGoogleScholarSearchResults = {
  search_metadata: {
    id: string
    status: string
    json_endpoint: string
    created_at: Date
    processed_at: Date
    google_scholar_url: string
    raw_html_file: string
    total_time_taken: number
  }
  search_parameters: {
    engine: string
    q: string
  }
  search_information: {
    total_results: number
    time_taken_displayed: number
    query_displayed: string
  }
  organic_results: {
    position: number
    title: string //
    result_id: string
    link: string //
    snippet: string //
    publication_info: {
      //
      summary: string
      authors?: {
        name: string
        link: string
        serpapi_scholar_link: string
        author_id?: string
        email?: string
        cited_by?: number
      }[]
    }
    resources?: {
      //
      title: string
      file_format: string
      link: string //
    }[]
    inline_links: {
      serpapi_cite_link: string
      cited_by: {
        total: number
        link: string
        cites_id: string
        serpapi_scholar_link: string
      }
      related_pages_link: string
      serpapi_related_pages_link: string
      versions: {
        total: number
        link: string
        cluster_id: string
        serpapi_scholar_link: string
      }
      cached_page_link?: string
    }
  }[]
  profiles?: {
    title: string
    link: string
    serpapi_link: string
    authors: {
      name: string
      link: string
      serpapi_scholar_link: string
      author_id?: string
      email?: string
      cited_by?: number
    }[]
  }
  related_searches: [
    {
      query: string
      link: string
    }
  ]
  pagination: {
    current: number
    next: string
    other_pages: {
      [page: number]: string
    }
  }
  serpapi_pagination: {
    current: number
    other_pages: {
      [page: number]: string
    }
    next: string
    next_link: string
  }
}
export type GoogleScholarSearchResults = {
  position: number
  title: string
  result_id: string
  link: string
  snippet: string
  publication_info: {
    summary: string
    authors?: {
      name: string
      link: string
      serpapi_scholar_link: string
      author_id?: string
      email?: string
      cited_by?: number
    }[]
  }
  resources?: {
    title: string
    file_format: string
    link: string
  }[]
  inline_links: {
    serpapi_cite_link: string
    cited_by: {
      total: number
      link: string
      cites_id: string
      serpapi_scholar_link: string
    }
    related_pages_link: string
    serpapi_related_pages_link: string
    versions: {
      total: number
      link: string
      cluster_id: string
      serpapi_scholar_link: string
    }
    cached_page_link?: string
  }
}[]
