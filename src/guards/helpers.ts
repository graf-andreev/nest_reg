import { Request } from 'express';

export default function extractTokenFromHeader(
  request: Request,
): string | undefined {
  const authorization = request.headers.authorization;
  if (!authorization) return undefined;
  const [type, token] = authorization.split(' ');
  return type === 'Bearer' ? token : undefined;
}
