// server.js
const cluster = require('cluster');
const os = require('os');

const dotenv = require('dotenv');
dotenv.config();

const app = require('./backend/app');
const database = require('./backend/database/database');

// async function startServer() {
//   try {
//     // Forbind til databasen
//     await database.connectToDatabase();
//     console.log('Database connected successfully');

//     // Importer routes efter databaseforbindelsen er etableret
//     const apiRoutes = require('./backend/routes/apiRoutes');
//     const viewRoutes = require('./backend/routes/viewRoutes');

//     // Brug routes
//     app.use('/api', apiRoutes);
//     app.use('/', viewRoutes);

//     // Start serveren
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//       console.log(`Server is running on port: ${PORT}`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1); // Afslut processen med en fejlkode
//   }
// }

// startServer();
if (cluster.isMaster) {
  // Master process: fork workers for each CPU core
  const numCPUs = os.cpus().length;
  console.log(`Master process is running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Log worker events
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited with code ${code}, signal ${signal}.`);
    console.log('Starting a new worker...');
    cluster.fork(); // Restart a new worker if one exits
  });
} else {
  // Worker processes: Start the application
  async function startWorker() {
    try {
      // Connect to the database
      await database.connectToDatabase();
      console.log(`Worker ${process.pid} connected to the database.`);

      // Import routes after database connection is established
      const apiRoutes = require('./backend/routes/apiRoutes');
      const viewRoutes = require('./backend/routes/viewRoutes');

      // Use routes
      app.use('/api', apiRoutes);
      app.use('/', viewRoutes);

      // Start the server
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port: ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start worker:', error);
      process.exit(1);
    }
  }

  startWorker();
}