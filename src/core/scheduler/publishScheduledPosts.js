import sequelize from '../db/sequelize.js';
import { eventEmitter } from '../events/eventEmitter.js';

export const publishScheduledPosts = async () => {
  const [results, meta] = await sequelize.query(`
    UPDATE posts
    SET status = 'published', published_at = NOW(), updated_at = NOW()
    WHERE status = 'scheduled' AND scheduled_at <= NOW()
  `);
  const affected = meta?.rowCount || 0;
  if (affected > 0) {
    console.log(`📅 Published ${affected} scheduled post(s)`);
    eventEmitter.emit('posts.scheduled-published', { count: affected });
  }
};