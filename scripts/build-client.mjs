// 使用 DSH 的 ModuleLoader 包装浏览器模块；React 共享宿主实例，避免多 React 副本。
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { build } from "esbuild";
await mkdir("dist", { recursive: true });
await build({ entryPoints: ["src/client/index.tsx"], outfile: "dist/client.bundle.cjs", bundle: true,
  format: "cjs", platform: "browser", target: "es2022", jsx: "automatic", external: ["react", "react/jsx-runtime"], logLevel: "info" });
const body = await readFile("dist/client.bundle.cjs", "utf8");
await writeFile("dist/client.js", `window.__ModuleLoader__.load({id:"@personal-ai/ideas-dsh-plugin",factory:(require)=>{var module={exports:{}};var exports=module.exports;\n${body}\nreturn module.exports;}});\n`);
await unlink("dist/client.bundle.cjs");
