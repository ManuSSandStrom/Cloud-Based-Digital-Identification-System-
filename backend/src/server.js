import 'dotenv/config';
import app from './app.js';
import connectDatabase from './config/db.js';
import { ensureDefaultAdmin } from './services/bootstrapService.js';

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();
  await ensureDefaultAdmin();

  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
