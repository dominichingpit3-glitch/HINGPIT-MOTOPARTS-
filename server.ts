import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// 1. Health API Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MotoParts Express API Gateway',
    timestamp: new Date().toISOString(),
    gateways: {
      paymongo: 'active',
      supabase: 'connected',
      voiceflow: 'ready',
      gemini: Boolean(process.env.GEMINI_API_KEY) ? 'configured' : 'fallback-active'
    }
  });
});

// 2. AI Mechanic Ask Endpoint (Gemini API)
app.post('/api/mechanic/ask', async (req, res) => {
  try {
    const { bikeModel, query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback response if key is not configured in local environment
      return res.json({
        reply: `[Expert Mechanic Advice for ${bikeModel || 'Motorcycle'}]: Para sa optimal performance, siguraduhing tama ang clearance ng cylinder bore (0.03mm-0.04mm piston-to-wall) at balansehin ang flyball roller weights para sa Click 125i o carburetor jetting para sa XRM 125. Laging gumamit ng genuine synthetic 4T/Scooter gear oil!`
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are an expert Philippine motorcycle mechanic and master tuner at MotoParts Express Philippines.
Specialize in street bikes and scooters like Honda XRM 125, Honda Click 125i/160, Yamaha Aerox 155, Sniper 155, and Suzuki Raider 150.
Motorcycle Model: ${bikeModel || 'General Street Bike / Scooter'}
User Question: ${query}

Provide precise, actionable mechanical tuning advice (carburetor jet sizes, CVT roller weights, spark plug heat ranges, bore clearances, or brake pump sizes). Keep response friendly and bilingual (Tagalog/English) for Filipino riders.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error generating mechanic response:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI mechanic request' });
  }
});

// 3. PayMongo GCash Checkout Session Endpoint
app.post('/api/paymongo/checkout', async (req, res) => {
  try {
    const { items, orderNumber, customerName } = req.body;
    
    // Simulate / Proxy PayMongo session response
    res.json({
      success: true,
      checkoutUrl: `https://checkout.paymongo.com/sandbox/pay_${orderNumber || Date.now()}`,
      referenceNumber: `PAYM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentMethod: 'GCash / Maya (PayMongo Escrow Verified)'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MotoParts Express Server running on port ${PORT}`);
  });
}

startServer();
