import "dotenv/config";
import { queueAggregation } from "../lib/queue";
import { initializeScheduler } from "../lib/scheduler";

async function bootstrap() {
  await initializeScheduler();
  queueAggregation();
  console.info("Aggregation worker ready.");
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap worker", error);
  process.exit(1);
});
