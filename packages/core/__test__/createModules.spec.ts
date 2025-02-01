import { describe, it, expect, vi, afterEach } from 'vitest';
import { createModules } from '../src/modules/createModules';
import * as ModuleManagerClass from '../src/modules/moduleManager';
import * as createScope from '../src/modules/createScope';
import type { ModuleInstance, ModuleScope } from '../src/types';

describe('createModules', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a ModuleManager instance with provided modules', () => {
    const mockModules = [
      { name: 'module1' },
      { name: 'module2' }
    ] as ModuleInstance[];

    const ModuleManagerClassSpy = vi
      .spyOn(ModuleManagerClass, 'ModuleManagerClass')
      .mockImplementation(
        () =>
          ({
            setScope: vi.fn()
          }) as any
      );

    const manager = createModules(mockModules);

    expect(manager).not.toBeUndefined();
    expect(ModuleManagerClassSpy).toHaveBeenCalledWith(mockModules);
  });

  it('should set the scope using createScope', () => {
    const mockModules: ModuleInstance[] = [];
    const scope = { modules: {} } as ModuleScope;

    const createScopeSpy = vi
      .spyOn(createScope, 'createScope')
      .mockReturnValue(scope);

    vi.spyOn(ModuleManagerClass, 'ModuleManagerClass').mockImplementation(
      () =>
        ({
          setScope: vi.fn()
        }) as any
    );

    const manager = createModules(mockModules);

    expect(createScopeSpy).toHaveBeenCalledWith(manager);
    expect(manager.setScope).toHaveBeenCalledWith(scope);
  });
});
