import { LLM_PROVIDERS } from '@browseros/shared/schemas/llm'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createLanguageModel } from '../agent/provider-factory'
import type { ResolvedAgentConfig } from '../agent/types'
import { formatDatabaseForPrompt, normalizeOrigins } from './derived-data'
import { logger } from './logger'
import {
  getObservedPageDataByIds,
  listObservedPageData,
  type ObservedPageDataRecord,
  type SourceOrigin,
} from './observed-page-data'

const textOriginOutputSchema = z.object({
  dependency_set: z.array(z.number().int().positive()),
})

function buildProviderOptions(config: ResolvedAgentConfig):
  | {
      openai: {
        store: false
        reasoningEffort: string
        reasoningSummary: string
      }
    }
  | undefined {
  if (config.provider !== LLM_PROVIDERS.CHATGPT_PRO) return undefined
  return {
    openai: {
      store: false,
      reasoningEffort: 'low',
      reasoningSummary: 'auto',
    },
  }
}

function extractDatabaseSnapshot(): ObservedPageDataRecord[] {
  return listObservedPageData()
}

function mergeDependencyOrigins(dependencySet: number[]): SourceOrigin[] {
  const deps = getObservedPageDataByIds(dependencySet)
  return normalizeOrigins(deps.flatMap((record) => record.source_origin))
}

export async function inferTextSourceOrigins(args: {
  resolvedConfig: ResolvedAgentConfig
  text: string
}): Promise<SourceOrigin[]> {
  if (!args.text.trim()) return []

  const database = extractDatabaseSnapshot()
  if (database.length === 0) return []

  const model = createLanguageModel(args.resolvedConfig)
  const result = await generateObject({
    model,
    schema: textOriginOutputSchema,
    system: `You infer the dependency_set for a text value that the assistant is about to write into a webpage.

Treat this as a dependency-tracing task, similar to derived-data extraction:
- Determine whether the text contains any data object(s) that are derived from the database.
- If it does, return the supporting database record IDs in dependency_set.
- If it does not, return an empty array in dependency_set.

Important interpretation rules:
- The text may contain zero, one, or multiple data objects.
- If the text contains multiple data objects derived from different records, return the union of all supporting record IDs.
- If the text is only planning text, self-talk, intentions, status updates, UI instructions, or generic freeform writing, return an empty array.
- If the text mixes derived data with non-derived filler text, ignore the filler and trace only the derived parts.
- Use only record IDs that exist in the provided database.
- Do not invent dependencies.
- Reuse dependency IDs from the database exactly as provided.
- Prefer the smallest dependency set that actually supports the text's derived content.
- If the text matches, copies, summarizes, reformats, or computes from database records, use those records' IDs.
- If the text could plausibly come from the database but there is not enough support to trace it to provided records, return an empty array.`,
    prompt: `# TEXT TO WRITE:
${args.text}

# DATABASE:
${formatDatabaseForPrompt(database)}`,
    temperature: 0,
    providerOptions: buildProviderOptions(args.resolvedConfig),
  })

  const dependencySet = [...new Set(result.object.dependency_set)].sort(
    (a, b) => a - b,
  )
  if (dependencySet.length === 0) return []

  return mergeDependencyOrigins(dependencySet)
}

export async function inferTextSourceOriginsSafely(args: {
  resolvedConfig: ResolvedAgentConfig
  text: string
}): Promise<SourceOrigin[]> {
  try {
    return await inferTextSourceOrigins(args)
  } catch (error) {
    logger.warn('Text origin inference failed', {
      error: error instanceof Error ? error.message : String(error),
      textPreview: args.text.slice(0, 200),
    })
    return []
  }
}

export function originsMatch(
  left: SourceOrigin[],
  right: SourceOrigin[],
): boolean {
  const a = normalizeOrigins(left)
  const b = normalizeOrigins(right)
  if (a.length !== b.length) return false
  return a.every(
    (origin, index) => JSON.stringify(origin) === JSON.stringify(b[index]),
  )
}
