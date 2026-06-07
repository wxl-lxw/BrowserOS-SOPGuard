import type { Browser } from '../browser/browser'
import { getDb } from './db'

export type SourceOrigin = [
  scheme: string,
  hostname: string,
  port: number | null,
]

export interface ObservedPageDataRecord {
  id: number
  content: string
  source_origin: SourceOrigin[]
  dependency_set: number[]
}

const DEFAULT_PORTS: Record<string, number> = {
  ftp: 21,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
}

function canonicalizeSourceOrigins(
  sourceOrigins: SourceOrigin[],
): SourceOrigin[] {
  const deduped = new Map<string, SourceOrigin>()
  for (const origin of sourceOrigins) {
    const normalized: SourceOrigin = [origin[0], origin[1], origin[2] ?? null]
    deduped.set(JSON.stringify(normalized), normalized)
  }
  return [...deduped.values()].sort((a, b) =>
    JSON.stringify(a).localeCompare(JSON.stringify(b)),
  )
}

function canonicalizeDependencySet(dependencySet: number[]): number[] {
  return [...new Set(dependencySet)].sort((a, b) => a - b)
}

function inferPort(url: URL): number | null {
  if (url.port) return Number(url.port)
  return DEFAULT_PORTS[url.protocol.slice(0, -1)] ?? null
}

export function sourceOriginsFromUrl(url: string): SourceOrigin[] {
  try {
    const parsed = new URL(url)
    return canonicalizeSourceOrigins([
      [parsed.protocol.slice(0, -1), parsed.hostname, inferPort(parsed)],
    ])
  } catch {
    return []
  }
}

export function listObservedPageData(): ObservedPageDataRecord[] {
  const db = getDb()
  const stmt = db.prepare(`
    SELECT id, content, source_origin, dependency_set
    FROM observed_page_data
    ORDER BY id ASC
  `)

  return stmt.all().map((row) => {
    const record = row as {
      id: number
      content: string
      source_origin: string
      dependency_set: string
    }
    return {
      id: record.id,
      content: record.content,
      source_origin: JSON.parse(record.source_origin) as SourceOrigin[],
      dependency_set: JSON.parse(record.dependency_set) as number[],
    }
  })
}

export function getObservedPageDataByIds(
  ids: number[],
): ObservedPageDataRecord[] {
  const wanted = new Set(ids)
  return listObservedPageData().filter((record) => wanted.has(record.id))
}

export function storeObservedData(args: {
  content: string
  sourceOrigin: SourceOrigin[]
  dependencySet?: number[]
}): ObservedPageDataRecord {
  const sourceOrigin = canonicalizeSourceOrigins(args.sourceOrigin)
  const dependencySet = canonicalizeDependencySet(args.dependencySet ?? [])

  const db = getDb()
  const sourceOriginJson = JSON.stringify(sourceOrigin)
  const dependencySetJson = JSON.stringify(dependencySet)

  const existing = db
    .prepare(`
      SELECT id, content, source_origin, dependency_set
      FROM observed_page_data
      WHERE content = ?
        AND source_origin = ?
      LIMIT 1
    `)
    .get(args.content, sourceOriginJson) as
    | {
        id: number
        content: string
        source_origin: string
        dependency_set: string
      }
    | undefined

  if (existing) {
    return {
      id: existing.id,
      content: existing.content,
      source_origin: JSON.parse(existing.source_origin) as SourceOrigin[],
      dependency_set: JSON.parse(existing.dependency_set) as number[],
    }
  }

  const stmt = db.prepare(`
    INSERT INTO observed_page_data (content, source_origin, dependency_set)
    VALUES (?, ?, ?)
    RETURNING id, content, source_origin, dependency_set
  `)
  const row = stmt.get(args.content, sourceOriginJson, dependencySetJson) as
    | {
        id: number
        content: string
        source_origin: string
        dependency_set: string
      }
    | undefined

  if (!row) {
    throw new Error('Failed to persist observed page data.')
  }

  return {
    id: row.id,
    content: row.content,
    source_origin: JSON.parse(row.source_origin) as SourceOrigin[],
    dependency_set: JSON.parse(row.dependency_set) as number[],
  }
}

export async function storeObservedPageData(args: {
  browser: Browser
  pageId: number
  content: string
  dependencySet?: number[]
}): Promise<ObservedPageDataRecord> {
  const pageInfo = await args.browser.refreshPageInfo(args.pageId)
  return storeObservedData({
    content: args.content,
    sourceOrigin: pageInfo ? sourceOriginsFromUrl(pageInfo.url) : [],
    dependencySet: args.dependencySet,
  })
}
