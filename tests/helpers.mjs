// 每个测试使用自己的临时目录和本地 ReMe 假服务，不接触用户文件或付费模型。
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IdeasRuntime } from "../dist/runtime.js";
import { resolveConfig } from "../dist/config.js";
export const draft = { title: "完善个人 AI 演示", description: "把记忆检索与行动建议串成一次完整演示。", reason: "你正在推进个人 AI 项目，偏好先验证最小闭环。",
  instruction: "检查现有演示，整理三个待验证场景；输出验收清单，修改源码前先征求用户同意。", evidenceIds: [1] };
export const signal = () => new AbortController().signal;
export async function fixture(t, options = {}) {
  const dataDir = await mkdtemp(join(tmpdir(), "ideas-test-"));
  const searches = [];
  const prompts = [];
  const generations = [];
  const server = createServer(async (request, response) => {
    let text = "";
    for await (const chunk of request) text += chunk;
    searches.push({ path: request.url, method: request.method, body: JSON.parse(text) });
    response.writeHead(options.httpStatus ?? 200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(options.memory ?? { success: true, answer: "用户正在推进个人 AI 项目，偏好中文和小规模验证。" }));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const config = resolveConfig({ dataDir, remeEndpoint: `http://127.0.0.1:${server.address().port}`, ...options.config });
  const services = {
    ...(options.goals ? { goals: options.goals } : {}),
    route: () => ({ provider: "bailian", model: "test-model" }),
    async generate(system, input, route, callSignal) {
      generations.push({ system, input: JSON.parse(input), route, signal: callSignal });
      if (options.generate) return options.generate(callSignal);
      return options.output ?? JSON.stringify({ ideas: [draft] });
    },
    async prompt(request, callSignal) {
      prompts.push(request);
      await options.prompt?.(request, callSignal, prompts.length);
    },
  };
  const runtime = new IdeasRuntime(config, services, options.now);
  t.after(async () => { runtime.dispose(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await rm(dataDir, { recursive: true, force: true }); });
  return { runtime, config, services, searches, prompts, generations };
}
