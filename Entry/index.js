const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { connectRedis } = require('../utils/redis');
const cookieParser = require('cookie-parser');

dotenv.config({ path: '../.env' });
app.use(cookieParser());
app.use(express.json());
const port = process.env.PORT || 3000;

connectRedis().catch((err) => {
  console.error('Failed to connect to Redis:', err);
});

const v1Routes = require('../routes/v1/v1routes');

app.use('/api/v1', v1Routes);

app.listen(port, () => {
  console.log(`Worker ${process.pid} - Server running at http://localhost:${port}`);
});
