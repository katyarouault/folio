// Supabase Edge Function: revoke-apple
//
// When someone who signed in with Apple deletes their Folio account, Apple
// requires the app to revoke its Sign in with Apple tokens. The app gets a
// fresh one-time authorization code from Apple and posts it here; this
// function swaps it for a refresh token and revokes that token with Apple.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   APPLE_TEAM_ID      your Apple Developer team ID (10 characters)
//   APPLE_KEY_ID       the Key ID of your "Sign in with Apple" key
//   APPLE_PRIVATE_KEY  the full contents of that key's .p8 file
//   APPLE_CLIENT_ID    the app's bundle ID: com.folionotes.app
//
// Only signed-in users can call it (Supabase checks their login token).
import { importPKCS8, SignJWT } from "npm:jose@5.9.6";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function clientSecret(teamId: string, keyId: string, clientId: string, pem: string) {
  const key = await importPKCS8(pem.replace(/\\n/g, "\n").trim(), "ES256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .setAudience("https://appleid.apple.com")
    .setSubject(clientId)
    .sign(key);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const teamId = Deno.env.get("APPLE_TEAM_ID");
  const keyId = Deno.env.get("APPLE_KEY_ID");
  const pem = Deno.env.get("APPLE_PRIVATE_KEY");
  const clientId = Deno.env.get("APPLE_CLIENT_ID") ?? "com.folionotes.app";
  if (!teamId || !keyId || !pem) return json(500, { error: "not_configured" });

  let code = "";
  try { code = String((await req.json())?.code ?? ""); } catch { /* bad body */ }
  if (!code) return json(400, { error: "missing_code" });

  try {
    const secret = await clientSecret(teamId, keyId, clientId, pem);

    // 1. Swap the one-time code for a refresh token.
    const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: secret, code, grant_type: "authorization_code" }),
    });
    const tokens = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok) return json(502, { error: "apple_token_failed", detail: tokens?.error ?? tokenRes.status });

    // 2. Revoke it (fall back to the access token if Apple sent no refresh token).
    const token = tokens.refresh_token ?? tokens.access_token;
    const hint = tokens.refresh_token ? "refresh_token" : "access_token";
    const revokeRes = await fetch("https://appleid.apple.com/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: secret, token, token_type_hint: hint }),
    });
    if (!revokeRes.ok) return json(502, { error: "apple_revoke_failed", detail: revokeRes.status });

    return json(200, { revoked: true });
  } catch (e) {
    return json(500, { error: "unexpected", detail: String((e as Error)?.message ?? e).slice(0, 200) });
  }
});
