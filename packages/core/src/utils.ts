// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../vite-env.d.ts" />

let _nextId = 0;
export function newId(): number {
  return ++_nextId;
}

export function isObject(value: unknown): boolean {
  return value !== null && typeof value === 'object';
}

export function getVersion(): string {
  return import.meta.env.VITE_BUILD_VERSION;
}
