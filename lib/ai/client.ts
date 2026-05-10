type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequest = {
  model?: string;
  max_tokens?: number;
  system?: string;
  messages: ChatMessage[];
  stream?: boolean;
};

type StreamChunk = {
  type: 'content_block_delta';
  delta: {
    type: 'text_delta';
    text: string;
  };
};

const hfApiKey = process.env.HF_API_KEY;
const hfBaseUrl = (process.env.HF_INFERENCE_URL || 'https://router.huggingface.co/v1').replace(/\/+$/, '');
const hfModelId = process.env.HF_MODEL_ID || process.env.HF_QWEN_MODEL_ID;

const hasHfConfig = Boolean(hfApiKey && hfModelId);

const buildMessages = (system: string | undefined, messages: ChatMessage[]) => {
  const base = system ? [{ role: 'system' as const, content: system }] : [];
  return [...base, ...messages];
};

const getChatText = (payload: any) => {
  const choiceText = payload?.choices?.[0]?.message?.content;
  if (typeof choiceText === 'string') return choiceText;
  const generatedText = payload?.generated_text;
  return typeof generatedText === 'string' ? generatedText : '';
};

const createChatCompletion = async (request: ChatRequest) => {
  const response = await fetch(`${hfBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: request.model || hfModelId,
      max_tokens: request.max_tokens,
      messages: buildMessages(request.system, request.messages),
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF chat completion failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return {
    content: [{ type: 'text' as const, text: getChatText(payload) }]
  };
};

const streamChatCompletion = async function* (request: ChatRequest): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${hfBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: request.model || hfModelId,
      max_tokens: request.max_tokens,
      messages: buildMessages(request.system, request.messages),
      stream: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF stream failed: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error('HF stream failed: no response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      let payload: any;
      try {
        payload = JSON.parse(data);
      } catch {
        continue;
      }

      const deltaText = payload?.choices?.[0]?.delta?.content;
      if (typeof deltaText === 'string' && deltaText.length > 0) {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: deltaText }
        };
      }
    }
  }
};

export const aiClient = hasHfConfig
  ? {
      messages: {
        create: async (request: ChatRequest) => {
          if (request.stream) return streamChatCompletion(request);
          return createChatCompletion(request);
        }
      }
    }
  : null;
