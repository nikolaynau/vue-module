let _nextId = 0;
export function newId(): number {
  return ++_nextId;
}
