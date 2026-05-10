export function extractJsonObject(text: string): Record<string, any> {
  if (!text) return {};

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    return {};
  }

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return {};
  }
}
