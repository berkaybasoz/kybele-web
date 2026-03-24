import dayjs from 'dayjs';
import { tenants, users, delay, Tenant, User } from './mock-db';
import { UserType } from '../constants/enums';

export type LoginPayload = {
  tenantSlug: string;
  userType: UserType;
  customerNo: string;
  password: string;
};

export type AuthUser = {
  id: string;
  tenantId: string;
  tenantSlug: string;
  fullName: string;
  email: string;
  userType: UserType;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  tenant: Tenant;
};

export class ApiError extends Error {
  status: number;
  code: string;
  meta?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.meta = meta;
  }
}

const ACCESS_TTL_MINUTES = 15;
const LOCK_MINUTES = 15;

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function toAuthUser(user: User, tenantSlug: string): AuthUser {
  return {
    id: user.id,
    tenantId: user.tenantId,
    tenantSlug,
    fullName: user.fullName,
    email: user.email,
    userType: user.userType,
    roles: user.roles,
    permissions: user.permissions,
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const tenant = tenants.find((item) => item.slug === payload.tenantSlug && item.isActive);
  if (!tenant) {
    throw new ApiError(404, 'TENANT_NOT_FOUND', 'Şirket bulunamadı veya pasif durumda.');
  }

  const user = users.find(
    (item) =>
      item.tenantId === tenant.id &&
      item.userType === payload.userType &&
      item.customerNo === payload.customerNo,
  );

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Müşteri no veya şifre hatalı.');
  }

  if (user.lockedUntil && dayjs(user.lockedUntil).isAfter(dayjs())) {
    throw new ApiError(423, 'ACCOUNT_LOCKED', 'Hesap geçici olarak kilitlendi.', {
      lockedUntil: user.lockedUntil,
      remainingSeconds: dayjs(user.lockedUntil).diff(dayjs(), 'second'),
    });
  }

  if (payload.password !== user.password) {
    user.failedLoginCount += 1;

    if (user.failedLoginCount >= 5) {
      user.lockedUntil = dayjs().add(LOCK_MINUTES, 'minute').toISOString();
      user.failedLoginCount = 0;
      throw new ApiError(423, 'ACCOUNT_LOCKED', '5 hatalı deneme nedeniyle hesap kilitlendi.', {
        lockedUntil: user.lockedUntil,
        remainingSeconds: dayjs(user.lockedUntil).diff(dayjs(), 'second'),
      });
    }

    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Müşteri no veya şifre hatalı.', {
      remainingAttempts: 5 - user.failedLoginCount,
    });
  }

  user.failedLoginCount = 0;
  user.lockedUntil = null;

  const accessToken = encodeBase64Utf8(
    JSON.stringify({
      sub: user.id,
      tenantId: user.tenantId,
      tenantSlug: tenant.slug,
      userType: user.userType,
      roles: user.roles,
      iat: dayjs().unix(),
      exp: dayjs().add(ACCESS_TTL_MINUTES, 'minute').unix(),
    }),
  );

  const refreshToken = encodeBase64Utf8(`${user.id}-${Date.now()}-${Math.random()}`);

  return delay({
    accessToken,
    refreshToken,
    user: toAuthUser(user, tenant.slug),
    tenant,
  });
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  if (!refreshToken) {
    throw new ApiError(401, 'INVALID_REFRESH', 'Refresh token bulunamadı.');
  }

  return delay({
    accessToken: encodeBase64Utf8(`refreshed-${Date.now()}`),
  });
}

export async function logout(): Promise<{ ok: boolean }> {
  return delay({ ok: true }, 120);
}
