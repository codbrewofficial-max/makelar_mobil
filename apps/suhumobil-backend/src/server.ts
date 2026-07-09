import app from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";

app.listen(env.port, () => {
  logger.info(`SuhuMobil backend listening on port ${env.port} (${env.nodeEnv})`);
});
