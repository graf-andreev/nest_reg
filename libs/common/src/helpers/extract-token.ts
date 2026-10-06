import { Request } from 'express';

export function extractTokenFromHeader(request: Request): string | undefined {
  const authorization = request.headers.authorization;
  if (!authorization) return undefined;
  const [type, token] = authorization.split(' ');
  return type === 'Bearer' ? token : undefined;
}

export function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
