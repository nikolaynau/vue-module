import type { ModuleExecutionOptions } from './types';

export async function handlePromises<T>(
  promise: Promise<T>,
  options?: ModuleExecutionOptions
): Promise<T>;
export async function handlePromises<T>(
  promises: Promise<T>[],
  options?: ModuleExecutionOptions
): Promise<T[]>;
export async function handlePromises<T>(
  promises: Promise<T> | Promise<T>[],
  options: ModuleExecutionOptions = {}
): Promise<T | T[]> {
  const { parallel = false, suppressErrors = false, errors = [] } = options;

  if (Array.isArray(promises)) {
    return processMultiplePromises(promises, parallel, suppressErrors, errors);
  } else {
    return processSinglePromise(promises, suppressErrors, errors);
  }
}

async function processSinglePromise<T>(
  promise: Promise<T>,
  suppressErrors: boolean,
  errors: any[]
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    return handleError(error as Error, suppressErrors, errors);
  }
}

async function processMultiplePromises<T>(
  promises: Promise<T>[],
  parallel: boolean,
  suppressErrors: boolean,
  errors: Error[]
): Promise<T[]> {
  if (parallel) {
    return Promise.all(
      promises.map(p => processSinglePromise(p, suppressErrors, errors))
    );
  }
  return processSequentially(promises, suppressErrors, errors);
}

async function processSequentially<T>(
  promises: Promise<T>[],
  suppressErrors: boolean,
  errors: Error[]
): Promise<T[]> {
  const results: T[] = [];
  for (const promise of promises) {
    results.push(await processSinglePromise(promise, suppressErrors, errors));
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
