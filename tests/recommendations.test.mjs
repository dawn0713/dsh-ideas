// 验证双来源比例、真实步骤引用、进展过滤和来源故障，不调用付费模型或修改用户目标。
import assert from "node:assert/strict";
import test from "node:test";
import { IdeasRuntime } from "../dist/runtime.js";
import { balancedIdeas, goalEvidence, newestIdeas } from "../dist/recommendations.js";
import { draft, fixture, signal } from "./helpers.mjs";

const overview = () => ({ goals: [{ id: "g1", title: "学习日语", status: "active", doneCriteria: "完成日常对话",
  tasks: [{ id: "t1", title: "练习假名", status: "pending", notes: "每天复习十分钟" },
    { id: "done", title: "准备教材", status: "done" }, { id: "cancel", title: "取消步骤", status: "cancelled" }] }],
  openTasks: [{ goalId: "g1", goalStatus: "active", taskId: "t1", status: "pending" }] });
const candidates = round => JSON.stringify({ ideas: Array.from({ length: 3 }, (_, n) => {
  const memory = n < (round % 2 ? 2 : 1);
  return { ...draft, title: `${memory ? "记忆" : "目标"}点子${round}-${n}`, intent: `独立意图${round}-${n}`,
    evidenceIds: [memory ? 1 : 2], value: memory ? 5 : 1 };
}) });

test("两轮各三条、奇数位交替，重启后仍保持 1:1 且持久保存真实来源", async t => {
  let round = 0;
  const f = await fixture(t, { goals: async () => overview(), generate: () => candidates(++round) });
  const first = (await f.runtime.generate({}, signal())).ideas.sort(newestIdeas);
  assert.deepEqual(first.map(i => i.basis), ["memory", "goal", "memory"]);
  assert.deepEqual(first[1].goalRef, { goalId: "g1", taskId: "t1", title: "练习假名" });
  assert.equal(first[1].goal, "学习日语");
  assert.deepEqual(JSON.parse(first[1].evidence[0]).progress, { completed: 1, total: 2 });
  assert.deepEqual(f.generations[0].input.sourceWeights, { memory: 1, goal: 1 });
  assert.equal(f.generations[0].input.goalSteps[0].id, 2);
  // 从相同磁盘目录恢复，再生成下一批，不依赖进程内轮换计数。
  const restored = new IdeasRuntime(f.config, f.services);
  t.after(() => restored.dispose());
  const all = (await restored.generate({}, signal())).ideas.sort(newestIdeas);
  assert.deepEqual(balancedIdeas(all, 3).map(i => i.basis), ["goal", "memory", "goal"]);
  assert.equal(all.filter(i => i.basis === "memory").length, 3);
  assert.equal(all.filter(i => i.basis === "goal").length, 3);
});

test("暂停、完成、归档目标及完成／取消步骤不进入输入；受阻步骤保留", () => {
  const data = overview();
  for (const status of ["paused", "completed", "archived"]) {
    const copy = structuredClone(data); copy.goals[0].status = status;
    assert.equal(goalEvidence(copy, 9000).length, 0);
  }
  for (const status of ["done", "cancelled"]) {
    const copy = structuredClone(data); copy.goals[0].tasks[0].status = status;
    assert.equal(goalEvidence(copy, 9000).length, 0);
  }
  data.goals[0].status = "blocked"; data.openTasks[0].goalStatus = "blocked";
  data.goals[0].tasks[0].status = "blocked"; data.openTasks[0].status = "blocked";
  assert.equal(goalEvidence(data, 9000).length, 1);
});

test("记忆故障时依据目标生成，目标故障时依据记忆生成，页面明确提示", async t => {
  const goalOnly = await fixture(t, { httpStatus: 503, goals: async () => overview() });
  const state = await goalOnly.runtime.generate({}, signal());
  assert.equal(state.ideas[0].basis, "goal");
  assert.match(state.sourceNotice, /记忆来源暂无/);
  const memoryOnly = await fixture(t, { goals: async () => { throw new Error("暂不可用"); } });
  assert.equal((await memoryOnly.runtime.generate({}, signal())).ideas[0].basis, "memory");
  assert.match((await memoryOnly.runtime.snapshot()).sourceNotice, /个人目标暂无/);
});

test("模型漏掉一种来源或伪造证据时整批拒绝，不留下半批单源卡", async t => {
  for (const output of [JSON.stringify({ ideas: [draft] }), JSON.stringify({ ideas: [{ ...draft, evidenceIds: [999] }] }),
    JSON.stringify({ ideas: [1, 2, 3].map((n) => ({ ...draft, title: `错误比例${n}`, evidenceIds: [n === 1 ? 1 : 2] })) })]) {
    const f = await fixture(t, { goals: async () => overview(), output });
    await assert.rejects(f.runtime.generate({}, signal()));
    assert.equal((await f.runtime.snapshot()).ideas.length, 0);
  }
});

test("首页即使记忆卡时间更新或分数更高，也保留目标来源", () => {
  const cards = [1, 2, 3].map(n => ({ basis: "memory", title: String(n) }));
  cards.push({ basis: "goal", title: "目标步骤" });
  assert.deepEqual(balancedIdeas(cards, 3).map(i => i.basis), ["memory", "goal", "memory"]);
});
