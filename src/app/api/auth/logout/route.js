import { query } from '@/lib/db';
import { verifyAccessToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/response';

// DELETE /api/auth/logout — RT DB 삭제 + 쿠키 제거.
// AT는 클라이언트 메모리에 있어 서버 측 삭제 불가 — 15분 자연 만료에 위임.
export async function DELETE(request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return errorResponse('UNAUTHORIZED');

  const token = auth.slice(7);
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return errorResponse('UNAUTHORIZED');
  }

  await query('UPDATE users SET refresh_token = NULL WHERE id = ?', [payload.user_id]);

  const response = successResponse(null, 'Logged out.');
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });

  return response;
}
