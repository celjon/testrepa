export type ExcelData = {
  file: Buffer
  sheetName: string
  textColumn: string
}

export type ClusterizationTopic = {
  topic_id: number
  topic_name: string
  keywords: string[]
  percentage: number
  rows_count: number
  examples: string[]
}

export type ClusterizationNoise = {
  topic_id: number
  percentage: number
  rows_count: number
  examples: string[]
}

export type ClusterizationStats = {
  total_rows: number
  silhouette_score: number
  identified_topics: number
}

export interface ClusterizationResult {
  topics: ClusterizationTopic[]
  noise: ClusterizationNoise | null
  stats: ClusterizationStats
}
