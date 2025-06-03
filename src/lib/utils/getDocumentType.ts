export const getDocumentType = (ext: string) => {
  switch (ext) {
    case '.docx':
      return 'word'
    case '.xlsx':
      return 'excel'
    case '.pdf':
      return 'pdf'
    default:
      return 'text'
  }
}
