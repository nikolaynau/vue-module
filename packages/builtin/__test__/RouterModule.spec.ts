import { describe, it, expect, beforeEach } from 'vitest';
import type { Router } from 'vue-router';
import {
  RouterModule,
  type RouterModuleOptions,
  type RouterModuleReturn
} from '../src/RouterModule';
import type { ModuleContext, ModuleDefinition } from '@vuemodule/core';

describe('RouterModule', () => {
  let mockRouter: Router;

  beforeEach(() => {
    mockRouter = {} as unknown as Router;
  });

  it('should return correct module config structure', () => {
    const config = RouterModule(mockRouter);

    expect(config).toHaveProperty('loader');
    expect(config).toHaveProperty('options');
    expect(config).toHaveProperty('enforce', 'pre');
    expect((config.options as RouterModuleOptions).router).toBe(mockRouter);
  });

  it('loader should return module definition with setup returning router', () => {
    const config = RouterModule(mockRouter);
    const definition = config.loader() as ModuleDefinition<
      RouterModuleOptions,
      RouterModuleReturn
    >;

    expect(definition.meta?.name).toBe('router');
    expect(typeof definition.setup).toBe('function');

    const ctx = {
      options: config.options
    } as ModuleContext<RouterModuleOptions>;
    const result = definition.setup!(ctx) as RouterModuleReturn;
    expect(result.router).toBe(mockRouter);
  });
});
