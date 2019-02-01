export enum Errors {
  UNKNOWN = 'unknown',
  INTERNAL = 'internal',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not-found',
  CONFLICT = 'conflict',
  EXISTS = 'exists',
  SCHEMA = 'schema-validation',

  TEXT_MISSING = 'text-missing',
  TEXT_TOO_SHORT = 'text-too-short',
  TEXT_INVALID_CHARS = 'text-invalid-chars',

  INVALID_LINK = 'invalid-link',
  MISSING_NAME = 'missing-name',
  MISSING_COLOR = 'missing-color',
  MISSING_LABEL = 'missing-label',
  INVALID_ROLE = 'invalid-role',

  INVALID_EMAIL = 'invalid-email',
  USERNAME_LOWER_CASE = 'username-lower-case',
  INCORRECT_PASSWORD = 'incorrect-password',
  INVALID_TOKEN = 'invalid-token',
  INVALID_PHOTO = 'invalid-photo',
}
