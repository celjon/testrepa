import { find } from 'linkifyjs'
import { ianaTLDs } from './ianaTLDs'

const ipRegex = new RegExp(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)

const privateHosts = [
  /^localhost$/i,
  /^127\.0\.0\.1$/,
  // 192.168.*.*
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  // 172.(16-31).*.*
  /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  // 10.*.*.*
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /\.local$/i
]

// these url like strings appear very often in the texts
const invalidURLs = [
  'csv.open',
  'csv.read',
  'csv.save',
  'image.open',
  'cfg.host',
  'comment.id',
  'comment.blog',
  'comment.author',
  'form.save',
  'page.py',
  'self.name',
  'pl.read',
  'info.pid',
  'response.data',
  'axios.get',
  'axios.post',
  'axios.put',
  'axios.patch',
  'axios.delete'
]

const invalidURLsMap = new Map(invalidURLs.map((url) => [url, true]))

const validTLDsMap = new Map(
  ianaTLDs
    .split('\n')
    .filter(Boolean)
    .map((tld) => [tld.toLowerCase(), true])
)

// Extract unique URLs from a string
export const extractURLs = (text: string): string[] => {
  const allUrls = find(text, { defaultProtocol: 'https' })
    .filter((url) => {
      if (url.type !== 'url' || !url.value || url.href.startsWith('mailto:')) {
        return false
      }

      if (!URL.canParse(url.href)) {
        return true
      }

      const urlObject = new URL(url.href)
      const hostname = urlObject.hostname

      const isPrivate = privateHosts.some((privateHost) => privateHost.test(hostname))
      if (isPrivate) {
        return false
      }
      if (ipRegex.test(hostname)) {
        return true
      }

      const tld = hostname.split('.').pop() || ''
      if (!validTLDsMap.has(tld)) {
        return false
      }

      // Check for uppercase in the original URL string
      const originalHostname = url.href.split('://')[1]?.split('/')[0]
      const hasUppercaseInHostname = originalHostname && originalHostname.toLowerCase() !== originalHostname
      if (hasUppercaseInHostname) {
        return false
      }

      return !invalidURLsMap.has(hostname)
    })
    .map((url) => url.value)

  return new Array(...new Set(allUrls))
}
