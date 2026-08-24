import { cookies } from "next/headers";

const COOKIE_NAME = "gamcheon_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}
function textToBase64Url(value: string) { return bytesToBase64Url(new TextEncoder().encode(value)); }
function base64UrlToText(value: string) {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
    return new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)));
  } catch { return ""; }
}
async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET || ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function sha256Hex(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return different === 0;
}

export async function verifyAdminCredentials(username: string, password: string) {
  return safeEqual(username, process.env.ADMIN_USERNAME || "") && safeEqual(await sha256Hex(password), process.env.ADMIN_PASSWORD_HASH || "");
}
export async function createAdminSession(username: string) {
  const payload = textToBase64Url(JSON.stringify({ username, expires: Math.floor(Date.now() / 1000) + SESSION_SECONDS }));
  return `${payload}.${await sign(payload)}`;
}
export async function requireAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value || "";
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !process.env.ADMIN_SESSION_SECRET || !safeEqual(await sign(payload), signature)) return null;
  try {
    const data = JSON.parse(base64UrlToText(payload)) as { username?: string; expires?: number };
    if (data.username !== process.env.ADMIN_USERNAME || !data.expires || data.expires < Date.now() / 1000) return null;
    return { username: data.username };
  } catch { return null; }
}
export const adminCookie = { name: COOKIE_NAME, maxAge: SESSION_SECONDS };
