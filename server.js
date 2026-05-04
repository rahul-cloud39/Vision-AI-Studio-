import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const geminiModelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b';
const getGeminiApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
  return key.trim().replace(/^["']|["']$/g, '');
};
const getGeminiKeyName = () => {
  if (process.env.GEMINI_API_KEY) return 'GEMINI_API_KEY';
  if (process.env.GOOGLE_API_KEY) return 'GOOGLE_API_KEY';
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return 'GOOGLE_GENERATIVE_AI_API_KEY';
  return null;
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

const featurePrompts = {
  full: 'Create a complete professional vision analysis report. Include executive summary, visible objects, scene description, OCR/text extraction, layout observations, quality assessment, risks, opportunities, and next actions.',
  ocr: 'Extract all readable text from the image. Preserve headings, tables, labels, numbers, and hierarchy. If text is unclear, mention uncertainty.',
  document: 'Analyze this document or screenshot. Identify title, sections, tables, key points, missing information, errors, and summarize it in a clean structured format.',
  product: 'Analyze this image as a product/business asset. Describe the product, audience, value proposition, strengths, weaknesses, positioning, and improvement ideas.',
  creative: 'Analyze this design, ad, poster, thumbnail, or creative. Review composition, colors, typography, visual hierarchy, CTA, brand clarity, conversion potential, and improvements.',
  social: 'Generate social media ready insights from this image. Include caption ideas, hashtags, hook lines, audience, platform suggestions, and content improvements.',
  quality: 'Perform a visual quality and compliance check. Identify blur, lighting, cropping, readability, inappropriate content risk, brand safety issues, and production fixes.',
  comparison: 'Compare all uploaded images. Identify similarities, differences, best version, weak points, and final recommendation.',
  roadmap: 'Turn the visible information into a product roadmap. Extract features, modules, architecture clues, deployment needs, monetization ideas, and future feature suggestions.',
  video: 'Analyze these uploaded video frames as a frame-by-frame video review. Identify scene progression, repeated objects, motion clues, quality issues, key moments, and recommendations for full video analysis.',
  webcam: 'Analyze this image as if it came from a real-time webcam workflow. Identify live-scene objects, safety/quality signals, monitoring use cases, alerts that should be triggered, and real-time automation ideas.',
  finetune: 'Analyze this image and create a custom model fine-tuning plan. Include dataset requirements, labels, annotation strategy, evaluation metrics, edge cases, and deployment approach.',
  mobile: 'Analyze this image and convert it into a React Native mobile app feature plan. Include mobile screens, user flow, camera/gallery usage, API calls, state handling, and release checklist.',
  automation: 'Analyze this image and design Zapier/Make.com automation workflows around it. Include triggers, actions, webhooks, payload fields, error handling, and practical business automations.',
  whitelabel: 'Analyze this image and create a white-label reseller portal plan. Include tenant management, branding controls, user roles, billing, usage limits, API key handling, and admin dashboard features.',
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  const geminiApiKey = getGeminiApiKey();

  res.json({
    ok: true,
    service: 'Vision AI Studio',
    geminiConfigured: Boolean(geminiApiKey),
    geminiKeyName: getGeminiKeyName(),
    geminiModel: geminiModelName,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/env-check', (req, res) => {
  const safeEnvKeys = Object.keys(process.env)
    .filter((key) => key.includes('GEMINI') || key.includes('GOOGLE') || key === 'PORT' || key === 'NODE_ENV')
    .sort();

  res.json({
    geminiConfigured: Boolean(getGeminiApiKey()),
    geminiKeyName: getGeminiKeyName(),
    safeEnvKeys,
  });
});

app.get('/api/features', (req, res) => {
  res.json({
    features: Object.keys(featurePrompts),
  });
});

app.post('/api/analyze', upload.array('images', 5), async (req, res) => {
  try {
    const geminiApiKey = getGeminiApiKey();

    if (!geminiApiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY in Render Environment Variables, save changes, then redeploy the service.',
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one image' });
    }

    const feature = req.body.feature || 'full';
    const language = req.body.language || 'English';
    const audience = req.body.audience || 'General';
    const userPrompt = req.body.prompt?.trim();
    const basePrompt = featurePrompts[feature] || featurePrompts.full;
    const prompt = [
      basePrompt,
      `Response language: ${language}.`,
      `Target audience: ${audience}.`,
      'Use clear headings, bullet points, and practical recommendations.',
      userPrompt ? `Additional user instruction: ${userPrompt}` : '',
    ].filter(Boolean).join('\n');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: geminiModelName });

    const result = await model.generateContent([
      prompt,
      ...req.files.map((file) => ({
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      })),
    ]);

    res.json({ analysis: result.response.text(), feature, imageCount: req.files.length });
  } catch (error) {
    const message = error.message || 'Image analysis failed';

    if (message.includes('429') || message.toLowerCase().includes('quota')) {
      return res.status(429).json({
        error: 'Gemini quota/rate limit exceeded. Wait for quota reset, enable billing in Google AI Studio, or use another API key/project with available quota.',
      });
    }

    res.status(500).json({ error: message });
  }
});

app.use((error, req, res, next) => {
  res.status(400).json({ error: error.message || 'Invalid request' });
});

app.listen(port, () => {
  console.log(`Vision AI Studio running on port ${port}`);
});
