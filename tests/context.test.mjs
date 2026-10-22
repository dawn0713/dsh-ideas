// 使用真正的 DSH Agent 循环验证模型上下文与用户消息分离，不调用付费模型。
import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { transform } from "esbuild";
import { Context } from "@deepseek-ai/cordis";
import LlmRuntime, { LlmAdapter, createUserMessage } from "@deepseek-ai/dsh-llm";
import AgentRegistry from "@deepseek-ai/dsh-agent";
import AgentLoop from "@deepseek-ai/dsh-agent-loop";
import SessionStore, { SessionId } from "@deepseek-ai/dsh-session";
import SessionProjectionRegistry from "@deepseek-ai/dsh-session-projection";
import SystemPrompt from "@deepseek-ai/dsh-system-prompt";
import ToolRuntime from "@deepseek-ai/dsh-tools";
import { installHandoff } from "../dist/handoff.js";
import { START_TEXT, HANDOFF_SOURCE } from "../dist/types.js";
import { ideaReferenceDefinition } from "../dist/client/chat.js";
import { draft, fixture, signal } from "./helpers.mjs";

const require = createRequire(import.meta.url);
const chatDir = dirname(require.resolve("@deepseek-ai/dsh-client-ui-chat/package.json"));
// 宿主浏览器代码只发布 bundle；直接编译其纯可见性函数用于验证，不构建或修改宿主。
const visibilitySource = await readFile(join(chatDir, "src/client/contract/chat-visibility.ts"), "utf8");
const visibility = await transform(visibilitySource, { loader: "ts", format: "esm" });
const { isVisibleChatNode } = await import(`data:text/javascript;base64,${Buffer.from(visibility.code).toString("base64")}`);

for (const general of [false, true]) test(`${general ? "通用点子" : "个性化推荐"}：原生 Agent 收到资料，正文只保留开场且会话隔离`, async t => {
  const f = await fixture(t);
  let idea = general ? undefined : (await f.runtime.generate({}, signal())).ideas[0];
  const ctx = new Context();
  t.after(() => ctx.fiber.dispose());
  for (const service of [LlmRuntime, SessionStore, SessionProjectionRegistry, SystemPrompt, ToolRuntime, AgentRegistry]) await ctx.plugin(service);
  await ctx.plugin(AgentLoop, { agents: [] });
  const requests = [];
  class Adapter extends LlmAdapter {
    async resolveModel(provider, model) { return { provider, id: model, name: model }; }
    async *stream(options) {
      requests.push(options);
      yield { type: "text-delta", index: 0, text: "开始之前，你想先验证哪个场景？" };
      yield { type: "finish", reason: { kind: "stop" } };
    }
  }
  ctx.llm.registerAdapter(["mock"], new Adapter());
  installHandoff(ctx, f.runtime);
  const agent = await ctx.agentLoop.create(SessionId("chat"), { provider: "mock", model: "test" });
  const deliveries = [];
  f.services.prompt = async request => {
    deliveries.push(request);
    agent.followup(createUserMessage({ content: [{ type: "text", text: request.text }], source: { kind: "user", rpcId: request.requestId } }));
  };
  if (general) idea = (await f.runtime.startGeneral({ templateId: "general-01", sessionId: "chat" }, signal())).ideas[0];
  else await f.runtime.start({ id: idea.id, revision: idea.revision, sessionId: "chat" }, signal());
  await agent.whenIdle();
  assert.equal(deliveries[0].text, START_TEXT);
  assert.equal(requests.length, 1);
  const context = requests[0].messages.find(message => message.source?.kind === HANDOFF_SOURCE);
  assert.ok(context);
  assert.match(context.content[0].text, general ? /不是根据个人记忆/ : /修改源码前先征求用户同意/);
  const human = requests[0].messages.find(message => message.source?.kind === "user");
  assert.deepEqual(human.content, [{ type: "text", text: START_TEXT }]);
  const events = agent.session.snapshotEvents();
  const injected = events.find(event => event.type === "user/message" && event.data.source.kind === HANDOFF_SOURCE);
  assert.equal(isVisibleChatNode({ kind: "context", visibility: "visible", data: { content: injected.data.content } }), false);
  const match = { event: injected, role: "start", location: { kind: "unresolved" } };
  const state = ideaReferenceDefinition.start({}, match, {});
  const node = ideaReferenceDefinition.buildViewNode({ key: "quote", id: "quote", state, matches: [match], start: match });
  assert.deepEqual(node.data, { title: idea.title, ideaId: idea.id });
  assert.equal(node.location.kind, "session");
  assert.equal(isVisibleChatNode(node), true);
  // 其他会话或手动输入相同开场，不得借用这个任务的资料。
  const other = await ctx.agentLoop.create(SessionId("other"), { provider: "mock", model: "test" });
  other.followup(createUserMessage({ content: [{ type: "text", text: START_TEXT }], source: { kind: "user", rpcId: deliveries[0].requestId } }));
  await other.whenIdle();
  assert.equal(requests[1].messages.some(message => message.source?.kind === HANDOFF_SOURCE), false);
  await f.runtime.start({ id: idea.id, revision: idea.revision, sessionId: "chat" }, signal());
  assert.equal(deliveries.length, 1);
});
