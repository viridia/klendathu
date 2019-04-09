import { AxiosError } from 'axios';
import { Errors } from '../../../common/types/json/Errors';
import { RequestError } from './RequestError';
import { request } from '../models/Session';

export interface LoginResponse {
  token: string;
}

export function handleAxiosError(error: AxiosError) {
  if (error.response) {
    if (error.response.data.error) {
      throw new RequestError(error.response.data.error, error.response.data.details);
    } else if (error.response.status) {
      switch (error.response.status) {
        case 401: throw new RequestError(Errors.UNAUTHORIZED);
        case 403: throw new RequestError(Errors.FORBIDDEN);
        case 404: throw new RequestError(Errors.NOT_FOUND);
        case 409: throw new RequestError(Errors.CONFLICT);
        default:
          throw new RequestError(Errors.UNKNOWN, {
            status: error.response.status,
            message: error.message,
          });
      }
    }
  }

  throw new RequestError(Errors.UNKNOWN, { message: error.message });
}

export function createUserAccount(email: string, password: string): Promise<LoginResponse> {
  return request.post('/auth/signup', { email, password })
    .then(resp => resp.data, handleAxiosError);
}
