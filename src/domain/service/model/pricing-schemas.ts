import { z } from 'zod'

export const textPricingSchema = z.object({
  input: z.number().min(0),
  input_image: z.number().min(0),
  output: z.number().min(0),
  discount: z.number()
})

export type TextPricing = z.infer<typeof textPricingSchema>

export const textPricingParamsSchema = z.object({
  prompt_tokens: z.number().min(0),
  completion_tokens: z.number().min(0)
})

export type TextPricingParams = z.infer<typeof textPricingParamsSchema>

export const imagePricingSchema = z.object({
  standard: z.object({
    '1024x1024': z.number().min(0),
    '1792x1024': z.number().min(0)
  }),
  hd: z.object({
    '1024x1024': z.number().min(0),
    '1792x1024': z.number().min(0)
  }),
  discount: z.number().min(0)
})

export type ImagePricing = z.infer<typeof imagePricingSchema>

export const imagePricingParamsSchema = z.object({
  model: z.string().optional(),
  n: z.number().optional(),
  quality: z.string().optional(),
  size: z.string().optional()
})

export type ImagePricingParams = z.infer<typeof imagePricingParamsSchema>

export const imageLLMPricingSchema = z.object({
  input: z.number().min(0),
  input_image: z.number().min(0),
  output: z.number().min(0),
  discount: z.number().min(0)
})

export type ImageLLMPricing = z.infer<typeof imageLLMPricingSchema>

export const imageLLMPricingParamsSchema = z.object({
  input_text_tokens: z.number().min(0),
  input_image_tokens: z.number().min(0),
  output_image_tokens: z.number().min(0)
})

export type ImageLLMPricingParams = z.infer<typeof imageLLMPricingParamsSchema>

export const mjPricingSchema = z.object({
  relax_mode: z.number().min(0),
  fast_mode: z.number().min(0),
  turbo_mode: z.number().min(0),
  discount: z.number().min(0)
})

export type MJPricing = z.infer<typeof mjPricingSchema>

export const replicateImagePricingSchema = z.object({
  per_image: z.number().min(0),
  discount: z.number().min(0)
})

export type ReplicateImagePricing = z.infer<typeof replicateImagePricingSchema>

export const replicateImageParamsSchema = z.object({
  model: z.string().optional(),
  num_outputs: z.number().default(1)
})

export type ReplicateImagePricingParams = z.infer<typeof replicateImageParamsSchema>

export const audioPricingSchema = z.object({
  input: z.number().min(0),
  discount: z.number().min(0)
})

export const replicateVideoPricingSchema = z.object({
  per_second: z.number().min(0),
  discount: z.number().min(0)
})

export type AudioPricing = z.infer<typeof audioPricingSchema>

export const speechPricingSchema = z.object({
  input: z.number().min(0),
  discount: z.number().min(0)
})

export type SpeechPricing = z.infer<typeof speechPricingSchema>

export const speechPricingParamsSchema = z.object({
  input: z.string()
})

export type SpeechPricingParams = z.infer<typeof speechPricingParamsSchema>

export const embeddingsPricingSchema = z.object({
  input: z.number().min(0),
  discount: z.number().min(0)
})

export type EmbeddingsPricing = z.infer<typeof embeddingsPricingSchema>

export const embeddingsPricingParamsSchema = z.object({
  input: z.union([z.string(), z.array(z.string()), z.array(z.number()), z.array(z.array(z.number()))])
})

export type EmbeddingsPricingParams = z.infer<typeof embeddingsPricingParamsSchema>
