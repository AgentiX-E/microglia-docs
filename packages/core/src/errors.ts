/**
 * Stable, machine-readable error codes.
 *
 * Every rejection the library can make is named here. A host that cannot branch
 * on a failure will log it and continue, so the code is part of the API, not a
 * diagnostic afterthought.
 */
export type MicrogliaErrorCode =
  | 'MG_E_CONFIG'
  | 'MG_E_SCHEMA_VERSION'
  | 'MG_E_NOT_OPEN'
  | 'MG_E_RUN_COMMITTED'
  | 'MG_E_NO_OUTPUT'
  | 'MG_E_INVALID_SIGNAL'
  | 'MG_E_UNKNOWN_TASK'
  | 'MG_E_UNKNOWN_SCOPE'
  | 'MG_E_STORE_IO'
  | 'MG_E_STORE_CORRUPT'
  | 'MG_E_KNOWLEDGE_UNSAFE'
  | 'MG_E_BUDGET_EXCEEDED'
  | 'MG_E_NAMESPACE_MISMATCH'
  | 'MG_E_PACK_STALE';

export class MicrogliaError extends Error {
  public readonly code: MicrogliaErrorCode;
  public readonly details: Readonly<Record<string, unknown>>;

  public constructor(
    code: MicrogliaErrorCode,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(`${code}: ${message}`);
    this.name = 'MicrogliaError';
    this.code = code;
    this.details = details;
  }
}

export function isMicrogliaError(value: unknown): value is MicrogliaError {
  return value instanceof MicrogliaError;
}
