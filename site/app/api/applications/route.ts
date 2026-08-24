import { env } from "cloudflare:workers";

export const runtime = "edge";

type Payload = {
  values?: Record<string, string | boolean>;
  categories?: string[];
  works?: Array<{ id?: string; title?: string; status?: string; description?: string }>;
  expectedImages?: { profile?: boolean; works?: boolean[] };
};

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeFileName(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  return `${crypto.randomUUID()}.${ext.slice(0, 8)}`;
}

export async function POST(request: Request) {
  const uploaded: string[] = [];
  try {
    const form = await request.formData();
    const raw = form.get("payload");
    if (typeof raw !== "string" || raw.length > 150_000) return Response.json({ error: "신청서 내용이 너무 큽니다." }, { status: 400 });
    const payload = JSON.parse(raw) as Payload;
    const values = payload.values || {};
    const artistName = cleanText(values.artistName, 100);
    const phone = cleanText(values.phone, 30);
    const email = cleanText(values.email, 150);
    const categories = Array.isArray(payload.categories) ? payload.categories.slice(0, 12).map((x) => cleanText(x, 30)).filter(Boolean) : [];
    const works = Array.isArray(payload.works) ? payload.works.slice(0, 5).map((w) => ({ id: cleanText(w.id, 80), title: cleanText(w.title, 150), status: cleanText(w.status, 40), description: cleanText(w.description, 1200) })) : [];
    if (!artistName || !phone || !categories.length || !works[0]?.title) return Response.json({ error: "필수 신청 정보를 다시 확인해주세요." }, { status: 400 });
    if (!values.consentInfo || !values.consentImage || !values.consentPrivacy) return Response.json({ error: "필수 동의가 필요합니다." }, { status: 400 });

    const id = `GA-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const imageRecords: Array<{ type: string; workIndex?: number; key: string; name: string; contentType: string }> = [];
    const candidates: Array<{ key: string; type: string; workIndex?: number }> = [{ key: "profileImage", type: "profile" }, ...works.map((_, i) => ({ key: `workImage${i}`, type: "work", workIndex: i }))];
    for (const candidate of candidates) {
      const item = form.get(candidate.key);
      if (!item || typeof item === "string" || typeof item.size !== "number" || !item.size) continue;
      if (!item.type.startsWith("image/") || item.size > 2 * 1024 * 1024) return Response.json({ error: "이미지는 장당 2MB 이하로 올려주세요." }, { status: 400 });
      const key = `applications/${id}/${safeFileName(item)}`;
      await env.BUCKET.put(key, item.stream(), { httpMetadata: { contentType: item.type }, customMetadata: { applicationId: id, originalName: item.name.slice(0, 180) } });
      uploaded.push(key);
      imageRecords.push({ type: candidate.type, workIndex: candidate.workIndex, key, name: item.name.slice(0, 180), contentType: item.type });
    }

    const expectedCount = (payload.expectedImages?.profile ? 1 : 0) + (payload.expectedImages?.works || []).filter(Boolean).length;
    if (expectedCount !== imageRecords.length) {
      await Promise.allSettled(uploaded.map((key) => env.BUCKET.delete(key)));
      uploaded.length = 0;
      return Response.json({ error: "선택한 사진이 모두 저장되지 않았습니다. 사진을 다시 선택해주세요." }, { status: 400 });
    }

    const safePayload = { values: { ...values, artistName, phone, email }, categories, works };
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS artist_applications (
      id TEXT PRIMARY KEY,
      artist_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'received',
      payload_json TEXT NOT NULL,
      image_keys_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    await env.DB.prepare("INSERT INTO artist_applications (id, artist_name, phone, email, status, payload_json, image_keys_json) VALUES (?, ?, ?, ?, 'received', ?, ?)")
      .bind(id, artistName, phone, email, JSON.stringify(safePayload), JSON.stringify(imageRecords)).run();
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    await Promise.allSettled(uploaded.map((key) => env.BUCKET.delete(key)));
    console.error("application submission failed", error);
    return Response.json({ error: "접수가 완료되지 않았습니다. 잠시 뒤 다시 시도해주세요." }, { status: 500 });
  }
}
