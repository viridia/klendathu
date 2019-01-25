import { Errors } from '../../../common/types/json';

export class RequestError extends Error {
  public readonly code: Errors;
  public readonly details: { [key: string]: any };

  constructor(code: Errors, details?: { [key: string]: any }) {
    super();
    this.code = code;
    this.details = details;
  }

  get message(): string {
    if (this.details.message) {
      return this.details.message;
    }
    return `Request Error: ${this.code}`;
  }
}
