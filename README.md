# Vision AI Studio

Gemini Vision powered image analysis web app. Upload an image, add an optional prompt, and get detailed analysis from Google Gemini.

## Features

- Gemini Vision API integration
- 15 specialized AI modes
- Multi-image upload with preview
- OCR and document analysis
- Product, ad, and creative audit
- Social media caption and hashtag ideas
- Quality, compliance, and visual issue checks
- Multi-image comparison
- Roadmap extraction from visual notes
- Video frame-by-frame analysis
- Real-time webcam workflow planning
- Custom model fine-tuning planning
- React Native mobile app planning
- Zapier / Make.com integration planning
- White-label reseller portal planning
- Language and audience controls
- Copy and download report actions
- Express backend API
- Render deployment ready

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

3. Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

4. Start the app:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Get Gemini API key

Create an API key from Google AI Studio:

```text
https://aistudio.google.com/app/apikey
```

## Render deployment

### Option 1: Blueprint deploy

1. Push this project to GitHub.
2. Open Render dashboard.
3. Choose `New +` -> `Blueprint`.
4. Connect your GitHub repository.
5. Render will read `render.yaml` automatically.
6. Add environment variable:

```text
GEMINI_API_KEY=your_gemini_api_key_here
```

7. Deploy.

### Option 2: Web service deploy

1. Push this project to GitHub.
2. Open Render dashboard.
3. Choose `New +` -> `Web Service`.
4. Select your repository.
5. Use these settings:

```text
Environment: Node
Build Command: npm install
Start Command: npm start
```

6. Add environment variable:

```text
GEMINI_API_KEY=your_gemini_api_key_here
```

7. Deploy.

## API endpoint

```text
POST /api/analyze
```

Form data:

- `images`: image files, up to 5
- `feature`: `full`, `ocr`, `document`, `product`, `creative`, `social`, `quality`, `comparison`, `roadmap`, `video`, `webcam`, `finetune`, `mobile`, `automation`, or `whitelabel`
- `language`: response language
- `audience`: target audience
- `prompt`: optional custom prompt
