import { describe, it, expect, vi, afterEach } from 'vitest';
import { PrintModule, type PrintModuleOptions } from '../src/PrintModule';

vi.mock('@vuemodule/core', () => {
  return {
    defineModule: vi.fn((_name: string, setup: any) => {
      return {
        name: 'print',
        setup
      };
    })
  };
});

describe('PrintModule', () => {
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
});
