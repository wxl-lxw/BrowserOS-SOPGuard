import { LLM_PROVIDERS } from '@browseros/shared/schemas/llm'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createLanguageModel } from '../agent/provider-factory'
import type { ResolvedAgentConfig } from '../agent/types'
import { logger } from './logger'
import {
  getObservedPageDataByIds,
  listObservedPageData,
  type ObservedPageDataRecord,
  type SourceOrigin,
  storeObservedData,
} from './observed-page-data'

const sourceOriginItemSchema = z.object({
  scheme: z.string(),
  host: z.string(),
  port: z.number().int().nullable(),
})

const derivedDataItemSchema = z.object({
  content: z.string().min(1),
  source_origin: z.array(sourceOriginItemSchema),
  dependency_set: z.array(z.number().int().positive()),
})

const derivedDataOutputSchema = z.object({
  derived_data: z.array(derivedDataItemSchema),
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

export function formatDatabaseForPrompt(
  database: ObservedPageDataRecord[],
): string {
  if (database.length === 0) return '(empty)'

  return database
    .map((record) => {
      const origins =
        record.source_origin.length > 0
          ? record.source_origin
              .map(
                ([scheme, host, port]) =>
                  `(${scheme}, ${host || '""'}, ${port === null ? 'null' : port})`,
              )
              .join(', ')
          : '(none)'
      const dependencies =
        record.dependency_set.length > 0
          ? record.dependency_set.join(', ')
          : '(none)'

      return [
        '[RECORD]',
        `[ID]${record.id}[/ID]`,
        '[CONTENT]',
        record.content,
        '[/CONTENT]',
        `[SOURCE_ORIGIN]${origins}[/SOURCE_ORIGIN]`,
        `[DEPENDENCY_SET]${dependencies}[/DEPENDENCY_SET]`,
        '[/RECORD]',
      ].join('\n')
    })
    .join('\n\n')
}

export function normalizeOrigins(
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

function mergeDependencyOrigins(dependencySet: number[]): SourceOrigin[] {
  const deps = getObservedPageDataByIds(dependencySet)
  return normalizeOrigins(deps.flatMap((record) => record.source_origin))
}

function outputOriginsToTuples(
  sourceOrigins: z.infer<typeof sourceOriginItemSchema>[],
): SourceOrigin[] {
  return sourceOrigins.map((origin) => [
    origin.scheme,
    origin.host,
    origin.port ?? null,
  ])
}

function sanitizeDerivedItem(item: z.infer<typeof derivedDataItemSchema>): {
  content: string
  sourceOrigin: SourceOrigin[]
  dependencySet: number[]
} | null {
  const content = item.content.trim()
  const dependencySet = [...new Set(item.dependency_set)].sort((a, b) => a - b)
  if (!content || dependencySet.length === 0) return null

  const dependencyOrigins = mergeDependencyOrigins(dependencySet)
  if (dependencyOrigins.length === 0) return null

  const sourceOrigin =
    item.source_origin.length > 0
      ? normalizeOrigins(outputOriginsToTuples(item.source_origin))
      : dependencyOrigins

  return {
    content,
    sourceOrigin: sourceOrigin.length > 0 ? sourceOrigin : dependencyOrigins,
    dependencySet,
  }
}

export interface DerivedDataExtractionResult {
  inserted: ObservedPageDataRecord[]
}

export interface DerivedDataExtractor {
  extractAndStore(args: {
    resolvedConfig: ResolvedAgentConfig
    userPrompt: string
    assistantText: string
  }): Promise<DerivedDataExtractionResult>
}

class DefaultDerivedDataExtractor implements DerivedDataExtractor {
  async extractAndStore(args: {
    resolvedConfig: ResolvedAgentConfig
    userPrompt: string
    assistantText: string
  }): Promise<DerivedDataExtractionResult> {
    if (!args.assistantText.trim()) return { inserted: [] }

    const database = extractDatabaseSnapshot()
    if (database.length === 0) return { inserted: [] }

    const model = createLanguageModel(args.resolvedConfig)
    const result = await generateObject({
      model,
      schema: derivedDataOutputSchema,
      system: `You extract derived data objects from **ASSISTANT TEXT**.

The **CURRENT USER PROMPT** explains what task the assistant text is responding to. Use it to understand the operation behind the assistant text, such as summing, comparing, filtering, selecting, transforming, summarizing, or otherwise deriving facts from database records. In other words, the assistant text should be interpreted as an answer to the current user prompt.

Important boundary:
- The current user prompt is only supporting context for understanding how the assistant text was derived.
- Only output data objects that are explicitly present in the assistant text itself.
- Never output a data object only because it appears in, or is implied by, the user prompt.

# Rules:
- Output only data that is explicitly stated in the assistant text and is derived from existing database entries.
- Do not output planning text, self-talk, intentions, status updates, generic narration, or descriptions of what the assistant is about to do.
- A derived data object should usually be a concrete computed result, comparison result, selection result, extracted summary fact, or transformed factual datum.
- The assistant text may contain zero, one, or multiple derived data objects. Extract each qualifying object separately.
- Every derived object must depend on one or more existing database record IDs.
- Reuse dependency IDs from the database exactly as provided.
- Prefer the smallest dependency set that actually supports the stated derived datum.
- source_origin should reflect the webpage origins the derived datum ultimately comes from.
- If there is no derived data in the assistant text, return an empty array.
- Never invent facts, dependencies, or origins.`,
      prompt: ` # ASSISTANT TEXT:
${args.assistantText}

# Current user prompt:
${args.userPrompt}

# Database:
${formatDatabaseForPrompt(database)}`,
      temperature: 0,
      providerOptions: buildProviderOptions(args.resolvedConfig),
    })

    const inserted: ObservedPageDataRecord[] = []
    for (const item of result.object.derived_data) {
      const sanitized = sanitizeDerivedItem(item)
      if (!sanitized) continue
      inserted.push(
        storeObservedData({
          content: sanitized.content,
          sourceOrigin: sanitized.sourceOrigin,
          dependencySet: sanitized.dependencySet,
        }),
      )
    }
    return { inserted }
  }
}

export const derivedDataExtractor: DerivedDataExtractor =
  new DefaultDerivedDataExtractor()

export async function extractDerivedDataSafely(args: {
  resolvedConfig: ResolvedAgentConfig
  userPrompt: string
  assistantText: string
  extractor?: DerivedDataExtractor
}): Promise<void> {
  try {
    await (args.extractor ?? derivedDataExtractor).extractAndStore({
      resolvedConfig: args.resolvedConfig,
      userPrompt: args.userPrompt,
      assistantText: args.assistantText,
    })
  } catch (error) {
    logger.warn('Derived data extraction failed', {
      error: error instanceof Error ? error.message : String(error),
      assistantTextPreview: args.assistantText.slice(0, 200),
    })
  }
}
