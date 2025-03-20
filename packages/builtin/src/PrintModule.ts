import {
  defineModule,
  getModuleName,
  getModuleVersion,
  getVersion,
  type ModuleConfig,
  type ModuleEnforce,
  type ModuleId,
  type ModuleLoadConfig
} from '@vuemodule/core';

export interface PrintModuleOptions {
  showBanner?: boolean;
  bannerFormat?: string;
  bannerBackground?: string;
  backgroundColor?: string;
  textColor?: string;
  brandColor?: string;
}

interface PrintModuleEntry {
  name?: string;
  version?: string;
  id?: ModuleId;
  enforce?: ModuleEnforce;
  installed?: boolean;
}

const MODULE_NAME = 'print';

const definition = defineModule<PrintModuleOptions>(
  MODULE_NAME,
  ({ options, onInstalled, onUninstall }) => {
    const {
      showBanner = true,
      bannerFormat = 'Vue Module v{version}',
      bannerBackground = 'linear-gradient(90deg,#257fea,#2b46a9)',
      backgroundColor = '#2f353a',
      textColor = '#d7d7d7',
      brandColor = '#257fea'
    } = options;

    function logMsg(message: any, ...params: any[]) {
      console.log(message, ...params);
    }

    function printBanner() {
      logMsg(
        `%c${bannerFormat.replace('{version}', getVersion())}`,
        `background: ${bannerBackground}; font-size: 16px; color: white; padding: 4px 10px; border-radius: 3px;`
      );
    }

    function printModule(moduleEntry: PrintModuleEntry) {
      const { name, version, id, enforce, installed } = moduleEntry;

      const line: string[] = [];
      if (installed) {
        line.push('%cLoad');
      } else {
        line.push('%cUnload');
      }

      if (enforce && enforce !== 'default') {
        line.push(enforce);
      }

      line.push('module');

      if (name) {
        line.push(`%c${name}`);
      } else if (typeof id === 'string') {
        line.push(`%id: ${id}`);
      } else {
        line.push('%cnoname');
      }

      if (version) {
        line.push(`v${version}`);
      }

      logMsg(
        line.join(' '),
        `background: ${backgroundColor}; color: ${textColor}; font-size: 13px; padding: 2px 0px 2px 5px;`,
        `background: ${backgroundColor}; color: ${brandColor}; font-size: 13px; padding: 2px 5px 2px 0px; font-weight: bold;`
      );
    }

    function getModuleEntry(
      module: ModuleConfig<any, any>,
      installed?: boolean
    ): PrintModuleEntry {
      const name = getModuleName(module);
      const id = module.id;
      const enforce = module.enforce;
      const version = getModuleVersion(module);
      return { name, id, enforce, version, installed };
    }

    function canPrint(entry: PrintModuleEntry) {
      return entry.name !== MODULE_NAME;
    }

    if (showBanner) {
      printBanner();
    }

    onInstalled('any', module => {
      const entry = getModuleEntry(module, true);
      if (canPrint(entry)) {
        printModule(entry);
      }
    });

    onUninstall('any', module => {
      const entry = getModuleEntry(module, false);
      if (canPrint(entry)) {
        printModule(entry);
      }
    });
  }
);

export function PrintModule(
  options?: PrintModuleOptions
): ModuleLoadConfig<PrintModuleOptions> {
  return {
    loader: () => definition,
    options,
    enforce: 'pre'
  };
}
