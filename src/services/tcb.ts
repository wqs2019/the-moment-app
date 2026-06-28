import adapter from '@cloudbase/adapter-rn';
import cloudbase from '@cloudbase/js-sdk';

import { TCB_CONFIG } from '../config/constant';

cloudbase.useAdapters(adapter);

let appInstance: any = null;

const initTCB = () => {
  if (appInstance) {
    return appInstance;
  }

  if (!TCB_CONFIG.env) {
    return null;
  }

  appInstance = cloudbase.init({
    env: TCB_CONFIG.env,
    region: TCB_CONFIG.region,
  });

  return appInstance;
};

const ensureAuth = async (app: any) => {
  const auth = app.auth({ persistence: 'local' });

  if (auth.hasLoginState?.()) {
    return auth;
  }

  if (auth.anonymousAuthProvider) {
    await auth.anonymousAuthProvider().signIn();
    return auth;
  }

  if (auth.signInAnonymously) {
    await auth.signInAnonymously();
    return auth;
  }

  throw new Error('Anonymous auth is not available');
};

const resolveResult = <T,>(result: any): { code: number; message: string; data: T } => {
  if (result?.code !== undefined) {
    return result;
  }

  if (result?.success === false) {
    return {
      code: -1,
      message: result.message || 'Cloud function failed',
      data: result,
    };
  }

  return {
    code: 0,
    message: '',
    data: result,
  };
};

export const CloudService = {
  isConfigured() {
    return !!TCB_CONFIG.env;
  },

  async bootstrap(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const app = initTCB();
      if (!app) {
        return false;
      }
      await ensureAuth(app);
      return true;
    } catch (error) {
      console.warn('[TCB] bootstrap failed:', error);
      return false;
    }
  },

  async callFunction<T = unknown>(name: string, data: Record<string, unknown> = {}) {
    if (!this.isConfigured()) {
      throw new Error('TCB env is not configured');
    }

    const app = initTCB();
    if (!app) {
      throw new Error('TCB init failed');
    }

    await ensureAuth(app);
    const response = await app.callFunction({ name, data });
    const result = JSON.parse(JSON.stringify(response.result || {}));
    return resolveResult<T>(result);
  },

  async uploadFile(cloudPath: string, filePath: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('TCB env is not configured');
    }

    const app = initTCB();
    if (!app) {
      throw new Error('TCB init failed');
    }

    await ensureAuth(app);
    const result = await app.uploadFile({
      cloudPath,
      filePath,
    });
    const normalized = JSON.parse(JSON.stringify(result || {}));
    return normalized.fileID || normalized.fileId || '';
  },
};

export default CloudService;
