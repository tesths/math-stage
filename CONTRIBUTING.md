# 贡献指南 · Contributing Guide

感谢你愿意为 **Math Stage（小学数学互动学习平台）** 做出贡献！本指南说明开发环境、分支与提交规范，以及如何新增一道例题、一个 Lab 或一个小游戏。英文摘要见文末。

## 1. 环境准备

- **Node 24**（`>=24 <25`）与 **npm ≥ 11**。仓库根开启 `engine-strict`，版本不符会直接报错。
- 依赖只在仓库根安装一次：

```bash
git clone https://github.com/tesths/math-stage.git
cd math-stage
npm ci --ignore-scripts
npm run typecheck          # 全部应用类型检查
npm run test:unit          # 全部 workspace 测试
```

- 单独开发某个年级：`npm run dev --workspace math-game-g5`（或 `cd g5/game && npm run dev`）。
- 需要代理时，安装阶段临时设置 `HTTP_PROXY` / `HTTPS_PROXY` 即可，`prepare` / `generate` 会自动清理代理变量。

## 2. 分支与提交

1. 从 `main` 拉出特性分支：`feat/xxx`、`fix/xxx`、`docs/xxx`、`chore/xxx`。
2. 提交信息使用 **约定式提交**（Conventional Commits），scope 用年级或模块，如：
   - `feat(g6): 新增圆的面积练习题 Lab`
   - `fix(g5): 修正多边形剪拼的坐标越界`
   - `docs: 补充六年级练习题候选清单`
3. 一个 PR 尽量聚焦一件事；改动例题数据时请附上验证说明（见第 4 节）。

## 3. 代码规范（极易踩坑）

- **样式统一使用 Nuxt UI 设计令牌**（`--ui-primary`、`--ui-bg-*`、`--ui-text-*` 等），禁止硬编码色值；文本淡化用 `text-(--ui-text-muted)`。
- **新增小游戏 / Lab 必须同步**：`src/lib/arcade/registry.ts`（或对应 Lab 注册表）、组件级 vitest 测试、`e2e/games.spec.ts` 矩阵。
- **不要给根 `package.json` 加 `packageManager` 字段**（会触发 npm 版本切换导致 EBADENGINE 构建失败）。
- 覆盖率对 `??` / `||` / 可选链空值兜底零容忍，组件内避免测试覆盖不到的防御分支。
- 更多约定见 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) 各年级「关键约定」与「排错速查」。

## 4. 新增内容怎么做

| 目标 | 参考文档 |
| --- | --- |
| 新增一道例题 | [`docs/DEVELOPMENT.md` §3.3](docs/DEVELOPMENT.md) 及对应年级章节 |
| 新增一个可视化 Lab | [`docs/DEVELOPMENT.md` §4.4 / §5.4 / §6.4 / §7.4](docs/DEVELOPMENT.md) |
| 新增一个小游戏 | [`docs/DEVELOPMENT.md` §3.4](docs/DEVELOPMENT.md) 与各年级「训练游戏」章节 |
| 新增一个年级 | [`docs/DEVELOPMENT.md` §10.5](docs/DEVELOPMENT.md)（改 `shared/grades` 一处即可） |
| 改动例题准确性 | 跑 `python3 scripts/verify_examples.py`，并同步 `docs/example-audit-glm.md` |

改动后请至少执行：`npm run typecheck`、相关 workspace 的 `npm run test`；涉及 UI 的再跑对应截图回归或 E2E。

## 5. PR 检查清单

- [ ] 已在本地通过 `npm run typecheck` 与相关 `npm run test`
- [ ] 新增/修改的例题或 Lab 已核对课本页码与题源
- [ ] 未提交课本 PDF、OCR 图片、`deploy/`、`node_modules/` 等产物（`.gitignore` 已覆盖）
- [ ] 变更说明清晰（做了什么、为什么、怎么验证）
- [ ] 遵守 [行为准则](CODE_OF_CONDUCT.md)

## 6. 报告问题

请使用仓库的 Issue 模板（Bug / Feature）。安全相关问题请勿公开提交，见 [SECURITY.md](SECURITY.md)。

---

## English summary

1. **Requirements**: Node 24 (`>=24 <25`) and npm ≥ 11; install once at the repo root with `npm ci --ignore-scripts`.
2. **Branch & commits**: branch from `main` as `feat/…`, `fix/…`, `docs/…`; use Conventional Commits with a grade/module scope, e.g. `feat(g6): add circle-area exercise Lab`.
3. **Conventions**: use Nuxt UI design tokens (no hard-coded colors); register new Labs/games in the registry with tests and E2E matrix entries; never add a `packageManager` field to the root `package.json`.
4. **Adding content**: see `docs/DEVELOPMENT.md` for examples, Labs, games and grades; re-run `scripts/verify_examples.py` after changing example data.
5. **Before a PR**: run `npm run typecheck` and the relevant `npm run test`; verify textbook page/source; don't commit PDFs, OCR images, `deploy/` or `node_modules/`.
6. **Reporting**: use the issue templates; report security issues privately per [SECURITY.md](SECURITY.md).
