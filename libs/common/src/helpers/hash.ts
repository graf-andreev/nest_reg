import { createHash, timingSafeEqual } from 'node:crypto';

export function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}
