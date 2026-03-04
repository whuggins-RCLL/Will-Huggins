import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, intro, body, callout, cta } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a content formatter for a law school library website.
      Read the following content fields and return a single HTML snippet.
      
      Title: ${title}
      Intro: ${intro}
      Body: ${body}
      Callout: ${callout}
      CTA: ${cta}

      RULES:
      1. Return ONLY valid HTML. No markdown fences, no explanations.
      2. Use ONLY these tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>, <div>, <span>.
      3. Wrap everything in a <div id="content-wrapper">.
      4. Do NOT use any classes or <style> tags. Use inline styles ONLY if absolutely necessary for layout, but prefer semantic HTML.
      5. Format the Callout (if present) as a <div> with a distinct border style.
      6. Format the CTA (if present) as an <a> tag styled to look like a button.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up markdown fences if present
    text = text.replace(/```html/g, '').replace(/```/g, '');

    res.status(200).json({ html: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
}
