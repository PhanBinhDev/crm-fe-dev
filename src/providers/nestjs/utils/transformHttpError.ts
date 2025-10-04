import { HttpError } from '@refinedev/core';

import { transformErrorMessages } from './transformErrorMessages';

export const transformHttpError = (error: any): HttpError => {
  // Handle case where error.response is undefined
  if (!error.response) {
    return {
      statusCode: 500,
      message: 'Network error or server unavailable',
      errors: {} as any,
    };
  }

  const message = error.response.data?.error || 'Unknown error';
  const statusCode = error.response.data?.statusCode || error.response.status || 500;
  const errorMessages = error.response.data?.message || [];

  const errors = transformErrorMessages(errorMessages);

  const httpError: HttpError = {
    statusCode,
    message,
    errors,
  };

  return httpError;
};
