import { describe, it, expect } from 'vitest';
import { handlePromises } from '../src/promise';

describe('handlePromises', () => {
  it('should resolve a single promise', async () => {
    const promise = Promise.resolve(42);
    const result = await handlePromises(promise);
    expect(result).toBe(42);
  });

  it('should resolve an array of promises in parallel', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ];
    const result = await handlePromises(promises, { parallel: true });
    expect(result).toEqual([1, 2, 3]);
  });

  it('should resolve an array of promises sequentially', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ];
    const result = await handlePromises(promises);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should collect errors when suppressErrors is enabled', async () => {
    const errors: Error[] = [];
    const promises = [
      Promise.resolve(1),
      Promise.reject(new Error('Test Error')),
      Promise.resolve(3)
    ];
    const result = await handlePromises(promises, {
      suppressErrors: true,
      errors
    });
    expect(result).toEqual([1, undefined, 3]);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(Error);
  });

  it('should throw an error if suppressErrors is false', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.reject(new Error('Test Error'))
    ];
    await expect(handlePromises(promises)).rejects.toThrow('Test Error');
  });

  it('should throw an error if suppressErrors is false in parallel', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.reject(new Error('Test Error'))
    ];
    await expect(handlePromises(promises, { parallel: true })).rejects.toThrow(
      'Test Error'
    );
  });

  it('should return undefined for a single rejected promise when suppressErrors is enabled', async () => {
    const errors: Error[] = [];
    const promise = Promise.reject(new Error('Test Error'));
    const result = await handlePromises(promise, {
      suppressErrors: true,
      errors
    });
    expect(result).toBeUndefined();
    expect(errors.length).toBe(1);
  });
});
