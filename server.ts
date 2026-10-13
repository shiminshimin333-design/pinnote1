import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Explanation endpoint: "explain the stuff u cant understand"
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { content, title, mode = 'eli5', customQuestion } = req.body;

    if (!content && !customQuestion) {
      return res.status(400).json({ error: 'Content or question is required for explanation.' });
    }

    let instruction = `You are a warm, brilliant, aesthetic study companion and educator for a Pinterest-style visual notebook app. 
Your mission: Break down complex, confusing, or dense concepts into deeply intuitive, delightful, and crystal-clear explanations.
Use engaging formatting (emojis, markdown headers, bold keywords, short digestible paragraphs, bullet points).
Tone: Encouraging, cozy, insightful, and clear.`;

    let userPrompt = '';
    if (mode === 'eli5') {
      userPrompt = `Please explain this concept simply (Like I'm 5 / beginner friendly) with an intuitive real-world analogy:
${title ? `Topic/Title: "${title}"\n` : ''}
Content to understand:
"""${content || ''}"""
${customQuestion ? `Specific question: "${customQuestion}"` : ''}

Structure:
1. 💡 The Quick Idea in 1 Sentence
2. 🥐 A Cute / Real-world Analogy
3. 🔍 How It Actually Works (3 simple steps or bullets)
4. ✨ Why This Is Cool / Why It Matters`;
    } else if (mode === 'deep-dive') {
      userPrompt = `Please give me a thorough breakdown of this topic:
${title ? `Topic/Title: "${title}"\n` : ''}
Content:
"""${content || ''}"""
${customQuestion ? `Question: "${customQuestion}"` : ''}

Structure:
1. 🧠 Core Mental Model & Fundamentals
2. ⚙️ Step-by-Step Breakdown
3. ⚠️ Common Misconceptions & Pitfalls to avoid
4. 🔗 Practical Example or Connection to other concepts`;
    } else if (mode === 'quiz') {
      userPrompt = `Create 3 interactive mini-quiz questions to test understanding of this concept, followed by hidden explanations/answers:
${title ? `Topic: "${title}"\n` : ''}
Content:
"""${content || ''}"""

Provide 3 fun questions with multiple choice or thought prompts and concise answer reveals.`;
    } else if (mode === 'bullet-summary') {
      userPrompt = `Summarize the following into aesthetic, high-yield study note bullet points:
${title ? `Topic: "${title}"\n` : ''}
Content:
"""${content || ''}"""

Format as aesthetic study notes with bold key terms and emoji markers.`;
    } else {
      userPrompt = `Answer this question about the note content:
${title ? `Topic: "${title}"\n` : ''}
Content:
"""${content || ''}"""
Question: "${customQuestion}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
      },
    });

    const explanation = response.text || 'No explanation generated.';
    res.json({ explanation });
  } catch (error: any) {
    console.error('Gemini explanation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate explanation with AI.',
    });
  }
});

// AI Chat endpoint for conversational clarification
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, boardContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemInstruction = `You are "PinAI", the friendly, super-smart Pinterest Notebook AI companion.
You help the user brainstorm, understand hard concepts, summarize notes, refine ideas, and create aesthetic study cards.
Keep responses concise, aesthetically formatted with emojis and bullets when helpful, and easy to read.
${boardContext ? `Current Board Context: ${boardContext}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ error: error?.message || 'AI Chat error' });
  }
});

// AI Generate Aesthetic Note Ideas & Tags
app.post('/api/ai/inspire', async (req: Request, res: Response) => {
  try {
    const { theme } = req.body;
    const prompt = `Give 4 creative, aesthetic note concepts and sticky ideas for a moodboard themed around "${theme || 'daily inspiration'}".
Return a JSON array of objects with keys: "title", "color" (one of: "#FEF08A", "#BBF7D0", "#FECDD3", "#BFDBFE", "#E9D5FF", "#FED7AA"), "content", "tags" (array of 2 strings).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    res.json({ ideas: JSON.parse(text) });
  } catch (error: any) {
    console.error('AI Inspire error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate ideas' });
  }
});

// Web URL metadata / preview fetcher
app.post('/api/web/preview', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Direct image check
    const isImage = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(parsedUrl.pathname);
    if (isImage) {
      return res.json({
        title: parsedUrl.pathname.split('/').pop() || 'Web Image',
        image: parsedUrl.href,
        url: parsedUrl.href,
        domain: parsedUrl.hostname,
        description: 'Image clipped from web',
      });
    }

    // Try fetching HTML for og:image and title
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html',
        },
      });
      clearTimeout(timeout);

      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

      const title = ogTitleMatch?.[1] || titleMatch?.[1] || parsedUrl.hostname;
      let image = ogImageMatch?.[1];
      if (image && !image.startsWith('http')) {
        image = new URL(image, parsedUrl.origin).href;
      }
      const description = ogDescMatch?.[1] || '';

      return res.json({
        title: title.trim(),
        image: image || null,
        url: parsedUrl.href,
        domain: parsedUrl.hostname,
        description: description.trim(),
      });
    } catch {
      // Fallback if scraping blocked
      return res.json({
        title: parsedUrl.hostname,
        image: null,
        url: parsedUrl.href,
        domain: parsedUrl.hostname,
        description: parsedUrl.href,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch preview' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PinNotes Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
