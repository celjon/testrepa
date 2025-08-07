export function clearFromMarkdownMarkup(text: string): string {
  return text
    .replace(/[*_~`]+/g, '')
    .replace(/\[(.*?)]\(.*?\)/g, '$1')
    .replace(/!\[(.*?)]\(.*?\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}
