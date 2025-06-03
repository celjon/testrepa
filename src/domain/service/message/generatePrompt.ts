import { Adapter } from '@/domain/types'
import { IFile } from '@/domain/entity/file'
import { IVoice } from '@/domain/entity/voice'
import { logger } from '@/lib/logger'
import { extname } from 'path'
import { PerformURLAnalysis } from './performURLAnalysis'
import { FileService } from '../file'
import { IVideo } from '@/domain/entity/video'

type Params = Adapter & {
  fileService: FileService
  performURLAnalysis: PerformURLAnalysis
}

type DocumentType = 'text' | 'word' | 'excel' | 'pdf'

const typeMap: Record<string, DocumentType> = {
  '.docx': 'word',
  '.xlsx': 'excel',
  '.pdf': 'pdf'
}

export type GeneratePrompt = (params: {
  content?: string | null
  voice?: IVoice | null
  video?: IVideo | null
  files?: IFile[]
  analyzeURLs?: boolean
  dek?: Buffer | null
}) => Promise<{
  prompt: string
  caps: number
}>

export const buildGeneratePrompt = (adapter: Params): GeneratePrompt => {
  const { storageGateway, documentGateway, performURLAnalysis, fileService } = adapter

  return async ({ content, files, voice, video, analyzeURLs = false, dek }) => {
    let prompt = ''
    let caps = 0

    if (voice && voice.content.trim().length > 0) {
      prompt += voice.content + ' '
    }

    if (video && video.content.trim().length > 0) {
      prompt += video.content + ' '
    }

    if (content && content.trim().length > 0) {
      prompt = content
    }

    if (files) {
      const filesMarkdown = await Promise.all(
        files.map(async (file) => {
          if (dek) {
            file = await fileService.decrypt({
              file,
              dek
            })
          }

          if (!file.path) {
            return '(empty content or incorrect format)'
          }

          const buffer = await storageGateway.read({
            path: file.path
          })
          if (!buffer || buffer.length === 0) {
            return '(empty content or incorrect format)'
          }

          // remove query parameters from file path
          const ext = file.path ? extname(file.path.replace(/\?.*$/g, '')) : '.txt'

          const type = ext in typeMap ? typeMap[ext] : 'text'

          return documentGateway.toMarkdown({
            type,
            buffer,
            convertImage: async (buffer, ext) => {
              const { url } = await storageGateway.write({
                buffer,
                ext
              })

              return url
            }
          })
        })
      )

      if (filesMarkdown.length > 0) {
        prompt +=
          'You are an assistant capable of processing the content of files provided as text.\nPlease perform all tasks requested by the user using the content of the files.\nFiles content:\n'
      }

      prompt = filesMarkdown.reduce(
        (prompt, fileMarkdown, index) => prompt + `\n\nDocument file ${JSON.stringify(files[index].name)}:\n${fileMarkdown}`,
        prompt
      )
    }

    let urlAnalysisResult = ''
    if (analyzeURLs) {
      try {
        // people can load large files with urls,
        // most programming languages has syntax containing url like strings, so
        // perform URL analysis only on original prompt
        const { analysisResult, caps: analysisCaps } = await performURLAnalysis(content || '')
        urlAnalysisResult = analysisResult
        caps += analysisCaps
      } catch (e) {
        logger.error(`Failed to analyze urls: ${e}`)

        urlAnalysisResult = '(failed to analyze urls)'
      }
    }

    if (urlAnalysisResult) {
      prompt += `\n\n${urlAnalysisResult}`
    }

    return {
      prompt,
      caps
    }
  }
}
