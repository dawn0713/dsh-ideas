// 构建一个只监听回环地址的 UI 预览；不会访问 DSH、ReMe 或百炼服务。
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { build } from "esbuild";
const require = createRequire(import.meta.url);
const rendererRequire = createRequire(require.resolve("@deepseek-ai/dsh-client-ui-renderer"));
await mkdir("preview", { recursive: true });
await build({ entryPoints: ["scripts/preview-client.tsx"], outfile: "preview/preview.js", bundle: true,
  platform: "browser", format: "esm", jsx: "automatic", target: "es2022",
  alias: { "react-dom/client": rendererRequire.resolve("react-dom/client") } });
await writeFile("preview/index.html", `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ideas 开发预览</title><style>
html,body,#app{height:100%;margin:0}body{background:#e9edf3;font:13px -apple-system,BlinkMacSystemFont,sans-serif}.preview-toolbar{height:52px;padding:0 22px;display:flex;align-items:center;gap:18px;background:#fff;border-bottom:1px solid #dfe5ee;color:#293448}.preview-toolbar span{font-size:11px;color:#7a8596;margin-right:auto}.preview-toolbar button{border:1px solid #e0e5ec;background:#fff;border-radius:6px;padding:6px 10px;color:#556278;cursor:pointer}.preview-main{height:calc(100% - 52px)}.preview-side{height:calc(100% - 52px);max-width:370px;margin-left:auto;border-left:1px solid #dfe5ee}body[data-ds-dark-theme]{background:#12161e}body[data-ds-dark-theme] .preview-toolbar{background:#222833;border-color:#343e4d;color:#dfe5ee}@media(max-width:600px){.preview-toolbar{gap:7px;padding:0 10px}.preview-toolbar span{display:none}.preview-toolbar strong{margin-right:auto}.preview-side{max-width:100%}}
.preview-main:has(.pai-preview-chat){background:#fff}body[data-ds-dark-theme] .preview-main:has(.pai-preview-chat){background:#191d25}.pai-preview-chat{padding:35px 20px;max-width:720px;margin:auto;font:15px/1.7 -apple-system,BlinkMacSystemFont,sans-serif}.pai-preview-label{color:#888;font-size:11px}.pai-preview-user{margin:10px 0 30px auto;width:max-content;background:#b9dcff;color:#16334c;border-radius:28px;padding:11px 20px}.pai-preview-assistant{background:#e9e9e9;border-radius:22px;padding:16px 20px;max-width:92%;color:#17191c}.pai-preview-assistant p{margin:10px 0 0}.pai-preview-chat>button{margin-top:25px;border:0;border-radius:8px;padding:8px 12px;background:#fff;color:#536276}.pai-preview-chat .pai-ideas-chat-reference{max-width:85%}body[data-ds-dark-theme] .pai-preview-assistant{background:#2b3039;color:#dfe5ee}
</style></head><body><div id="app"></div><script type="module" src="/preview.js"></script></body></html>\n`);
if (process.argv.includes("--build-only")) process.exit(0);
const server = createServer(async (request, response) => {
  const file = request.url === "/preview.js" ? "preview.js" : request.url === "/" ? "index.html" : undefined;
  if (!file) { response.writeHead(404); response.end(); return; }
  response.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8");
  response.end(await readFile(`preview/${file}`));
});
server.listen(3461, "127.0.0.1", () => console.log("Ideas 示例预览：http://127.0.0.1:3461"));
process.on("SIGINT", () => server.close());
