import * as Minio from 'minio'

export const newClient = ({ host, accessKey, secretKey, port }: { host: string; accessKey: string; secretKey: string; port?: number }) => {
  const client = new Minio.Client({
    endPoint: host,
    port,
    accessKey,
    secretKey
  })

  return {
    client
  }
}
