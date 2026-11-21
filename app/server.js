const express = require('express');
const { MongoClient } = require('mongodb');
const os = require('os');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/emidb';
const HOSTNAME = process.env.HOSTNAME || os.hostname();

let db, calculations;

async function connectMongo() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db('emidb');
  calculations = db.collection('calculations');
  console.log('✅ Connected to MongoDB at:', MONGO_URL);
}

function calcEMI(P, annualRate, n) {
  const r = annualRate / 12 / 100;
  if (r === 0) return P / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

// POST /api/emi
app.post('/api/emi', async (req, res) => {
  try {
    const { principal, rate, months } = req.body;
    const P = Number(principal), R = Number(rate), N = Number(months);
    if (!P || !R || !N || P <= 0 || R <= 0 || N <= 0) {
      return res.status(400).json({ error: 'All inputs must be positive numbers' });
    }
    const emi = calcEMI(P, R, N);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    const doc = {
      principal: P,
      rate: R,
      months: N,
      emi: +emi.toFixed(2),
      totalPayment: +totalPayment.toFixed(2),
      totalInterest: +totalInterest.toFixed(2),
      servedBy: HOSTNAME,
      createdAt: new Date()
    };
    await calculations.insertOne(doc);

    res.json({
      emi: doc.emi,
      totalPayment: doc.totalPayment,
      totalInterest: doc.totalInterest,
      servedBy: HOSTNAME
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/history
app.get('/api/history', async (req, res) => {
  try {
    const docs = await calculations.find().sort({ createdAt: -1 }).limit(10).toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /health
app.get('/health', async (req, res) => {
  try {
    await db.command({ ping: 1 });
    res.status(200).send('OK');
  } catch (e) {
    res.status(503).send('MongoDB unreachable');
  }
});

const PORT = process.env.PORT || 3000;
connectMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}, pod=${HOSTNAME}`));
  })
  .catch(err => {
    console.error('❌ Mongo connection failed:', err);
    process.exit(1);
  });
