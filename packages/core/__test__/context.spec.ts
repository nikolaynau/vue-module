import { describe, it, expect, beforeEach } from 'vitest';
import {
  setActiveContext,
  createInternalContext,
  setVersion,
  setName,
  type ModuleInternalContext,
  setMeta
} from '../src/context';

describe('ModuleInternalContext Tests', () => {
  let context: ModuleInternalContext;

  beforeEach(() => {
    // Reset active context before each test
    context = createInternalContext();
    setActiveContext(context);
  });

  it('should create an internal context with empty meta and hooks', () => {
    const newContext = createInternalContext();
    expect(newContext).toEqual({ meta: {}, hooks: [] });
  });

  it('should set the active context', () => {
    expect(context).toEqual({ meta: {}, hooks: [] });
  });

  it('should set the version in the active context', () => {
    setVersion('1.0.0');
    expect(context.meta.version).toBe('1.0.0');
  });

  it('should set the name in the active context', () => {
    setName('TestModule');
    expect(context.meta.name).toBe('TestModule');
  });

  it('should not throw when setting version with no active context', () => {
    setActiveContext(undefined);
    expect(() => setVersion('1.0.0')).not.toThrow();
  });

  it('should not throw when setting name with no active context', () => {
    setActiveContext(undefined);
    expect(() => setName('TestModule')).not.toThrow();
  });

  it('should not modify meta if version is undefined', () => {
    setVersion(undefined);
    expect(context.meta).toEqual({});
  });

  it('should not modify meta if name is undefined', () => {
    setName(undefined);
    expect(context.meta).toEqual({});
  });

  it('should set meta in the active context', () => {
    const meta = { version: '2.0.0', name: 'UpdatedModule' };
    setMeta(meta);
    expect(context.meta).toEqual(meta);
  });

  it('should merge meta in the active context', () => {
    context.meta = { version: '1.0.0', foo: 'bar' };
    setMeta({ name: 'MergedModule' });
    expect(context.meta).toEqual({
      version: '1.0.0',
      name: 'MergedModule',
      foo: 'bar'
    });
  });

  it('should not throw when setting meta with no active context', () => {
    setActiveContext(undefined);
    expect(() => setMeta({ version: '2.0.0' })).not.toThrow();
  });
});
