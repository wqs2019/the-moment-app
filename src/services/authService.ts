import { AppleLoginPayload, AuthSession, User } from '../types/user';
import CloudService from './tcb';

type CloudResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const unwrap = <T>(response: { code?: number; message?: string; data?: CloudResult<T> }): T => {
  // TCB might return data directly or wrapped in a response object depending on the SDK version
  const resultData = response.data || (response as unknown as CloudResult<T>);
  
  if (resultData.success === false || resultData.data === undefined) {
    throw new Error(resultData.message || response.message || '请求失败');
  }

  return resultData.data;
};

class AuthService {
  async appleLogin(payload: AppleLoginPayload): Promise<AuthSession> {
    const response = await CloudService.callFunction<CloudResult<AuthSession>>('moment_user', {
      action: 'appleLogin',
      data: payload,
    });

    return unwrap(response);
  }

  async validateSession(token: string): Promise<AuthSession> {
    const response = await CloudService.callFunction<CloudResult<AuthSession>>('moment_user', {
      action: 'validateSession',
      data: { token },
    });

    return unwrap(response);
  }

  async getUser(userId: string): Promise<User> {
    const response = await CloudService.callFunction<CloudResult<User>>('moment_user', {
      action: 'get',
      data: { _id: userId },
    });

    return unwrap(response);
  }
}

export default new AuthService();