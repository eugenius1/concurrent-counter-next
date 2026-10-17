/** @jest-environment node */
import { MAX_BODY_BYTES, readJson } from "./readJson";

const post = (body?: string) =>
  new Request("http://localhost/", { method: "POST", body });

describe("readJson", () => {
  it("parses a JSON body", async () => {
    expect(await readJson(post('{"by":1}'))).toEqual({ by: 1 });
  });

  it.each([[undefined], [""], ["not json"]])(
    "gives null for the body %j",
    async (body) => {
      expect(await readJson(post(body))).toBeNull();
    },
  );

  it("gives null for a body past the limit, without reading all of it", async () => {
    const body = JSON.stringify({ by: 1, padding: "x".repeat(MAX_BODY_BYTES) });

    expect(await readJson(post(body))).toBeNull();
  });

  it("stops reading a streamed body at the limit", async () => {
    let pulls = 0;
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls++;
        controller.enqueue(new Uint8Array(256).fill(32));
      },
    });
    const request = new Request("http://localhost/", {
      method: "POST",
      body: endless,
      duplex: "half",
    } as RequestInit);

    expect(await readJson(request)).toBeNull();
    expect(pulls).toBeLessThan(10);
  });
});
