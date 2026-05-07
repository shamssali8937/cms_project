import app from './app.js';
import env from './config/env.js';
import sequelize from './core/db/sequelize.js';
import { publishScheduledPosts } from './core/scheduler/publishScheduledPosts.js';

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Supabase PostgreSQL connected');
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      
    });
    setInterval(publishScheduledPosts, 60 * 1000);
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
};

start();