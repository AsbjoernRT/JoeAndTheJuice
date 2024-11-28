// server.js
const dotenv = require("dotenv");
dotenv.config();

const cluster = require("cluster");
const os = require("os");
const numCPUs = os.cpus().length;

const app = require("./backend/app");
const database = require("./backend/database/database");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new worker.`);
    cluster.fork();
  });
} else {
  const app = require('./backend/app');
  const database = require('./backend/database/database');

  async function startServer() {
    try {
      // Connect to the database
      await database.connectToDatabase();
      console.log(`Database connected successfully by Worker ${process.pid}`);

      // Import and use routes
      const apiRoutes = require("./backend/routes/apiRoutes");
      const viewRoutes = require("./backend/routes/viewRoutes");

      app.use("/api", apiRoutes);
      app.use("/", viewRoutes);

      // Start the server
      // const PORT = process.env.PORT || 3000;
      const PORT = process.env.PORT || (3000 + cluster.worker.id);
      app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1); // Exit process with failure
    }
  }

  startServer();
}
