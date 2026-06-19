import CloudService from './tcb';

export const cloudFunctionService = {
  ping() {
    return CloudService.callFunction<{ ok: boolean }>('ping', {});
  },
};
