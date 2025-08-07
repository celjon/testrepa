import axios from 'axios'

export type ai302Params = {
  data: {
    text_prompt: string | null
    input_image: string
    quality?: string
  }
}

export type ai302Client = {
  generateVideoFromImage: (params: ai302Params) => Promise<{ taskId: string }>
  getVideoResult: (taskId: string, quality: string) => Promise<any>
}

export const newClient = ({
  key,
  api_url,
}: {
  key: string
  api_url: string
}): { client: ai302Client } => ({
  client: {
    generateVideoFromImage: async ({ data }: ai302Params) => {
      const { text_prompt, input_image, quality } = data

      const payload: Record<string, any> = {
        input_image,
        text_prompt,
      }

      const resp = await axios.post(
        `${api_url}/302/submit/${quality === 'standard' ? 'veo3-fast-frames' : 'veo3-pro-frames'}`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!resp.data?.task_id) {
        throw new Error(`Invalid response from ai302: ${JSON.stringify(resp.data)}`)
      }

      return { taskId: resp.data.task_id }
    },
    getVideoResult: async (taskId: string, quality: string) => {
      const resp = await axios.get(
        `${api_url}/302/submit/${quality === 'standard' ? 'veo3-fast-frames' : 'veo3-pro-frames'}`,
        {
          params: { request_id: taskId },
          headers: { Authorization: `Bearer ${key}` },
        },
      )
      return resp.data
    },
  },
})
