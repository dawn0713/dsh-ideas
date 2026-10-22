// 使用本机真正的 Cordis、LLM 和 Typert Gateway 验证浏览器到 Host 的调用协议。
import assert from "node:assert/strict";
import test from "node:test";
import { Context } from "@deepseek-ai/cordis";
import LlmRuntime, { LlmAdapter } from "@deepseek-ai/dsh-llm";
import Registry from "@deepseek-ai/dsh-typert-registry";
import Gateway from "@deepseek-ai/dsh-api-gateway";
import * as plugin from "../dist/index.js";
import { createIdeasApi } from "../dist/client/api.js";
import { draft, fixture } from "./helpers.mjs";

test("真实 DSH Gateway 串起前端 RPC、模型流、原生 prompt 请求和卸载", async t => {
  const f = await fixture(t);
  const ctx = new Context();
  const calls = [];
  const prompts = [];
  t.after(() => ctx.fiber.dispose());
  for (const service of [Registry, Gateway, LlmRuntime]) await ctx.plugin(service);
  class Adapter extends LlmAdapter {
    async *stream(options) {
      calls.push(options);
      yield { type: "text-delta", index: 0, text: JSON.stringify({ ideas: [draft] }) };
      yield { type: "finish", reason: { kind: "stop" } };
    }
  }
  ctx.llm.registerAdapter(["bailian"], new Adapter());
  ctx.provide("agentDefaultModel", { currentSelection: () => ({ provider: "bailian", model: "existing-model" }) });
  ctx.provide("sessionController", { async prompt(request) { prompts.push(request); return { accepted: true }; } });
  const fiber = await ctx.plugin(plugin, f.config);
  const api = createIdeasApi({ async call(channel, endpoint, payload, signal) {
    assert.equal(channel, "/api");
    const [namespace, method] = endpoint.split("/");
    try { return { ok: true, value: await ctx.typertGateway.invoke({ namespace, method, args: payload.args, signal }) }; }
    catch (error) { return { ok: false, error: { code: error.code ?? "error", message: error.message } }; }
  } });
  t.after(() => api.dispose());
  await api.refresh();
  assert.equal(api.getSnapshot().error, "");
  assert.equal(await api.run("generate", { query: "个人 AI" }), true);
  const idea = api.getSnapshot().ideas[0];
  assert.equal(calls[0].provider, "bailian");
  assert.equal(calls[0].model, "existing-model");
  assert.equal(calls[0].tools, undefined);
  assert.equal(await api.run("start", { id: idea.id, revision: idea.revision, sessionId: "current-session" }), true);
  assert.equal(prompts[0].mode, "queue");
  assert.equal(prompts[0].sessionId, "current-session");
  assert.equal(prompts[0].clientTimeZone, "Asia/Shanghai");
  assert.equal(prompts[0].content[0].text, "我们开始吧！");
  assert.equal(prompts[0].content.length, 1);
  assert.match((await ctx.ideasRuntime.handoffContexts("current-session", [prompts[0].requestId]))[0].text, /完善个人 AI 演示/);
  assert.equal(api.getSnapshot().ideas[0].status, "started");
  // 通用目录通过同一正式 Gateway 交接；没有经过模型生成或个人记忆检索。
  assert.equal(await api.run("startGeneral", { templateId: "general-03", sessionId: "current-session" }), true);
  const general = api.getSnapshot().ideas.find(item => item.templateId === "general-03");
  assert.equal(general.source, "general");
  assert.deepEqual(general.evidence, []);
  assert.equal(calls.length, 1);
  assert.equal(prompts[1].content[0].text, "我们开始吧！");
  assert.match((await ctx.ideasRuntime.handoffContexts("current-session", [prompts[1].requestId]))[0].text, /自动续费/);
  await fiber.dispose();
  assert.equal(ctx.get("ideas"), undefined);
});
