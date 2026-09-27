export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const unauthorized = () => new AppError(401, "UNAUTHORIZED");
export const forbidden = () => new AppError(403, "FORBIDDEN");
export const notFound = () => new AppError(404, "NOT_FOUND");
export const badRequest = (code = "BAD_REQUEST", message?: string) => new AppError(400, code, message);
export const conflict = (code: string) => new AppError(409, code);
