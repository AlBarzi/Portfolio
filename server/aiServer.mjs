import { createServer } from "node:http";
import { scanCoursePlanDirectory } from "./coursePlanScanner.mjs";

const PORT = Number(process.env.AI_SERVER_PORT || 8787);

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(payload));
};

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) {
    sendJson(response, 400, { ok: false, error: "invalid_request" });
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, { ok: true, service: "ai-server" });
    return;
  }

  if (request.method === "GET" && request.url === "/api/course-plans") {
    const payload = await scanCoursePlanDirectory();
    sendJson(response, 200, payload);
    return;
  }

  sendJson(response, 404, { ok: false, error: "not_found" });
});

server.listen(PORT, () => {
  console.log(`[ai-server] listening on http://localhost:${PORT}`);
});

