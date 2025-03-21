import { describe, it, expect, beforeEach } from 'vitest';
import type { App } from 'vue';
import {
  AppModule,
  type AppModuleOptions,
  type AppModuleReturn
} from '../src/AppModule';
import type { ModuleContext, ModuleDefinition } from '@vuemodule/core';

describe('AppModule', () => {
  let mockApp: App;

  beforeEach(() => {
    mockApp = { config: {} } as unknown as App;
  });

  it('should return correct module config structure', () => {
    const config = AppModule(mockApp);

    expect(config).toHaveProperty('loader');
    expect(config).toHaveProperty('options');
    expect(config).toHaveProperty('enforce', 'pre');

    expect((config.options as AppModuleOptions).app).toBe(mockApp);
  });

  it('loader should return module definition with setup returning app', () => {
    const config = AppModule(mockApp);
    const definition = config.loader() as ModuleDefinition<
      AppModuleOptions,
      AppModuleReturn
    >;

    expect(definition.meta?.name).toBe('app');
    expect(typeof definition.setup).toBe('function');

    const ctx = { options: config.options } as ModuleContext<AppModuleOptions>;
    const result = definition.setup!(ctx) as AppModuleReturn;
    expect(result.app).toBe(mockApp);
  });
});
