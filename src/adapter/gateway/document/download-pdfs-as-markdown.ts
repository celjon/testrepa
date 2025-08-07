import pdf from 'pdf-parse'
import axios from 'axios'

type Source = {
  title: string
  snippet: string
  summary: string
  resources: string[]
}

export type DownloadPDFsAsMarkdown = (sources: Source[]) => Promise<
  {
    title: string
    text: string
    link: string
    meta: { info: string; metadata: string; summary: string }
  }[]
>

export const buildDownloadPDFsAsMarkdown = (): DownloadPDFsAsMarkdown => async (sources) => {
  const tasks = sources.flatMap((source) =>
    source.resources.map(async (link) => {
      try {
        const resp = await axios.get(link, { responseType: 'arraybuffer' })
        let text = ''
        let meta = { info: '', metadata: '', summary: source.summary }
        await pdf(resp.data).then(function (data) {
          text = data.text
          meta.info = data.info
          meta.metadata = data.metadata
        })
        return {
          title: source.title,
          text,
          link,
          meta,
        }
      } catch (error) {
        return undefined
      }
    }),
  )
  let downloadedPDFSources = await Promise.all(tasks)
  return downloadedPDFSources.filter((item) => item !== undefined)
}
