import { describe, it, expect, vi } from 'vitest';
import { createModule } from '../src/module';
import type { ModuleLoader } from '../src/types';

describe('createModule', () => {
  it('should create a module instance with a loader', async () => {
    const mockLoader: ModuleLoader = vi.fn(async () => ({
      default: {
        meta: { name: 'TestModule', version: '1.0.0' },
        setup: vi.fn()
      }
    }));

    const moduleInstance = createModule(mockLoader);

    expect(moduleInstance).toHaveProperty('install');
    expect(moduleInstance).toHaveProperty('uninstall');
    expect(moduleInstance.config.loader).toBe(mockLoader);
  });
});
