// server.js
require('dotenv').config();  // Correct and sufficient

const cluster = require("cluster");
const os = require("os");
const Redis = require("redis");
const numCPUs = os.cpus().length;

// // Redis configuration
// const redisConfig = {
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: process.env.REDIS_PORT || 6379,
//   password: process.env.REDIS_PASSWORD,
// };

const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD, // Ensure this matches the .env value
};

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new worker.`);
    cluster.fork();
  });
} else {
  const app = require("./backend/app");
  const database = require("./backend/database/database");

  async function startServer() {
    try {
      // Create Redis client for this worker
      const redisClient = Redis.createClient(redisConfig);

      // Handle Redis events
      redisClient.on("error", (err) => {
        console.error(`Redis Error in Worker ${process.pid}:`, err);
      });

      redisClient.on("connect", () => {
        console.log(`Redis connected in Worker ${process.pid}`);
      });

      await redisClient.connect();
      // Make Redis client available to app
      // app.set("redisClient", redisClient);
       // Make Redis client available to the app
       app.locals.redisClient = redisClient;


      // Connect to the database
      await database.connectToDatabase();
      console.log(`Database connected successfully by Worker ${process.pid}`);

      // // Serve static files
      // app.use(
      //   favicon(
      //     path.join(__dirname, "..", "frontend", "favicon_io", "favicon.ico")
      //   )
      // );
      // app.use(express.static(path.join(__dirname, "..", "frontend")));

      // // Import routes
      // const apiRoutes = require("./routes/apiRoutes");
      // const viewRoutes = require("./routes/viewRoutes");

      // Start the server
      // const PORT = process.env.PORT || 3000;
      const PORT = process.env.PORT || 3000 + cluster.worker.id;
      const server = app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
      });

      // Graceful shutdown
      process.on("SIGTERM", async () => {
        console.log(`Worker ${process.pid} shutting down...`);
        await redisClient.quit();
        server.close();
        process.exit(0);
      });
    } catch (error) {
      console.error(`Worker ${process.pid} failed to start:`, error);
      process.exit(1);
    }
  }

  startServer();
}
