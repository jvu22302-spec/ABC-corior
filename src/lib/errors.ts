/**
 * Typed Application Errors
 * All services must return or throw AppError with standardized error codes.
 */

export type AppErrorCode =
  | 'VALIDATION'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT_VERSION'
  | 'INVALID_TRANSITION'
  | 'DUPLICATE'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: AppErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError('VALIDATION', message, details);
  }

  static forbidden(message = 'Access denied: insufficient permissions', details?: Record<string, unknown>): AppError {
    return new AppError('FORBIDDEN', message, details);
  }

  static notFound(message = 'Requested resource not found', details?: Record<string, unknown>): AppError {
    return new AppError('NOT_FOUND', message, details);
  }

  static invalidTransition(message: string, details?: Record<string, unknown>): AppError {
    return new AppError('INVALID_TRANSITION', message, details);
  }

  static duplicate(message: string, details?: Record<string, unknown>): AppError {
    return new AppError('DUPLICATE', message, details);
  }
}
