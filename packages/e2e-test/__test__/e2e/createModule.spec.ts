import { describe, it, expect, vi } from 'vitest';
import { createModule, defineModule } from '@vuemodule/core';

describe('createModule', () => {
  it('should install and uninstall module correctly', async () => {
    const setupFn = vi.fn();
    const installFn = vi.fn();
    const uninstallFn = vi.fn();

    const moduleReturn = { a: 1, b: 2 };

    const moduleA = defineModule(
      'moduleA',
      ({ meta, options, onInstalled, onUninstall }) => {
        setupFn(meta, options);

        onInstalled(installFn);

        onUninstall(uninstallFn);

        return moduleReturn;
      }
    );

    expect(moduleA.meta).toEqual({ name: 'moduleA' });

    const moduleAOptions = {
      opt1: 1,
      opt2: 2
    };

    const moduleAInstance = createModule(
      () => Promise.resolve(moduleA),
      moduleAOptions
    );

    expect(moduleAInstance.config.resolved).toBeUndefined();
    expect(moduleAInstance.config.options).toEqual(moduleAOptions);

    await moduleAInstance.install();

    expect(moduleAInstance.config.resolved?.disposed).toBeFalsy();
    expect(moduleAInstance.config.resolved?.exports).toEqual(moduleReturn);
    expect(moduleAInstance.config.resolved?.meta).toEqual({ name: 'moduleA' });
    expect(moduleAInstance.config.resolved?.options).toEqual(moduleAOptions);
    expect(moduleAInstance.config.resolved?.hooks).toHaveLength(2);

    expect(setupFn).toHaveBeenCalledTimes(1);
    expect(installFn).toHaveBeenCalledTimes(1);
    expect(uninstallFn).not.toHaveBeenCalled();

    const beforeUninstallResolved = moduleAInstance.config.resolved;
    await moduleAInstance.uninstall();

    expect(beforeUninstallResolved?.disposed).toBeTruthy();
    expect(beforeUninstallResolved?.hooks).toHaveLength(0);
    expect(moduleAInstance.config.resolved).toBeUndefined();
    expect(moduleAInstance.config.options).toEqual(moduleAOptions);

    expect(setupFn).toHaveBeenCalledTimes(1);
    expect(installFn).toHaveBeenCalledTimes(1);
    expect(uninstallFn).toHaveBeenCalledTimes(1);
  });

  // it('should not call install twice if already installed', async () => {
  //   const onInstalled = vi.fn();

  //   const moduleInstance = createModule(async () => ({
  //     hooks: { onInstalled }
  //   }));

  //   await moduleInstance.install();
  //   await moduleInstance.install(); // Повторный вызов

  //   expect(onInstalled).toHaveBeenCalledTimes(1); // Должно быть вызвано только один раз
  // });

  // it('should not call uninstall if not installed', async () => {
  //   const onUninstalled = vi.fn();

  //   const moduleInstance = createModule(async () => ({
  //     hooks: { onUninstalled }
  //   }));

  //   await moduleInstance.uninstall(); // Вызываем удаление без установки

  //   expect(onUninstalled).toHaveBeenCalledTimes(0); // Хук не должен вызываться
  // });

  // it('should allow re-installation after uninstall', async () => {
  //   const onInstalled = vi.fn();
  //   const onUninstalled = vi.fn();

  //   const moduleInstance = createModule(async () => ({
  //     hooks: { onInstalled, onUninstalled }
  //   }));

  //   await moduleInstance.install();
  //   await moduleInstance.uninstall();
  //   await moduleInstance.install(); // Повторная установка после удаления

  //   expect(onInstalled).toHaveBeenCalledTimes(2); // Должно установиться дважды
  //   expect(onUninstalled).toHaveBeenCalledTimes(1); // Должно удалиться один раз
  // });
});
