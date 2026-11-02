import { getPublicCatalog } from "../server/github-catalog/service.mjs";

export default async function handler(request, response) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }
  try {
    const result = await getPublicCatalog();
    response.setHeader("Cache-Control", `public, max-age=0, s-maxage=${result.stale ? 15 : 60}`);
    return response.status(200).json(result);
  } catch {
    return response.status(503).json({ error: "Public projects are temporarily unavailable" });
  }
}
