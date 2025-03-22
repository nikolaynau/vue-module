import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  beforeEach,
  type MockInstance
} from 'vitest';
import type {
  ModuleConfig,
  ModuleContext,
  ModuleDefinition
} from '@vuemodule/core';
import { PrintModule, type PrintModuleOptions } from '../src/PrintModule';

vi.mock('@vuemodule/core', () => {
  return {
    defineModule: vi.fn((_name: string, setup: any) => {
      return {
        name: 'print',
        setup
      };
    }),
    getVersion: () => '1.0.0',
    getModuleName: (config: ModuleConfig) => config.resolved?.meta?.name,
    getModuleVersion: (config: ModuleConfig) => config.resolved?.meta?.version
  };
});

describe('PrintModule', () => {
  let mockConsoleLog: MockInstance;

  beforeEach(() => {
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return correct module config structure', () => {
    const config = PrintModule();

    expect(config).toHaveProperty('loader');
    expect(config).toHaveProperty('enforce', 'pre');
  });

  it('should return correct module config structure with options', () => {
    const options: PrintModuleOptions = {
      showBanner: true,
      backgroundColor: '#000'
    };
    const config = PrintModule(options);

    expect(config).toHaveProperty('loader');
    expect(config.options).toEqual(options);
    expect(config).toHaveProperty('enforce', 'pre');
  });

  it('should log the banner when showBanner is true', () => {
    const config = PrintModule({ showBanner: true });
    const definition = config.loader() as ModuleDefinition;

    const context = {
      options: config.options,
      onInstalled: () => {},
      onUninstall: () => {}
    } as unknown as ModuleContext;
    definition.setup?.(context);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '%cVue Module v1.0.0',
      'background: linear-gradient(90deg,#257fea,#2b46a9); font-size: 16px; color: white; padding: 4px 10px; border-radius: 3px;'
    );
  });

  it('should not log the banner when showBanner is false', () => {
    const config = PrintModule({ showBanner: false });
    const definition = config.loader() as ModuleDefinition;

    const context = {
      options: config.options,
      onInstalled: () => {},
      onUninstall: () => {}
    } as unknown as ModuleContext;
    definition.setup?.(context);

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('should log module installation', () => {
    const config = PrintModule();
    const definition = config.loader() as ModuleDefinition;
    const mockModule = {
      id: 'test-module',
      enforce: 'pre',
      resolved: { meta: { name: 'test-module', version: '1.1.1' } }
    } as ModuleConfig;

    let onInstalledCallback: ((module: ModuleConfig) => void) | undefined;
    const onInstalled = (deps: any, cb: any) => {
      onInstalledCallback = cb;
    };

    const context = {
      options: { ...config.options },
      onInstalled,
      onUninstall: () => {}
    } as unknown as ModuleContext;
    definition.setup?.(context);

    onInstalledCallback?.(mockModule);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '%cLoad pre module %ctest-module v1.1.1',
      'background: #2f353a; color: #d7d7d7; font-size: 13px; padding: 2px 0px 2px 5px;',
      'background: #2f353a; color: #257fea; font-size: 13px; padding: 2px 5px 2px 0px; font-weight: bold;'
    );
  });

  it('should log module uninstallation', () => {
    const config = PrintModule();
    const definition = config.loader() as ModuleDefinition;
    const mockModule = {
      id: 'test-module',
      enforce: 'pre',
      resolved: { meta: { name: 'test-module', version: '1.1.1' } }
    } as ModuleConfig;

    let onUninstalledCallback: ((module: ModuleConfig) => void) | undefined;
    const onUninstall = (deps: any, cb: any) => {
      onUninstalledCallback = cb;
    };

    const context = {
      options: { ...config.options },
      onInstalled: () => {},
      onUninstall
    } as unknown as ModuleContext;
    definition.setup?.(context);

    onUninstalledCallback?.(mockModule);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '%cUnload pre module %ctest-module v1.1.1',
      'background: #2f353a; color: #d7d7d7; font-size: 13px; padding: 2px 0px 2px 5px;',
      'background: #2f353a; color: #257fea; font-size: 13px; padding: 2px 5px 2px 0px; font-weight: bold;'
    );
  });
});
