import { Response } from 'express';

type TResponse<T> = {
  httpStatusCode: number;
  success: boolean;
  message: string;
  data?: T;
};

export const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  res.status(payload.httpStatusCode).json({
    success: payload.success,
    message: payload.message,
    data: payload.data,
  });
};
