import { HeadingLevel, Paragraph } from 'docx'
import { clearFromMarkdownMarkup } from '@/lib/utils/clear-from-markdown-markup'

export type ParseMdToDocxBlocks = (params: { responseText: string }) => Promise<Paragraph[]>

export const buildParseMdToDocxBlocks =
  (): ParseMdToDocxBlocks =>
  async ({ responseText }) => {
    const rawLines = responseText.split('\n')
    const paragraphs: Paragraph[] = []

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i].replace(/\s+$/, '')
      if (!rawLine.trim()) continue

      const indentMatch = rawLine.match(/^(\s*)/)
      const indentSpaces = indentMatch ? indentMatch[1].length : 0
      const level = Math.floor(indentSpaces / 2)

      const line = rawLine.trim()

      if (/^#{1,6}\s/.test(line)) {
        const headingLevel = line.match(/^#{1,6}/)![0].length
        const text = clearFromMarkdownMarkup(line.replace(/^#{1,6}\s*/, ''))
        paragraphs.push(
          new Paragraph({
            text,
            heading: HeadingLevel[`HEADING_${headingLevel}` as keyof typeof HeadingLevel],
          }),
        )
        continue
      }

      if (/^[^=]+$/.test(line) && rawLines[i + 1] && /^[=]+$/.test(rawLines[i + 1].trim())) {
        const text = clearFromMarkdownMarkup(line)
        paragraphs.push(
          new Paragraph({
            text,
            heading: HeadingLevel.HEADING_1,
          }),
        )
        i++
        continue
      }

      const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
      if (numberedMatch) {
        const text = clearFromMarkdownMarkup(numberedMatch[2])
        paragraphs.push(
          new Paragraph({
            text,
            numbering: { reference: 'numbered-list', level },
          }),
        )
        continue
      }

      const bulletMatch = line.match(/^([-*•])\s+(.*)/)
      if (bulletMatch) {
        const text = clearFromMarkdownMarkup(bulletMatch[2])
        paragraphs.push(
          new Paragraph({
            text,
            bullet: { level },
          }),
        )
        continue
      }

      paragraphs.push(new Paragraph(clearFromMarkdownMarkup(line)))
    }

    return paragraphs
  }
