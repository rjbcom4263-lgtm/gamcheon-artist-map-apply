import { env } from "cloudflare:workers";

export const runtime = "edge";

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeFileName(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  return `${crypto.randomUUID()}.${ext.slice(0, 8)}`;
}

function validApplicationId(value: unknown) {
  return typeof value === "string" && /^GA-\d{8}-[A-F0-9]{6}$/.test(value);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const applicationId = cleanText(form.get("applicationId"), 40);
    const type = cleanText(form.get("type"), 20);
    const workIndex = Number(form.get("workIndex"));
    const image = form.get("image");
    if (!validApplicationId(applicationId)) return Response.json({ error: "신청 번호를 다시 확인해주세요." }, { status: 400 });
    if (type !== "profile" && type !== "work") return Response.json({ error: "이미지 구분을 다시 확인해주세요." }, { status: 400 });
    if (type === "work" && (!Number.isInteger(workIndex) || workIndex < 0 || workIndex > 4)) return Response.json({ error: "작품 이미지 번호를 다시 확인해주세요." }, { status: 400 });
    if (!image || typeof image === "string" || typeof image.size !== "number" || !image.size) return Response.json({ error: "이미지 파일을 선택해주세요." }, { status: 400 });
    if (!image.type.startsWith("image/") || image.size > 2 * 1024 * 1024) return Response.json({ error: "이미지는 장당 2MB 이하로 올려주세요." }, { status: 400 });

    const key = `applications/${applicationId}/${safeFileName(image)}`;
    await env.BUCKET.put(key, image.stream(), { httpMetadata: { contentType: image.type }, customMetadata: { applicationId, originalName: image.name.slice(0, 180) } });
    return Response.json({
      image: {
        type,
        workIndex: type === "work" ? workIndex : undefined,
        key,
        name: image.name.slice(0, 180),
        contentType: image.type,
      },
    });
  } catch (error) {
    console.error("application image upload failed", error);
    return Response.json({ error: "이미지를 저장하지 못했습니다. 잠시 뒤 다시 시도해주세요." }, { status: 500 });
  }
}
