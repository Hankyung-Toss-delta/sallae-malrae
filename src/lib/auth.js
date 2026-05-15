import { verifyAccessToken } from '@/lib/jwt';

// Authorization: Bearer <token> 검증 후 payload 반환, 실패 시 null.
export function getSessionUser(request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  try {
    return verifyAccessToken(auth.slice(7));
  } catch {
    return null;
  }
}
