import http from "node:http";

const port = Number(process.env.PORT || 3000);
const hotmartUrl = "https://developers.hotmart.com/mcp/v1";
const secret = process.env.MCP_PATH_SECRET;
const hotmartToken = process.env.HOTMART_TOKEN;

if (!secret || !hotmartToken) {
  console.error("Missing MCP_PATH_SECRET or HOTMART_TOKEN");
  process.exit(1);
}

const protectedPath = `/mcp/${secret}`;

const server = http.createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }

  if (req.url !== protectedPath) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
    return;
  }

  try {
    const body = ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await new Promise((resolve, reject) => {
          const chunks = [];
          req.on("data", (chunk) => chunks.push(chunk));
          req.on("end", () => resolve(Buffer.concat(chunks)));
          req.on("error", reject);
        });

    const upstream = await fetch(hotmartUrl, {
      method: req.method,
      headers: {
        authorization: `Basic ${hotmartToken}`,
        accept: req.headers.accept || "application/json, text/event-stream",
        ...(req.headers["content-type"] ? { "content-type": req.headers["content-type"] } : {})
      },
      body
    });

    res.writeHead(upstream.status, Object.fromEntries(upstream.headers));
    if (upstream.body) {
      for await (const chunk of upstream.body) res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "upstream_unavailable" }));
  }
});

server.listen(port, "0.0.0.0", () => console.log(`Hotmart MCP bridge listening on ${port}`));
