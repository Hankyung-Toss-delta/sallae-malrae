import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

// DELETE /api/auth/logout — RT DB 삭제 + AT/RT 쿠키 제거.
export async function DELETE(request) {
  const payload = getSessionUser(request);
  if (!payload) return errorResponse('UNAUTHORIZED');

  await query('UPDATE users SET refresh_token = NULL WHERE id = ?', [payload.user_id]);

  const response = successResponse(null, 'Logged out.');

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
  });

  return response;
}
