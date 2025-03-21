import { describe, it, expect, vi, afterEach } from 'vitest';
import { PostRouterModule } from '../src/PostRouterModule';

vi.mock('@vuemodule/core', () => {
  let onInstalledCallback: any;

  return {
    defineModule: vi.fn((_name: string, setup: any) => {
      setup({
        onInstalled: (deps: string[], cb: any) => {
          onInstalledCallback = cb;
        }
      });
      return {
        name: 'postRouter',
        onInstalledCallback
      };
    }),
    getModuleExports: vi.fn((data: any) => {
      return data;
    })
  };
});

describe('PostRouterModule', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return correct module config structure', () => {
    const config = PostRouterModule();

    expect(config).toHaveProperty('loader');
    expect(config).toHaveProperty('enforce', 'post');
  });

  it('should call app.use(router) when app and router are available', () => {
    const config = PostRouterModule();
    const definition = config.loader();

    const appModule = { app: { use: vi.fn() } };
    const routerModule = { router: {} };

    (definition as any).onInstalledCallback([appModule, routerModule]);

    expect(appModule.app.use).toHaveBeenCalledWith(routerModule.router);
  });
});
