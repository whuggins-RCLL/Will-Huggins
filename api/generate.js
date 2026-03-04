import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { 
    mode, 
    title, intro, body, videos, links, layout, callout, cta, // Mode: New
    existingHTML, instructions // Mode: Refine
  } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let prompt = "";

    if (mode === 'refine') {
      prompt = `
      You are an expert web developer.
      I have some existing HTML code that I need you to improve/refine based on my instructions.

      EXISTING HTML:
      ${existingHTML}

      INSTRUCTIONS:
      ${instructions}

      RULES:
      1. Return ONLY valid HTML code. No markdown, no backticks.
      2. Keep the existing content unless instructed to change it.
      3. Improve the structure and styling using Tailwind CSS classes if applicable, or inline styles if requested.
      4. Ensure the output is clean and ready to be embedded.
      5. Wrap everything in a <div id="content-wrapper">.
      `;
    } else {
      // Mode: New
      prompt = `
      You are a content formatter for a law school library website.
      Read the following content fields and return a single HTML snippet.
      
      Title: ${title}
      Intro: ${intro}
      Body: ${body}
      Video Embeds: ${videos} (Embed these YouTube/Vimeo links as iframes if provided)
      Important Links: ${links} (List these clearly)
      Layout Instructions: ${layout} (Follow these preferences if provided)
      Callout: ${callout}
      CTA: ${cta}

      RULES:
      1. Return ONLY valid HTML. No markdown fences, no explanations.
      2. Use semantic tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>, <div>, <span>, <iframe>, <blockquote>.
      3. Wrap everything in a <div id="content-wrapper">.
      4. If video links are provided, create responsive iframe embeds for them.
      5. If important links are provided, create a "Related Resources" or similar section.
      6. Format the Callout (if present) as a <blockquote> or <aside> with a distinct border style.
      7. Format the CTA (if present) as an <a> tag styled to look like a button.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text;
    
    // Clean up markdown fences if present
    if (text) {
      text = text.replace(/```html/g, '').replace(/```/g, '');
    }

    res.status(200).json({ html: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
}
