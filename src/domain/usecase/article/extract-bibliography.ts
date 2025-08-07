import dedent from 'dedent'
import { UseCaseParams } from '../types'
import { GetChildModel } from './get-child-model'
import { bibliographyResponseFormat } from '@/domain/usecase/article/types'
import { InvalidDataError } from '@/domain/errors'

type Params = UseCaseParams & {
  getChildModel: GetChildModel
}

export type ExtractBibliography = (params: {
  textSource: {
    text: string
    link: string
    meta: {
      info: string
      metadata: string
    }
  }
  language: string
  userId: string
  model_id: string
}) => Promise<{
  bibliographic: {
    author?: string | null
    title?: string | null
    resourceType?: string | null
    responsibility?: string | null
    edition?: string | null
    publicationPlace?: string | null
    publisher?: string | null
    publicationYear?: string | null
    volumeOrPages?: string | null
    series?: string | null
    identifier?: string | null
    url?: string | null
    accessDate?: string | null
    accessMode?: string | null
    contentType?: string | null
  }
  capsSpend: number
}>

export const buildExtractBibliography = ({
  adapter,
  service,
  getChildModel,
}: Params): ExtractBibliography => {
  return async ({ textSource, language, userId, model_id }) => {
    const { text, meta, link } = textSource
    const prompt = dedent`
    You are an AI assistant tasked with extracting bibliographic information from text and metadata.

    You will be given a JSON object containing text source and brief meta-information about a source. Extract bibliographic data using this text and metadata as the primary source of truth. The JSON object looks like this:
    {
      "text":string,
      "meta": {
        "info": object,        // plain-text key-value structure (e.g., Title, Author, Date)
        "metadata": object,    // raw metadata (e.g., from PDF)
      }
    }

    Your job is to extract and normalize the following bibliographic fields from this information:
    - author
    - title
    - resourceType
    - responsibility
    - edition
    - publicationPlace
    - publisher
    - publicationYear
    - volumeOrPages
    - series
    - identifier
    - contentType

   You must **only** return the data in the following JSON format (without any additional text, explanation, or wrapping):

    {
      "bibliographicData": {
        "author": string|null,
        "title": string|null,
        "resourceType": string|null,
        "responsibility": string|null,
        "edition": string|null,
        "publicationPlace": string|null,
        "publisher": string|null,
        "publicationYear": string|null,
        "volumeOrPages": string|null,
        "series": string|null,
        "identifier": string|null,
        "contentType": string|null
      }
    }

    Requirements for completing this task:
    - Consider only the provided data (text, meta).
    - **Do not include any extra text, explanations, or metadata outside of the required JSON structure.**
    - Return only the JSON object in its purest form, without additional wrapping, comments, or context.
    - Do not include any explanations, interpretations, or clarifications—just the raw JSON.
    
    Important:
        Language is: ${language}.
    `

    const { model } = await getChildModel({
      model_id,
      userId,
    })

    const content = JSON.stringify({ text, meta })

    const response = await adapter.openrouterGateway.sync({
      endUserId: userId,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      settings: {
        model: model.prefix + model.id,
        system_prompt: prompt,
        temperature: 0,
      },
      response_format: bibliographyResponseFormat,
    })

    if (!response.usage) {
      throw new InvalidDataError({
        code: 'UNABLE_TO_EXTRACT_BIBLIOGRAPHY',
      })
    }
    const messageContent = response.message.content?.trim()
    let bibliographic: {
      author?: string | null
      title?: string | null
      resourceType?: string | null
      responsibility?: string | null
      edition?: string | null
      publicationPlace?: string | null
      publisher?: string | null
      publicationYear?: string | null
      volumeOrPages?: string | null
      series?: string | null
      identifier?: string | null
      url?: string | null
      accessDate?: string | null
      contentType?: string | null
    } = {}

    if (messageContent) {
      try {
        let parsed = JSON.parse(messageContent)

        if (typeof parsed.filteredText === 'string') {
          try {
            parsed = JSON.parse(parsed.filteredText)
          } catch {
            parsed = {}
          }
        }

        bibliographic = parsed.bibliographicData || {}
      } catch {
        bibliographic = {}
      }
    }

    bibliographic.url = link
    bibliographic.accessDate = new Date().toLocaleDateString('ru-RU')

    const caps = await service.model.getCaps.text({
      model,
      usage: response.usage,
    })

    return { bibliographic, capsSpend: caps }
  }
}
