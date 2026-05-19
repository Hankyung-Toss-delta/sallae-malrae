import { getShareData } from '@/lib/share';
import { successResponse, errorResponse } from '@/lib/response';

// GET /api/share/:shareToken — 인증 없이 공유자 통계 조회.
export async function GET(_request, { params }) {
  const { shareToken } = await params;

  let data;
  try {
    data = await getShareData(shareToken);
  } catch {
    return errorResponse('SERVER_ERROR');
  }
  if (!data) return errorResponse('INVALID_SHARE_TOKEN');

  return successResponse(data, 'Share page retrieved.');
}
