/** More than any write needs: `{ "by": -1 }` is a dozen bytes. */
export const MAX_BODY_BYTES = 1024;

/**
 * The request body parsed as JSON, or null if it isn't JSON or is longer than
 * `maxBytes`. Reading stops at the limit; `request.json()` would hold a body
 * of any size in memory first, and nothing in front of the app caps it.
 */
export async function readJson(
  request: Request,
  maxBytes = MAX_BODY_BYTES,
): Promise<unknown> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}
