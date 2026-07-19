import type { User } from 'oidc-client-ts';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]!;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUsername(user: User | undefined | null): string {
  if (!user) return '';

  const atPayload = decodeJwtPayload(user.access_token ?? '');
  const fromAT = atPayload?.username;
  if (typeof fromAT === 'string' && fromAT) return fromAT;

  const idPayload = decodeJwtPayload(user.id_token ?? '');
  const fromID = idPayload?.username;
  if (typeof fromID === 'string' && fromID) return fromID;

  const fromProfile = user.profile.preferred_username ?? user.profile.username;
  if (typeof fromProfile === 'string' && fromProfile) return fromProfile;

  return user.profile.sub ?? '';
}
