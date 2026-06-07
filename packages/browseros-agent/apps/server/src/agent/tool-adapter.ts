import type { LanguageModelV2ToolResultOutput } from '@ai-sdk/provider'
import type { ToolApprovalConfig } from '@browseros/shared/constants/tool-approval'
import { type ToolSet, tool } from 'ai'
import type { ResolvedAgentConfig } from '../agent/types'
import { logger } from '../lib/logger'
import { metrics } from '../lib/metrics'
import { sourceOriginsFromUrl } from '../lib/observed-page-data'
import { inferTextSourceOriginsSafely, originsMatch } from '../lib/text-origin'
import { executeTool, type ToolContext } from '../tools/framework'
import type { ContentItem } from '../tools/response'
import type { ToolRegistry } from '../tools/tool-registry'

type ApprovalContextInput = Record<string, unknown> & {
  __approvalContext?: {
    type: 'same-origin-policy'
    pageOrigin: string[]
    textOrigin: string[]
    reason: string
  }
}

function formatOriginsForApproval(
  origins: Array<[string, string, number | null]>,
) {
  return origins.map(
    ([scheme, host, port]) =>
      `${scheme}://${host}${port === null ? '' : `:${port}`}`,
  )
}

function contentToModelOutput(
  content: ContentItem[],
): LanguageModelV2ToolResultOutput {
  const hasImages = content.some((c) => c.type === 'image')

  if (!hasImages) {
    const text = content
      .filter((c): c is ContentItem & { type: 'text' } => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
    return { type: 'text', value: text || 'Success' }
  }

  return {
    type: 'content',
    value: content.map((c) => {
      if (c.type === 'text') {
        return { type: 'text' as const, text: c.text }
      }
      return {
        type: 'media' as const,
        data: c.data,
        mediaType: c.mimeType,
      }
    }),
  }
}

export function getApprovedBrowserToolNames(
  registry: ToolRegistry,
  approvalConfig?: ToolApprovalConfig,
): string[] {
  if (!approvalConfig) return []
  return registry
    .all()
    .filter((def) => approvalConfig.categories[def.approvalCategory] === true)
    .map((def) => def.name)
}

export function buildBrowserToolSet(
  registry: ToolRegistry,
  ctx: ToolContext,
  resolvedConfig?: ResolvedAgentConfig,
  approvalConfig?: ToolApprovalConfig,
): ToolSet {
  const toolSet: ToolSet = {}

  for (const def of registry.all()) {
    const configuredApproval =
      approvalConfig?.categories[def.approvalCategory] === true

    toolSet[def.name] = tool({
      description: def.description,
      inputSchema: def.input,
      needsApproval:
        def.name === 'fill' || def.name === 'type_at'
          ? async (input) => {
              if (configuredApproval) return true
              if (!resolvedConfig) return false

              const pageId =
                input && typeof input === 'object' && 'page' in input
                  ? (input.page as number)
                  : undefined
              const text =
                input && typeof input === 'object' && 'text' in input
                  ? (input.text as string)
                  : undefined

              if (typeof pageId !== 'number' || typeof text !== 'string') {
                return false
              }

              const pageInfo = await ctx.browser.refreshPageInfo(pageId)
              if (!pageInfo) return false

              const pageOrigin = sourceOriginsFromUrl(pageInfo.url)
              if (pageOrigin.length === 0) return false

              const textOrigins = await inferTextSourceOriginsSafely({
                resolvedConfig,
                text,
              })
              if (textOrigins.length === 0) return false

              const shouldApprove = !originsMatch(pageOrigin, textOrigins)
              if (shouldApprove) {
                if (input && typeof input === 'object') {
                  ;(input as ApprovalContextInput).__approvalContext = {
                    type: 'same-origin-policy',
                    pageOrigin: formatOriginsForApproval(pageOrigin),
                    textOrigin: formatOriginsForApproval(textOrigins),
                    reason:
                      'This write action is cross-origin because the page origin and the text origin are different.',
                  }
                }
                logger.warn('Write action requires same-origin approval', {
                  tool: def.name,
                  pageId,
                  pageOrigin,
                  textOrigins,
                })
              }
              return shouldApprove
            }
          : configuredApproval,
      execute: async (params) => {
        const startTime = performance.now()
        try {
          const result = await executeTool(
            def,
            params,
            ctx,
            AbortSignal.timeout(120_000),
          )

          metrics.log('tool_executed', {
            tool_name: def.name,
            duration_ms: Math.round(performance.now() - startTime),
            success: !result.isError,
            source: 'chat',
          })

          return {
            content: result.content,
            isError: result.isError ?? false,
            metadata: result.metadata,
          }
        } catch (error) {
          const errorText =
            error instanceof Error ? error.message : String(error)

          logger.error('Tool execution failed', {
            tool: def.name,
            error: errorText,
          })
          metrics.log('tool_executed', {
            tool_name: def.name,
            duration_ms: Math.round(performance.now() - startTime),
            success: false,
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
            source: 'chat',
          })

          return {
            content: [{ type: 'text' as const, text: errorText }],
            isError: true,
          }
        }
      },
      toModelOutput: ({ output }) => {
        const result = output as {
          content: ContentItem[]
          isError: boolean
        }
        if (result.isError) {
          const text = result.content
            .filter(
              (c): c is ContentItem & { type: 'text' } => c.type === 'text',
            )
            .map((c) => c.text)
            .join('\n')
          return { type: 'error-text', value: text }
        }
        if (!result.content?.length) {
          return { type: 'text', value: 'Success' }
        }
        return contentToModelOutput(result.content)
      },
    })
  }

  return toolSet
}
