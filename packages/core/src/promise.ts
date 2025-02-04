import type { ModuleExecutionOptions } from './types';

export type PromiseFn<T> = () => Promise<T>;

export async function handlePromises<T>(
  promiseFn: PromiseFn<T>,
  options?: ModuleExecutionOptions
): Promise<T>;
export async function handlePromises<T>(
  promiseFns: PromiseFn<T>[],
  options?: ModuleExecutionOptions
): Promise<T[]>;
export async function handlePromises<T>(
  promiseFns: PromiseFn<T> | PromiseFn<T>[],
  options: ModuleExecutionOptions = {}
): Promise<T | T[]> {
  const { parallel = false, suppressErrors = false, errors = [] } = options;

  if (Array.isArray(promiseFns)) {
    return processMultiplePromises(
      promiseFns,
      parallel,
      suppressErrors,
      errors
    );
  } else {
    return processSinglePromise(promiseFns, suppressErrors, errors);
  }
}

async function processSinglePromise<T>(
  promiseFn: PromiseFn<T>,
  suppressErrors: boolean,
  errors: any[]
): Promise<T> {
  try {
    return await promiseFn();
  } catch (error) {
    return handleError(error as Error, suppressErrors, errors);
  }
}

async function processMultiplePromises<T>(
  promiseFns: PromiseFn<T>[],
  parallel: boolean,
  suppressErrors: boolean,
  errors: Error[]
): Promise<T[]> {
  if (parallel) {
    return Promise.all(
      promiseFns.map(fn => processSinglePromise(fn, suppressErrors, errors))
    );
  }
  return processSequentially(promiseFns, suppressErrors, errors);
}

async function processSequentially<T>(
  promiseFns: PromiseFn<T>[],
  suppressErrors: boolean,
  errors: Error[]
): Promise<T[]> {
  const results: T[] = [];
  for (const fn of promiseFns) {
    results.push(await processSinglePromise(fn, suppressErrors, errors));
  }
  return results;
}

function handleError<T>(
  error: Error,
  suppressErrors: boolean,
  errors: any[]
): T {
  if (suppressErrors) {
    errors.push(error);
    return undefined as unknown as T;
  }
  throw error;
}
