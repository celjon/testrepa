import { UseCaseParams } from '@/domain/usecase/types'

export type GetOAuthConsentURL = (params: { provider: string; redirect_uri: string }) => Promise<
  | {
      consentURL: string
      code_verifier: string
    }
  | never
>
export const buildGetOAuthConsentURL = ({ adapter }: UseCaseParams): GetOAuthConsentURL => {
  return async ({ provider, redirect_uri }) => {
    const { consentURL, code_verifier } = await adapter.authRepository.getOAuthConsentURL({
      provider,
      redirect_uri
    })

    return {
      consentURL,
      code_verifier
    }
  }
}
