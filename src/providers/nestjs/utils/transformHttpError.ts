import { HttpError } from '@refinedev/core';

import { transformErrorMessages } from './transformErrorMessages';

export function transformHttpError(error: any): HttpError {
  const response = error?.response;

  // Ưu tiên lấy message từ BE
  const apiMessage = response?.data?.message;
  let finalMessage: string;

  if (Array.isArray(apiMessage)) {
    finalMessage = apiMessage.join(", ");
  } else if (typeof apiMessage === "string") {
    finalMessage = apiMessage;
  } else {
    finalMessage =
      response?.statusText ||
      error?.message ||
      "Đã xảy ra lỗi không xác định";
  }

  return {
    statusCode: response?.status,
    message: finalMessage,   
    errors: response?.data,  
  };
}