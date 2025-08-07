export type SearchParams = {
  query: string
  engine?: string
  numResults?: number
  skip?: number
  location?: string
  country?: string
  language?: string
}

export type SearchResults = {
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
    cached_page_link: string
    related_pages_link?: string
  }[]
}
export type SearchResultsAndContents = {
  results: {
    url: string
    title: string | null
    snippet: string | null
    content: string
  }[]
  costDollars: number
}

export type MarkdownContent = {
  title: string
  description: string
  url: string
  content: string
  tokens: number
}
