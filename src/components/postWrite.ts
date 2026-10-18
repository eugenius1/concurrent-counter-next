/**
 * Sends one of the app's two writes. Resolves to the response on success, or
 * to why it failed, which each caller turns into its own message.
 */
export async function postWrite(
  url: string,
  body?: unknown,
): Promise<Response | "rateLimited" | "failed"> {
  let response: Response | undefined;
  try {
    response = await fetch(url, {
      method: "POST",
      ...(body !== undefined && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    });
    if (response.ok) return response;
    throw new Error(`Request failed with status ${response.status}`);
  } catch (error) {
    console.error(`Error posting to ${url}:`, error);
    return response?.status === 429 ? "rateLimited" : "failed";
  }
}
