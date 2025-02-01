import { describe, it, expect, vi } from 'vitest';
import { createConfig } from '../src/modules/createConfig';
import type { ModuleDep } from '../src/types';

describe('createConfig', () => {
  it('should create config with loader and options when loader is provided as a function', () => {
    const loader = vi.fn();
    const options = { foo: 'bar' };

    const config = createConfig(loader, options);

    expect(config.loader).toBe(loader);

    expect(config.options).toEqual(options);
    expect(config.enforce).toBeUndefined();
    expect(config.deps).toEqual([]);
    expect(config.resolved).toBeUndefined();
  });

  it('should create config with loader and dependency when second argument is a function', () => {
    const loader = vi.fn();
    const dep: ModuleDep = vi.fn();

    const config = createConfig(loader, dep);

    expect(config.loader).toBe(loader);
    expect(config.options).toBeUndefined();
    expect(config.deps).toEqual([dep]);
  });

  it('should create config with loader, options, and extra moduleDeps when extra dependencies are provided', () => {
    const loader = vi.fn();
    const options = { foo: 'bar' };
    const dep1: ModuleDep = vi.fn();
    const dep2: ModuleDep = vi.fn();

    const config = createConfig(loader, options, dep1, dep2);

    expect(config.loader).toBe(loader);
    expect(config.options).toEqual(options);
    expect(config.deps).toEqual([dep1, dep2]);
  });

  it('should create config from a ModuleLoadConfig object with loader, options, enforce, and deps', () => {
    const loader = vi.fn();
    const options = { baz: 'qux' };
    const enforce = 'pre' as const;
    const dep: ModuleDep = vi.fn();

    const loaderConfig = {
      loader: loader,
      options,
      enforce,
      deps: [dep]
    };

    const config = createConfig(loaderConfig);

    expect(config.loader).toBe(loader);
    expect(config.options).toEqual(options);
    expect(config.enforce).toBe(enforce);
    expect(config.deps).toEqual([dep]);
  });

  it('should create config from a ModuleLoadConfig object with a function as options', () => {
    const loader = vi.fn();
    const optionsFn = vi.fn();
    const loaderConfig = {
      loader: loader,
      options: optionsFn,
      deps: [] as ModuleDep[]
    };

    const config = createConfig(loaderConfig);

    expect(config.loader).toBe(loader);
    expect(config.options).toBe(optionsFn);
  });

  it('should throw an error when no loader is provided', () => {
    expect(() => createConfig({} as any)).toThrowError('Loader is required.');
  });
});
