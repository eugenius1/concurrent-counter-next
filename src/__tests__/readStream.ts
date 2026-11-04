/** Reads an event stream response one chunk at a time; null once it ends. */
export function readStream(response: Response) {
  const decoder = new TextDecoder();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  return async () => {
    // Taken on first read: a refused request has no body to read
    reader ??= response.body!.getReader();
    const { value, done } = await reader.read();
    return done ? null : decoder.decode(value);
  };
}

/** One event as the server writes it. */
export const sseFrame = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
