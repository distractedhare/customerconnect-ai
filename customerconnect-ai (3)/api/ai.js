function readTextContent(value) {
  if (typeof value === 'string' && value.trim()) return value;

  if (Array.isArray(value)) {
    const joined = value
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          if (typeof entry.text === 'string') return entry.text;
          if (typeof entry.content === 'string') return entry.content;
        }
        return '';
      })
      .join('\n')
      .trim();

    return joined || null;
  }

  return null;
}

function extractContent(payload) {
  return (
    readTextContent(payload?.content)
    || readTextContent(payload?.choices?.[0]?.message?.content)
    || readTextContent(payload?.choices?.[0]?.text)
    || readTextContent(payload?.output_text)
    || readTextContent(payload?.response)
    || readTextContent(payload?.candidates?.[0]?.content?.parts)
  );
}

function isGeminiEndpoint(url) {
  return typeof url === 'string'
    && (
      url.includes('generativelanguage.googleapis.com')
      || /(?:^|\/)(generateContent|streamGenerateContent)(?:$|\?)/.test(url)
    );
}

function toGeminiRole(role) {
  if (role === 'assistant') return 'model';
  return 'user';
}

function buildGeminiPayload(model, messages, temperature) {
  const systemText = messages
    .filter((message) => message?.role === 'system' && typeof message?.content === 'string')
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join('\n\n');

  const contents = messages
    .filter((message) => message?.role !== 'system' && typeof message?.content === 'string')
    .map((message) => ({
      role: toGeminiRole(message.role),
      parts: [{ text: message.content }],
    }));

  const payload = {
    contents,
    generationConfig: {
      temperature,
    },
  };

  if (systemText) {
    payload.systemInstruction = {
      parts: [{ text: systemText }],
    };
  }

  // Some Gemini endpoints encode the model in the URL, but others may expect it in-body.
  if (model) {
    payload.model = model;
  }

  return payload;
}

function buildOpenAIPayload(model, messages, temperature) {
  return {
    model,
    messages,
    temperature,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    const configured = Boolean(process.env.AI_COMPLETIONS_URL && process.env.AI_MODEL);
    return res.status(200).json({
      ok: configured,
      configured,
      mode: configured ? 'remote-ai' : 'local-only',
      model: configured ? process.env.AI_MODEL : null,
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const completionsUrl = process.env.AI_COMPLETIONS_URL;
  const model = process.env.AI_MODEL;
  const apiKey = process.env.AI_API_KEY;
  const authHeader = process.env.AI_AUTH_HEADER || 'Authorization';
  const authPrefix = process.env.AI_AUTH_PREFIX || 'Bearer ';
  const authQueryParam = process.env.AI_AUTH_QUERY_PARAM;
  const extraHeaders = process.env.AI_EXTRA_HEADERS;

  if (!completionsUrl || !model) {
    return res.status(503).json({
      error: 'AI is not configured.',
      hint: 'Set AI_COMPLETIONS_URL and AI_MODEL to enable background enrichment.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.35;

  if (messages.length === 0) {
    return res.status(400).json({ error: 'No messages were provided.' });
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    if (authQueryParam) {
      const url = new URL(completionsUrl);
      url.searchParams.set(authQueryParam, apiKey);
      body._resolvedUrl = url.toString();
    } else {
      headers[authHeader] = `${authPrefix}${apiKey}`;
    }
  }

  if (extraHeaders) {
    try {
      Object.assign(headers, JSON.parse(extraHeaders));
    } catch {
      // Ignore malformed optional extra headers so the route still works.
    }
  }

  try {
    const url = body._resolvedUrl || completionsUrl;
    delete body._resolvedUrl;
    const upstreamPayload = isGeminiEndpoint(url)
      ? buildGeminiPayload(model, messages, temperature)
      : buildOpenAIPayload(model, messages, temperature);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamPayload),
    });

    const payload = await response.json().catch(() => ({}));
    const content = extractContent(payload);

    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || payload?.error || 'Upstream AI request failed.',
      });
    }

    if (typeof content !== 'string' || !content.trim()) {
      return res.status(502).json({ error: 'Upstream AI response was empty.' });
    }

    return res.status(200).json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected AI proxy error.';
    return res.status(500).json({ error: message });
  }
}
