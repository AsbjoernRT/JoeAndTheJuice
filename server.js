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

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log("Starting a new worker");
    cluster.fork();
  });
} else {
  async function startServer() {
    try {
      // Forbind til databasen
      await database.connectToDatabase();
      console.log("Database connected successfully");

      // Importer routes efter databaseforbindelsen er etableret
      const apiRoutes = require("./backend/routes/apiRoutes");
      const viewRoutes = require("./backend/routes/viewRoutes");

      // Brug routes
      app.use("/api", apiRoutes);
      app.use("/", viewRoutes);

      // Start serveren
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1); // Afslut processen med en fejlkode
    }
  }

  startServer();
}
