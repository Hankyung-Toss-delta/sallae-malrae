import { sendDueNotifications } from '../src/lib/notifier.js';

try {
  const result = await sendDueNotifications(new Date());
  console.log(`[notifier] 완료 — before_24h: ${result.before24h}, expire: ${result.expire}`);
  process.exit(0);
} catch (err) {
  console.error('[notifier] 오류:', err);
  process.exit(1);
}
