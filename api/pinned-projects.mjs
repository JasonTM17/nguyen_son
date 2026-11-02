import { getPinnedProjects } from "../server/github-pins/service.mjs";

export default async function handler(request, response) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.setHeader("Cache-Control", "no-store");
    return response.status(405).json({ error: "Method not allowed" });
  }
  try {
    const result = await getPinnedProjects();
    response.setHeader("Cache-Control", `public, max-age=0, s-maxage=${result.stale ? 15 : 60}`);
    return response.status(200).json(result);
  } catch {
    response.setHeader("Cache-Control", "no-store");
    return response.status(503).json({ error: "Pinned projects are temporarily unavailable" });
  }
}
