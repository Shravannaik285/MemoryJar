import cron from 'node-cron';
import { processBirthdayReminders } from '../services/birthdayService.js';

let cronTask = null;

/**
 * Initializes the background birthday check schedule.
 * Runs periodically: checks subscriptions across all global timezones.
 * @param {string} cronSchedule - Default every 5 minutes (expression: star-slash-5)
 */
export function startBirthdayScheduler(cronSchedule = '*/5 * * * *') {
  if (cronTask) {
    console.log('[Scheduler] Birthday scheduler already running.');
    return cronTask;
  }

  console.log(`[Scheduler] Initializing birthday cron job with schedule: "${cronSchedule}"...`);

  cronTask = cron.schedule(cronSchedule, async () => {
    try {
      const stats = await processBirthdayReminders();
      if (stats.sent > 0 || stats.failed > 0) {
        console.log(`[Scheduler] Check complete: ${stats.checked} subscribers checked, ${stats.sent} sent, ${stats.failed} failed.`);
      }
    } catch (err) {
      console.error('[Scheduler] Error during scheduled birthday check:', err);
    }
  });

  return cronTask;
}

/**
 * Stops the scheduler if needed
 */
export function stopBirthdayScheduler() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[Scheduler] Birthday scheduler stopped.');
  }
}
