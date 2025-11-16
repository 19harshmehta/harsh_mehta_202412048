require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('./generated/mongo');
const app = express();
app.use(express.json());
const cors = require('cors');


const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL  // This will be your deployed Vercel URL
];
app.use(cors({
    origin: (origin, callback) => {
        
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

const prisma_mongo = new PrismaClient();
async function testMongoConnection() {
  try {
    await prisma_mongo.$connect();
    console.log('Mongo connected successfully');
  } catch (error) {
    console.error('Mongo connection failed:', error);
    process.exit(1);
  }
}

testMongoConnection().then(() => {
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/product');
  const orderRoutes = require('./routes/order');


  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "Server is running",
      timestamp: new Date().toISOString()
    });
  });

  const PORT = process.env.PORT || 9000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});