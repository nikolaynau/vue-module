let _nextId = 0;
export function newId(): number {
  return ++_nextId;
}

export function isObject(value: unknown): boolean {
  return value !== null && typeof value === 'object';
}
