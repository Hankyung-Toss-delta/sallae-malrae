import { randomBytes } from 'crypto';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

// POST /api/share/token — 16자 공유 토큰 발급 (재발급 시 이전 토큰 즉시 무효).
export async function POST(request) {
  const user = getSessionUser(request);
  if (!user) return errorResponse('UNAUTHORIZED');

  const shareToken = randomBytes(8).toString('hex'); // 16자 hex
  await query('UPDATE users SET share_token = ? WHERE id = ?', [shareToken, user.user_id]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  return successResponse(
    {
      shareToken,
      shareUrl: `${baseUrl}/share/${shareToken}`,
    },
    '공유 링크가 생성되었습니다.',
  );
}
