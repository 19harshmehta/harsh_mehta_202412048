require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('./generated/mongo'); // This import is now working!
const app = express();
app.use(express.json());
const cors = require('cors');

const frontendUrl = process.env.FRONTEND_URL;

const deployedFrontendUrl = 'https://ecommarce-test-app-frontend.vercel.app';

const allowedOrigins = [
  'http://localhost:3000',
  frontendUrl,
  deployedFrontendUrl 
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = `CORS ERROR: Origin ${origin} is not in the allowed list.`;
      console.error(msg); // Log the error to Vercel
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
};

app.options('*', cors(corsOptions));

app.use(cors(corsOptions));


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