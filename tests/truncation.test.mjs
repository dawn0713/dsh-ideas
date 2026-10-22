// 验证输出截断时仅重试一次，其他结束原因明确报错且不保存残缺推荐。
import assert from "node:assert/strict";
import test from "node:test";
import { Context } from "@deepseek-ai/cordis";
import LlmRuntime, { LlmAdapter } from "@deepseek-ai/dsh-llm";
import * as plugin from "../dist/index.js";
import { draft, fixture, signal } from "./helpers.mjs";

for (const scenario of ["recover", "always-truncated", "tool-calls", "error"]) {
  test(`生成结束原因处理：${scenario}`, async t => {
    const f = await fixture(t);
    const ctx = new Context();
    t.after(() => ctx.fiber.dispose());
    await ctx.plugin(LlmRuntime);
    const budgets = [];
    class Adapter extends LlmAdapter {
      async *stream(options) {
        budgets.push(options.maxTokens);
        const recovered = scenario === "recover" && budgets.length === 2;
        yield { type: "text-delta", index: 0, text: recovered ? JSON.stringify({ ideas: [draft] }) : '{"ideas":[' };
        yield { type: "finish", reason: recovered ? { kind: "stop" } : scenario === "error"
          ? { kind: "error", failure: { code: "TEST_FAILURE", message: "test" } }
          : { kind: scenario === "tool-calls" ? "tool-calls" : "max-tokens" } };
      }
    }
    ctx.llm.registerAdapter(["bailian"], new Adapter());
    ctx.provide("agentDefaultModel", { currentSelection: () => ({ provider: "bailian", model: "test" }) });
    ctx.provide("sessionController", { prompt: async () => ({ accepted: true }) });
    await ctx.plugin(plugin, { dataDir: f.config.dataDir, remeEndpoint: f.config.remeEndpoint });
    if (scenario === "recover") {
      const result = await ctx.ideas.generate({}, signal());
      assert.equal(result.ideas.length, 1);
      assert.deepEqual(budgets, [8192, 16000]);
    } else {
      await assert.rejects(ctx.ideas.generate({}, signal()), scenario === "always-truncated" ? /16000 tokens/
        : scenario === "error" ? /TEST_FAILURE/ : /tool-calls/);
      assert.equal((await ctx.ideas.list()).ideas.length, 0);
      assert.equal(budgets.length, scenario === "always-truncated" ? 2 : 1);
    }
  });
}
