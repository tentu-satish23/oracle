import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes     from './routes/auth.js';
import problemsRoutes from './routes/problems.js';
import executeRoutes  from './routes/execute.js';
import coursesRoutes  from './routes/courses.js';
import paymentsRoutes from './routes/payments.js';
import contestsRoutes from './routes/contests.js';
import profileRoutes  from './routes/profile.js';
import { detectJdk }    from './services/javaRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load .env from the server directory (works regardless of CWD)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Auto-configure JAVA_HOME for Windows environments if not already defined
if (!process.env.JAVA_HOME && process.platform === 'win32') {
  const defaultWinJdk = 'C:\\Program Files\\Java\\jdk-17.0.20.1';
  if (fs.existsSync(defaultWinJdk)) {
    process.env.JAVA_HOME = defaultWinJdk;
    const jdkBin = path.join(defaultWinJdk, 'bin');
    if (!process.env.PATH.includes(jdkBin)) {
      process.env.PATH = `${jdkBin}${path.delimiter}${process.env.PATH}`;
    }
  }
}

const clientDist = path.resolve(__dirname, '../../client/dist');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-razorpay-signature']
}));

// ── Razorpay Webhook: MUST come before express.json() to receive raw body ─────
app.post('/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Delegate to the payments router's webhook handler
    req.url = '/webhook';
    paymentsRoutes(req, res, next);
  }
);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ONLINE',
    platform:  "OOP'S ORACLE",
    tagline:   'Master Java. Master Logic. Build Your Future.',
    razorpay:  process.env.RAZORPAY_KEY_ID || 'simulation',
    version:   '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/execute',  executeRoutes);
app.use('/api/courses',  coursesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/profile',  profileRoutes);

// ── Static Files (Production Build) ──────────────────────────────────────────
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── 404 for unknown API routes ────────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, async () => {
  const jdkInfo = await detectJdk();
  console.log(`\n======================================================`);
  console.log(`☕  OOP'S ORACLE Backend API Engine — v2.0`);
  console.log(`🚀  Server listening on port ${PORT}`);
  console.log(`⚙️  Java 17 Compiler: ${jdkInfo.javac}`);
  console.log(`☕  Java 17 Runtime:  ${jdkInfo.java}`);
  console.log(`💳  Razorpay: ${process.env.RAZORPAY_KEY_ID || 'simulation mode'}`);
  console.log(`🎯  Master Java. Master Logic. Build Your Future.`);
  console.log(`======================================================\n`);
});
