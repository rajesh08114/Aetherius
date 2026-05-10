type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequest<TStream extends boolean | undefined = boolean | undefined> = {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  system?: string;
  messages: ChatMessage[];
  stream?: TStream;
};

type StreamChunk = {
  type: 'content_block_delta';
  delta: {
    type: 'text_delta';
    text: string;
  };
};

type ChatResponse<TStream extends boolean | undefined> = TStream extends true
  ? AsyncGenerator<StreamChunk>
  : { content: { type: 'text'; text: string }[] };

const hfApiKey = process.env.HF_API_KEY;
const hfBaseUrl = (process.env.HF_INFERENCE_URL || 'https://router.huggingface.co/v1').replace(/\/+$/, '');
const hfModelId = process.env.HF_MODEL_ID || process.env.HF_QWEN_MODEL_ID;
const hfFallbackModelsRaw = process.env.HF_MODEL_FALLBACKS || '';
const hfFallbackModels = hfFallbackModelsRaw
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const defaultModelCandidates = Array.from(
  new Set([hfModelId, ...hfFallbackModels].filter((m): m is string => Boolean(m)))
);

const hasHfConfig = Boolean(hfApiKey && defaultModelCandidates.length > 0);

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

const resolveModelCandidates = (requestModel?: string) => {
  if (!requestModel) return defaultModelCandidates;
  return Array.from(new Set([requestModel, ...defaultModelCandidates]));
};

const createChatCompletionForModel = async (request: ChatRequest, model: string) => {
  const response = await fetch(`${hfBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      top_p: request.top_p,
      frequency_penalty: request.frequency_penalty,
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

const createChatCompletion = async (request: ChatRequest) => {
  const models = resolveModelCandidates(request.model);
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await createChatCompletionForModel(request, model);
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error('HF chat completion failed: no model succeeded');
};

const streamChatCompletionForModel = async function* (request: ChatRequest<true>, model: string): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${hfBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      top_p: request.top_p,
      frequency_penalty: request.frequency_penalty,
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

const streamChatCompletion = async function* (request: ChatRequest<true>): AsyncGenerator<StreamChunk> {
  const models = resolveModelCandidates(request.model);
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      let emittedAnyChunk = false;
      for await (const chunk of streamChatCompletionForModel(request, model)) {
        emittedAnyChunk = true;
        yield chunk;
      }

      if (!emittedAnyChunk) {
        continue;
      }

      return;
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error('HF stream failed: no model succeeded');
};

const createMessage = async <TStream extends boolean | undefined>(
  request: ChatRequest<TStream>
): Promise<ChatResponse<TStream>> => {
  if (request.stream) {
    return streamChatCompletion(request as ChatRequest<true>) as ChatResponse<TStream>;
  }
  return (createChatCompletion(request) as unknown) as ChatResponse<TStream>;
};

export const aiClient = hasHfConfig
  ? {
      messages: {
        create: createMessage
      }
    }
  : null;
