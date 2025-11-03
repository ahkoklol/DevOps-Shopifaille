// HMAC SHA256 signature service for webhook requests.
export class SignatureService {
  // Builds header: X-Webhook-Signature: t=<ts>, v1=<hex>
  async buildSignatureHeader(secret: string, body: string, ts: number): Promise<string> {
    const raw = new TextEncoder().encode(`${ts}.${body}`);
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, raw);
    const hex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");
    return `t=${ts}, v1=${hex}`;
  }

  // Validates against one or two secrets (during grace period).
  async validate(header: string | null, body: string, secrets: string[]) {
    if (!header) return false;
    const parts = Object.fromEntries(
      header.split(",").map(x => x.trim().split("=").map(s => s.trim()))
    ) as unknown as { t: string; v1: string };

    const ts = Number(parts["t"]);
    const v1 = String(parts["v1"]);
    if (!ts || !v1) return false;

    // Replay window: 5 minutes tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - ts) > 300) return false;

    for (const secret of secrets) {
      const h = await this.buildSignatureHeader(secret, body, ts);
      const expect = h.split("v1=")[1];
      if (expect === v1) return true;
    }
    return false;
  }
}
