import { describe, it, expect, vi } from 'vitest';
import { createModuleContext } from '../src/context';
import type { InternalModuleContext, ModuleContext } from '../src/types';

function createTestContext<T = ModuleContext>(): T {
  return createModuleContext(
    { name: 'test-module', version: '1.0.0' },
    { optionA: true }
  ) as T;
}

describe('createModuleContext', () => {
  it('should create a module context with default metadata and options', () => {
    const context = createTestContext();
    expect(context.meta.name).toBe('test-module');
    expect(context.meta.version).toBe('1.0.0');
    expect(context.options).toEqual({ optionA: true });
  });

  it('should create an empty module context without errors', () => {
    const context = createModuleContext();
    expect(context.meta).toEqual({});
    expect(context.options).toEqual({});
  });

  it('should set the module name correctly', () => {
    const context = createTestContext();
    context.setName('new-name');
    expect(context.meta.name).toBe('new-name');
  });

  it('should set the module version correctly', () => {
    const context = createTestContext();
    context.setVersion('2.0.0');
    expect(context.meta.version).toBe('2.0.0');
  });

  it('should update metadata correctly', () => {
    const context = createTestContext();
    context.setMeta({ description: 'A test module' });
    expect(context.meta.description).toBe('A test module');
  });

  it('should register onInstalled hooks correctly', () => {
    const context = createTestContext<InternalModuleContext>();
    const hookCallback = vi.fn();

    context.onInstalled('test-module', hookCallback);
    expect(context._hooks).toHaveLength(1);
    expect(context._hooks[0].type).toBe('installed');
    expect(context._hooks[0].callback).toBe(hookCallback);
  });

  it('should register onUninstall hooks correctly', () => {
    const context = createTestContext<InternalModuleContext>();
    const hookCallback = vi.fn();

    context.onUninstall('test-module', hookCallback);
    expect(context._hooks).toHaveLength(1);
    expect(context._hooks[0].type).toBe('uninstall');
    expect(context._hooks[0].callback).toBe(hookCallback);
  });
});
