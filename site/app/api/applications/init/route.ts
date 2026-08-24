export const runtime = "edge";

export async function POST() {
  const id = `GA-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  return Response.json({ id });
}
