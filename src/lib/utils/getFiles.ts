import { Request } from 'express'

export const getFiles = (req: Request, fieldName: string) => {
  let files: Express.Multer.File[]

  if (!req.files) {
    files = []
  } else if (Array.isArray(req.files)) {
    files = req.files
  } else {
    files = req.files[fieldName] ?? []
  }

  return files
}
