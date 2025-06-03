import { buildDownload, Download } from './download'
import { buildExtract, Extract } from './extract'
import { buildMetadata, Metadata } from './metadata'
import { buildResize, Resize } from './resize'

export type ImageGateway = {
  resize: Resize
  extract: Extract
  metadata: Metadata
  download: Download
}

export const buildImageGateway = (): ImageGateway => {
  const resize = buildResize()
  const extract = buildExtract()
  const metadata = buildMetadata()

  return {
    resize,
    extract,
    metadata,
    download: buildDownload()
  }
}
