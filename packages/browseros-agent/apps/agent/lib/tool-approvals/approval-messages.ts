export interface SameOriginApprovalContext {
  type: 'same-origin-policy'
  pageOrigin: string[]
  textOrigin: string[]
  reason: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getApprovalContext(
  input: Record<string, unknown>,
): SameOriginApprovalContext | null {
  const raw = input.__approvalContext
  if (!isRecord(raw) || raw.type !== 'same-origin-policy') return null
  if (!Array.isArray(raw.pageOrigin) || !Array.isArray(raw.textOrigin)) {
    return null
  }
  if (typeof raw.reason !== 'string') return null

  const pageOrigin = raw.pageOrigin.filter(
    (item): item is string => typeof item === 'string',
  )
  const textOrigin = raw.textOrigin.filter(
    (item): item is string => typeof item === 'string',
  )

  return {
    type: 'same-origin-policy',
    pageOrigin,
    textOrigin,
    reason: raw.reason,
  }
}

export function getApprovalWarningMessage(
  toolName: string,
  input: Record<string, unknown>,
): string | null {
  const approvalContext = getApprovalContext(input)
  if (approvalContext) {
    const pageOrigin =
      approvalContext.pageOrigin.length > 0
        ? approvalContext.pageOrigin.join(', ')
        : '(unknown)'
    const textOrigin =
      approvalContext.textOrigin.length > 0
        ? approvalContext.textOrigin.join(', ')
        : '(unknown)'

    return [
      'This write action potentially violates same-origin policy.',
      `Page origin: ${pageOrigin}.`,
      `Text origin: ${textOrigin}.`,
      `Why cross-origin: ${approvalContext.reason}`,
    ].join(' ')
  }

  if (toolName === 'fill' || toolName === 'type_at') {
    return 'This write action potentially violates same-origin policy. Approve to allow the cross-origin write, or deny to block it.'
  }

  return null
}
