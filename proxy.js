const http = require("http");
const httpProxy = require("http-proxy");

// Backend servers
const addresses = [
  { host: "localhost", port: 5001 },
  { host: "localhost", port: 5002 },
  { host: "localhost", port: 5003 },
];

let current = 0;
const proxy = httpProxy.createProxyServer({});

// Create HTTP server
const server = http.createServer((req, res) => {
  const target = addresses[current];
  proxy.web(
    req,
    res,
    { target: `http://${target.host}:${target.port}` },
    (err) => {
      console.error("Proxy error:", err.message);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Something went wrong.");
    }
  );
  current = (current + 1) % addresses.length;
});

// Start proxy server
const PORT = process.argv[2] || 8000;
server.listen(PORT, () => {
  console.log(`Proxy server started at port ${PORT}`);
});
