# 小学数学互动学习平台 —— 开发文档

> 面向后续开发者/维护者的完整说明。覆盖：项目架构、各年级工程的内部结构、
> 数据格式、新增内容的标准流程、OCR 管线、测试、单 Cloudflare Pages 部署。
> 快速命令见文末 [§11 命令速查](#11-命令速查)。

---

## 1. 项目总览

一个 GitHub 仓库（`tesths/math-stage`）、**一个** Cloudflare Pages 部署，
同时承载多个年级的互动学习内容，外加一个门户首页。
五个应用共用仓库根的 `shared/` 设计系统（主色统一为五年级的 **emerald**）：

| 部分 | 位置 | 内容 | 技术 |
| --- | --- | --- | --- |
| 共享设计系统 | `shared/` | 年级注册表 / 主题令牌 / 工具函数 / 统一布局组件 GradeShell / 共享 Nuxt 配置片段 | 纯 TS/CSS + 1 个 .vue，零运行时依赖 |
| 门户 | `portal/` | 年级入口（卡片由 `shared/grades` 生成） | Nuxt 4 + Nuxt UI（emerald） |
| 一年级 | `data/` + `game/` | 人教版一年级上册：78 道例题答题游戏 + 20 个小游戏 | Nuxt 4 + Nuxt UI（emerald） |
| 二年级 | `g2/data/` + `g2/game/` | 苏教版二年级上册：22 个可调参数可视化 Lab + 12 个训练游戏 | Nuxt 4 + Nuxt UI（emerald）+ animejs |
| 五年级 | `g5/data/` + `g5/game/` | 苏教版五年级上册：33 个可调参数可视化 Lab + 10 个训练游戏 | Nuxt 4 + Nuxt UI（emerald）+ three.js / chart.js / animejs / jsxgraph |
| 六年级 | `g6/data/` + `g6/game/` | 苏教版六年级上册：33 个可调参数可视化 Lab + 12 个训练游戏 | Nuxt 4 + Nuxt UI（emerald）+ animejs |

部署后路由：`/` 门户，`/g1/*` 一年级，`/g2/*` 二年级，`/g5/*` 五年级，`/g6/*` 六年级。
各年级仍是**完全独立的 Nuxt 工程**（管理上分开），构建时由 `scripts/site-build.mjs`
各自静态导出到子路径并聚合为一个产物 `deploy/`。

### 1.1 核心技术栈（各工程一致）

- Nuxt 4（`srcDir: src/`）+ Vue 3 + vue-router
- Nuxt UI v4（`appConfig.ui.colors.primary` 定义主题色；`ui.fonts: false` 离线）
- three.js（五年级三视图）、animejs v4（动画）、chart.js v4（统计图）、jsxgraph（数轴，备用）
- Vitest（单元/组件）+ Playwright（E2E）+ vue-tsc（类型检查）
- nitro preset `cloudflare-pages`（部署）；E2E 用 `NITRO_PRESET=node-server` 本地构建

### 1.2 共享设计系统（`shared/`，主样式基准 = 五年级）

```
shared/
├── grades/index.ts         年级注册表（GradeInfo：部署路径/标题/课标/配色/特性/页脚）
│                           查询函数：gradeById / otherGrades / isKnownGrade…
├── theme/index.ts          设计令牌：THEME（primary=emerald）/ siteHead / unitNoText / pageRangeLabel
├── theme/main.css          统一 CSS 覆盖层（基础排版/交互反馈/卡片悬停/区块标题）
├── theme/nuxt-config.ts    共享 Nuxt 配置片段：sharedNuxtConfig()（ui 离线字体/图标扫描/
│                           主色 emerald/三方库优化/预渲染策略）+ sharedIcon（含共享组件图标清单）
├── components/GradeShell.vue 全平台统一布局壳（顶栏+年级切换+首页+页脚），由年级注册表驱动
├── utils/index.ts          clamp / range / joinItems / countLabel
├── test/                   独立 vitest 工程（node 环境，覆盖率阈值 95%）
└── package.json            math-shared（无运行时依赖；测试复用 g5/game 的 vitest 二进制）
```

**为什么共享层没有更多 .vue？** 跨 Nuxt 工程 import 共享 .vue 组件可行（GradeShell 已验证），
但 Nuxt 自动导入（auto-imports / #components）不作用于 srcDir 外文件，共享组件内必须显式 import；
vitest 侧需用 `#components` 桩（`shared/test/stubs/components.ts`）。为控制复杂度，
只把**布局壳**提升为共享组件，其余组件保留在各应用内。

**新增年级（三年级等）**：只改 `shared/grades/index.ts` 加一条 `GradeInfo` 记录 →
门户卡片、顶栏年级切换、页脚文案自动生效。

### 1.3 课本来源

| 年级 | 课本 | PDF | 页数 | 书页偏移 |
| --- | --- | --- | --- | --- |
| 一年级 | 人教版（2022 课标） | `（根据2022年版课程标准修订）义务教育教科书•数学一年级上册.pdf` | 105 | 书页 = PDF页 - 7 |
| 二年级 | 苏教版（2022 课标，2025 新编） | 扫描 PDF（120 页，文件名带"人教版"实为凤凰教育出版社） | 120 | 书页 = PDF页 - 8 |
| 五年级 | 苏教版（2022 课标） | `最新【苏教版】5年级数学课本•上册.pdf` | 131 | 书页 = PDF页 - 2 |
| 六年级 | 苏教版（2022 课标） | `最新【苏教版】6年级数学课本•上册.pdf` | 131 | 书页 = PDF页 - 2 |

---

## 2. 仓库结构

```
math/
├── README.md                  总入口说明（含部署章节）
├── shared/                    共享设计系统（年级注册表/主题令牌/工具/GradeShell/测试）
├── docs/
│   ├── DEVELOPMENT.md         本文件（开发文档）
│   ├── example-audit.md       一年级例题核对报告
│   └── 游戏形式调研.md        一年级 20 个小游戏的课本出处调研
├── portal/                    门户（Nuxt 4 + Nuxt UI 应用：pages/index.vue 年级卡片，由 shared/grades 生成）
├── package.json               根：build:site / build:site:local / preview / test:shared
├── scripts/
│   ├── site-build.mjs         单 Pages 聚合构建脚本（五个 Nuxt 应用：g1/g2/g5/g6/门户）
│   ├── test-shared.mjs        运行共享层测试（临时软链 g5/game 的 node_modules）
│   ├── real-click-test.mjs    真实浏览器点击验收（npm run test:click，46 项）
│   └── verify_examples.py     一年级例题↔课本 OCR 机器核对
│
├── ── 一年级工程（人教版上册）──
├── data/
│   ├── schema/example.ts      例题类型定义（11 类题型）
│   ├── schema/validate.ts     运行时校验器
│   ├── chapters/meta.ts       9 单元元信息（书页区间/图标/简介）
│   ├── chapters/c1.ts … c9.ts 各单元例题（共 78 道）
│   └── index.ts               汇总（findById / byChapter）
├── game/                      Nuxt4 应用（主色 emerald，统一来自 shared）
│   ├── src/lib/engine/        纯逻辑引擎（checker/count/position/generator/registry）
│   ├── src/lib/arcade/        20 个小游戏引擎 + 元数据 + slug→组件注册表
│   ├── src/lib/storage.ts     localStorage 安全封装
│   ├── src/lib/sound.ts       WebAudio 合成音效
│   ├── src/components/games/  8 个教材题类组件（Count/AddSub/Compare…）
│   ├── src/components/arcade/ 20 个小游戏组件
│   ├── src/components/ui/     QuestionCard / AnswerPad / FeedbackOverlay
│   ├── src/pages/             index / units/[id] / play/[id] / games/[slug] / games/
│   ├── test/                  vitest（311 用例）+ e2e/（Playwright 34 用例）
│   └── nuxt.config.ts         baseURL 支持 BASE_URL env；prerender.crawlLinks
│
├── ── 二年级工程（苏教版上册）──
├── g2/
│   ├── README.md              二年级工程说明
│   ├── docs/                  课本 OCR 与页面映射说明（书页 = PDF页 - 8）
│   ├── ocr/pages/             120 页 OCR 产物（txt + 整页图 + 插图）
│   ├── data/
│   │   ├── schema/lab.ts      Lab 类型定义（params 滑块/fixed 常量/kind/公式）
│   │   ├── schema/validate.ts 运行时校验（id 唯一/参数范围）
│   │   ├── chapters/meta.ts   10 单元元信息（c3 七巧板/c5 方向/c8 人民币为综合实践）
│   │   ├── chapters/c1.ts … c10.ts  22 个 Lab
│   │   └── index.ts           汇总（findLabById / byChapter / totalLabs=22）
│   └── game/                  Nuxt4 应用（主色 emerald，统一来自 shared）
│       ├── src/lib/engine/math.ts   纯数学工具（乘法口诀/中文数字/方向/三位数分解）
│       ├── src/lib/labs/             Lab 计算引擎（compute.ts，17 种 kind）+ kind→组件注册表
│       ├── src/lib/games/            12 个游戏元数据 + slug→组件注册表
│       ├── src/lib/storage.ts / sound.ts
│       ├── src/components/labs/      8 个可视化组件（点阵/计数器/算盘/方向板/七巧板/人民币）
│       ├── src/components/games/     12 个训练游戏组件
│       ├── src/components/ui/        GameAnswerBar（选项/输入两种模式）
│       ├── src/pages/                index / units/[id] / labs/[id] / games/[slug] / games/
│       ├── test/                     vitest（8 文件 106 用例，四指标 ≥95%）
│       └── nuxt.config.ts            baseURL + prerender.crawlLinks
│
├── ── 五年级工程（苏教版上册）──
├── g5/
│   ├── README.md              五年级工程说明
│   ├── docs/                  课本 OCR 与页面映射说明
│   ├── ocr/pages/             131 页 OCR 产物（txt + 整页图 + 插图）
│   ├── data/
│   │   ├── schema/lab.ts      Lab 类型定义（params 滑块/fixed 常量/kind/公式）
│   │   ├── schema/validate.ts 运行时校验（id 唯一/参数范围）
│   │   ├── chapters/meta.ts   8 单元元信息
│   │   ├── chapters/c1.ts … c8.ts  33 个 Lab（含探索规律 pinboard 挂在 c6）
│   │   └── index.ts           汇总（findLabById / byChapter / totalLabs）
│   └── game/                  Nuxt4 应用（主色 emerald，统一来自 shared）
│       ├── src/lib/engine/math.ts   纯数学工具（因数/质数/gcd/lcm/面积/皮克）
│       ├── src/lib/labs/             Lab 计算引擎（compute.ts）+ kind→组件注册表
│       ├── src/lib/games/            10 个游戏元数据 + slug→组件注册表
│       ├── src/lib/storage.ts / sound.ts
│       ├── src/components/labs/      9 个可视化组件（SVG + three.js + chart.js）
│       ├── src/components/games/     10 个训练游戏组件
│       ├── src/components/ui/        GameAnswerBar（选项/输入两种模式）
│       ├── src/pages/                index / units/[id] / labs/[id] / games/[slug] / games/
│       ├── test/                     vitest（105 用例，四指标 ≥95%）+ e2e/（Playwright 6 用例）
│       └── nuxt.config.ts            baseURL + prerender.crawlLinks；chart.js 依赖
│
├── ── 六年级工程（苏教版上册）──
├── g6/
│   ├── README.md              六年级工程说明
│   ├── docs/                  课本 OCR 与页面映射说明
│   ├── ocr/pages/             131 页 OCR 产物（txt + 整页图 + 插图）
│   ├── data/
│   │   ├── schema/lab.ts      Lab 类型定义（params 滑块/fixed 常量/kind/公式）
│   │   ├── schema/validate.ts 运行时校验（id 唯一/参数范围）
│   │   ├── chapters/meta.ts   7 单元元信息
│   │   ├── chapters/c1.ts … c7.ts  33 个 Lab（c2 附分段计费、c3 附二进制、c4 附黄金比）
│   │   └── index.ts           汇总（findLabById / byChapter / totalLabs）
│   └── game/                  Nuxt4 应用（主色 emerald，统一来自 shared）
│       ├── src/lib/engine/math.ts   纯数学工具（四舍五入/进一去尾/分数/比/π）
│       ├── src/lib/labs/             Lab 计算引擎（compute.ts，33 种 kind）+ kind→组件注册表
│       ├── src/lib/games/            12 个游戏元数据 + slug→组件注册表
│       ├── src/lib/storage.ts / sound.ts
│       ├── src/components/labs/      8 个可视化组件（SVG：方格模型/圆/扇形/线段图/方位图）
│       ├── src/components/games/     12 个训练游戏组件
│       ├── src/components/ui/        GameAnswerBar（选项/输入两种模式）
│       ├── src/pages/                index / units/[id] / labs/[id] / games/[slug] / games/
│       ├── test/                     vitest（8 文件 130 用例，四指标 ≥95%）
│       └── nuxt.config.ts            baseURL + prerender.crawlLinks
│
└── ocr/                       一年级 OCR 管线（ocr.swift / pages/ / book/）
```

---

## 3. 一年级工程（人教版上册）

### 3.1 数据层 `data/`

**例题 = 一条 `GameQuestion`**（`schema/example.ts`）：

```ts
interface GameQuestion extends BaseQuestion {
  id: string          // 如 'c1-count-01'
  chapter: ChapterId  // 'c1' ~ 'c9'
  page: number        // 书页码
  source: SourceKind  // '例题' | '试一试' | '想想做做' | '练习' | '活动'
  title: string
  prompt: string      // 题干
  type: GameType      // 11 类题型
  config: GameConfig  // 题型专属载荷
}
```

**11 类题型**：`count`（数一数）/ `write`（写数）/ `split`（分与合）/
`addsub`（加减法）/ `compare`（比多少）/ `position`（方位）/
`ordinal`（第几个）/ `shape3d`（立体图形）/ `numberline`（十几）/ `sequence`（顺数）/ `ten`（抢10）。
每类题型有专属 config（如 `AddSubConfig { a, b, op, answer, emoji, options }`），
判定逻辑全部在 `game/src/lib/engine/`，**数据只声明题目内容**。

**单元（9 个）**：c1 数学游戏分享 / c2 0~5的认识和加减法 / c3 生活中的位置 /
c4 6~9的认识和加减法 / c5 图形的初步认识（一）/ c6 10的认识和加减法 /
c7 好玩的"抢10" / c8 认识11~19 / c9 期末复习。

### 3.2 前端 `game/`

- `src/lib/engine/`：`checker.ts`（判定）、`count.ts`（emoji 可见字符统计）、
  `position.ts`（方位规则：左/上/前取前一项）、`generator.ts`、`registry.ts`（type→组件）。
- `src/lib/arcade/`：`index.ts` 是 **20 个小游戏的元数据表**（slug/name/icon/group/howTo/chapters），
  `registry.ts` 是 slug→组件映射。
- 页面：`play/[id].vue` 答题页（题卡 + 组件 + 反馈 + 上一题/下一题），
  `games/[slug].vue` 游戏页，`units/[id].vue` 单元页，`index.vue` 首页（目录 + 玩法演示 + 游戏分组）。

### 3.3 新增一道例题

1. 在对应 `data/chapters/cN.ts` 加一条符合 `schema/example.ts` 的记录（保证 `answer` 与 config 一致）。
2. 跑 `npm run test`（validate 自动校验）、`npm run typecheck`。
3. 准确性回归：`python3 scripts/verify_examples.py`（STRONG/MEDIUM/FIG 三级证据），
   并同步 `docs/example-audit.md`。

### 3.4 新增一个小游戏

1. `src/lib/arcade/xxx.ts`：纯逻辑引擎（随机出题等），组件里 import。
2. `src/components/arcade/XxxGame.vue`：组件（自带反馈浮层，页面层不再叠加 FeedbackOverlay）。
3. `src/lib/arcade/registry.ts` 注册 slug→组件。
4. `src/lib/arcade/index.ts` 加元数据（`chapters` 字段标注适用单元，驱动首页分组）。
5. 组件级 vitest 测试 + `e2e/games.spec.ts` 矩阵 [slug, 根类, 交互类] 三条。

### 3.5 一年级关键约定（极易踩坑）

- `test/nuxt/` 页面测试在本工程环境无法初始化，`npm run test` 不含它们；页面由 Playwright 覆盖，勿单独启用。
- 覆盖率对 `??`/`||`/可选链判空**零容忍**：组件内禁止测试覆盖不到的空值兜底，
  用 `!`/索引断言（`deck.value[a]!`）替代 `?? 0`，否则拉低 branches 阈值。
- emoji 数量统计必须用 `visibleUnits()/countUnits()`（剥变体选择符，⛹=2 码会数错）。
- animejs v4 无 default 导出，用 `import { animate }`。
- Nuxt UI v4：`ui.fonts` 显式 `false`；图标须装 `@iconify-json/heroicons`/`lucide` 并开 `icon.clientBundle.scan`。
- 样式统一用 Nuxt UI 设计令牌（`--ui-primary`/`--ui-bg-*`/`--ui-border-*`/`--ui-text-*`），禁止硬编码色值；
  文本淡化用 `text-(--ui-text-muted)`（`--ui-muted` 不是有效令牌）。
- **跨应用导航（顶栏切年级/回门户）必须用原生 `<a href>`（绝对路径）**，四个坑：
  ① `UButton to`/`NuxtLink` → 客户端路由，在门户/对端应用内匹配不到路由 → 显示自己的 404；
  ② `UButton as="a" href` → Nuxt 给 `href` 自动加 baseURL 前缀（`/g5/` 变 `/g1/g5/`）→ 404；
  ③ `UButton to="/"` 首页按钮 → 被 baseURL 解析成本年级首页（`/g1/`）而非门户；
  ④ crawler 爬跨年级链接在本应用 404 → 构建中断，需 `nitro.prerender.failOnError: false` 兑底。
  正确写法见 `game/src/layouts/default.vue`（原生 `<a>` + `UIcon` + 手写按钮类）。

---

## 4. 五年级工程（苏教版上册）

### 4.1 数据层 `g5/data/`

**Lab = 一条 `LabDef`**（`schema/lab.ts`）：

```ts
interface LabDef {
  id: string          // 如 'g5-c3-area-parallelogram'
  chapter: ChapterId  // 'c1' ~ 'c8'
  page: number        // 书页码
  source: SourceKind  // '例题' | '试一试' | '练一练' | '练习' | '探索' | '综合实践'
  title: string
  prompt: string      // 题干
  kind: LabKind       // 22 种可视化类型
  params: LabParam[]  // 滑块定义：{ key, label, min, max, step, default, unit? }
  fixed?: Record<string, number>  // 隐藏常量（不显示为滑块）：如小数点移动基数、面积图形形状代码 0/1/2
  formula: string     // 公式展示（组件实时代入数值）
  tip?: string
}
```

**设计原则**：数据只声明（参数定义 + 公式 + fixed 常量）；**求值逻辑在 `game/src/lib/labs/compute.ts`**；
**渲染逻辑在 `components/labs/`**；kind→组件映射在 `lib/labs/registry.ts`。

### 4.2 22 种 Lab 类型（33 个 Lab）

| 单元 | Lab kind | 数量 | 组件 |
| --- | --- | --- | --- |
| c1 图形的运动 | translate / rotate / axis | 5 | MotionLab（SVG 网格动画） |
| c2 统计表 | stats-table / stats-chart | 2 | ChartLab（chart.js 分组条形图 + 统计表） |
| c3 多边形的面积 | area / hectare / composite | 6 | AreaLab（剪拼动画）/ MeasureLab |
| c4 小数乘除 | decimal-mul / decimal-div / decimal-point | 5 | DecimalLab（方格模型 + 竖式） |
| c5 可能性 | spinner / marble | 2 | ChanceLab（加权随机模拟） |
| c6 因数与倍数 | factors / multiples / prime / gcdlcm（+pinboard 探索规律） | 7 | NumberLab / PinboardLab |
| c7 用字母表示数 | frog / square / speed | 4 | FormulaLab |
| c8 观察物体 | views3d | 2 | Views3DLab（three.js 三视图，OrbitControls 可拖拽） |

### 4.3 训练游戏（10 个，`src/lib/games/`）

area-race（面积速算）/ decimal-quiz（小数口算）/ decimal-point（小数点搬家）/
factor-hunt（因数）/ prime-dash（质数快抢，45s 限时）/ gcdlcm-quiz / move-quiz（平移旋转辨识）/
coin-flip（抛硬币统计，animejs 3D 翻转）/ unit-convert（单位换算）/ views-quiz（三视图配对，three.js）。

### 4.4 新增一个 Lab

1. `g5/data/chapters/cN.ts` 加一条 `LabDef`（params 滑块、formula、必要时 fixed）。
2. 若为全新可视化类型：`schema/lab.ts` 扩展 `LabKind`；
   `game/src/lib/labs/compute.ts` 加 `computeLab` 分支（返回 value/text/steps/conclusion）；
   `components/labs/` 写组件并注册到 `lib/labs/registry.ts`。
3. 跑 `npm run test`（validateLabs 自动校验：id 唯一/参数范围/公式存在）+ `npm run typecheck`。

### 4.5 五年级关键约定（踩坑记录）

- **SVG 网格 `v-for="i in n"` 从 1 开始**：画网格线要用 `(i-1) * cell`，否则整体偏移一格并超出 viewBox
  （历史 bug，已修，勿退回 `i * cell`）。
- **SVG 几何必须动态适配**：滑块最大值时图形不能越界。策略：
  - MotionLab 平移：`tCell = min(36, 168/格数)` 动态格宽（含上下方向）；
  - AreaLab：`cellEff` 综合"垂直 2H 限 78px（三角形/梯形）/ 150px（平行四边形）+ 水平 360px"取最小；
    三角形/梯形第二个图形用"淡入拼合"而非滑入（避免几何推导错误和越界）；
  - DecimalLab 方格模型：格宽 `min(20, 200/行数)` 动态缩放，注释放 SVG 外；
  - MeasureLab 组合图形 / FormulaLab 正方形：尺寸按比例缩放并封顶；
  - 因数是"拼长方形"：超过 6×6 的格子上限用"…"截断。
- **`getBBox()` 不含 transform**：SVG 子元素带 transform 属性时 getBBox 是局部坐标，探针要跳过。
- three.js 组件必须在 `<ClientOnly>` 内；`animate` 是 animejs 的，渲染循环函数别命名成 `animate`（命名冲突）。
- `LabDef.fixed` 只放 number；面积图形形状用**数值代码 0/1/2**（parallelogram/triangle/trapezoid），
  通过 `shapeFromCode()` 转换——放字符串会破坏 `ParamValues = Record<string, number>` 类型。
- chart.js 在组件 `onMounted` 里创建、`onBeforeUnmount` 销毁；参数变化用 `watch(datasets)` + `chart.update()`。
- 游戏组件统一用 `components/ui/GameAnswerBar.vue`（选项/输入两种模式，自动重置）。

### 4.6 五年级单元书页

| 单元 | 书页 | | 单元 | 书页 |
| --- | --- | --- | --- | --- |
| c1 图形的运动 | 1–13 | | c5 可能性 | 65–73 |
| c2 统计表 | 17–25 | | c6 因数与倍数 | 74–95 |
| c3 多边形的面积 | 30–50 | | c7 用字母表示数 | 96–109 |
| c4 小数乘除（一） | 55–64 | | c8 观察物体（三） | 112–118 |

探索规律"钉子板上的多边形"（书页 110–111）挂在 c6 单元尾部（`g5/data/chapters/c8.ts` 的 `pinboardLabs`）。

---

## 5. 二年级工程（苏教版上册）

### 5.1 数据层 `g2/data/`

**Lab = 一条 `LabDef`**（`schema/lab.ts`，类型与五年级同款）：id 前缀 `g2-`、
`kind` 17 种、`params` 滑块定义、`fixed` 常量、`formula`。校验器 `validate.ts`
（id 唯一 / 参数范围）；`index.ts` 提供 `findLabById / byChapter / totalLabs=22`。

**设计原则**：数据只声明；**求值逻辑在 `game/src/lib/labs/compute.ts`**（17 种 kind 全在这里，
返回 `{ value/text/steps/conclusion }`）；**渲染逻辑在 `components/labs/`**；kind→组件映射在
`lib/labs/registry.ts`。

### 5.2 17 种 Lab 类型（22 个 Lab）

| 单元 | Lab kind | 数量 | 组件 |
| --- | --- | --- | --- |
| c1 1~6 的表内乘法 | groups / mult-table | 3 | MultLab（几个几点阵→加法→乘法 / 5、6 的乘法口诀） |
| c2 1~6 的表内除法 | divide-share / divide-group / quotient | 3 | DivideLab（平均分点阵 / 每几个一份圈一圈 / 用口诀求商） |
| c3 奇妙的七巧板 | tangram | 1 | TangramLab（7 块板拼正方形，高亮各图案用板） |
| c4 7~9 的表内乘除法 | mult-table / table-calc | 4 | MultLab（n 个 9 比 10n 少 n）/ CalcLab（一句口诀算乘除） |
| c5 生活中的方向 | direction | 1 | DirectionLab（方向板：面向一方辨前后左右） |
| c6 认识三位数 | place-value / compare / abacus | 3 | NumberLab（计数器摆三位数 / 比大小先比百位 / 算盘拨珠上 5 下 1） |
| c7 两位数加、减两位数 | twodigit-add / twodigit-sub | 2 | TwodigitLab（计数器进位加 / 退位减） |
| c8 欢乐购物街 | money / money-calc | 2 | MoneyLab（人民币面额 1 元=10 角 / 付钱找零） |
| c9 有余数的除法 | remainder / remainder-rule | 2 | CalcLab（分物余数 / 余数比除数小） |
| c10 期末复习 | table-calc | 1 | CalcLab（表内乘除四则混合） |

### 5.3 训练游戏（12 个，`src/lib/games/`）

mult-table（九九乘法表）/ divide-quiz（除法口算）/ mix-calc（表内乘除混合）/
divide-share（平均分挑战）/ place-value（三位数拼一拼）/ compare-quiz（三位数比大小）/
abacus（算盘读数）/ twodigit-calc（两位数加减）/ money-change（欢乐购物）/
remainder-quiz（有余数除法）/ direction-quiz（辨认方向）/ tangram-quiz（七巧板拼图）。
游戏组件统一用 `components/ui/GameAnswerBar.vue`（选项/输入两种模式）。

### 5.4 新增一个 Lab

与五年级流程一致（见 §4.4）：`data/chapters/cN.ts` 加 `LabDef` → 新 kind 时扩展
`schema/lab.ts` 的 `LabKind` + `compute.ts` 加分支 + `components/labs/` 写组件并注册到
`lib/labs/registry.ts` → 跑 `npm run test` + `npm run typecheck`。

### 5.5 二年级关键约定（踩坑记录）

- 模板禁止直接读 `props.values.x`（类型是 `number | undefined`）：一律
  `computed(() => props.values.x ?? 默认)` 后再引用（与六年级 §6.5 相同约定）。
- 无 Playwright E2E（未配 `playwright.config.ts`），页面行为由 vitest 组件层覆盖；
  `npm run test:click`（§8 真实点击验收）目前**不含 g2**。
- 跨应用导航/顶栏切换用共享 GradeShell 的原生 `<a>`（见 §3.5 四坑）。
- 类型检查：与五年级同源的一处共享 theme 类型提示（`nuxt/config` 在仓库根无 node_modules）
  属既有基线，其余 0 错误。

### 5.6 二年级单元书页

| 单元 | 书页 | | 单元 | 书页 |
| --- | --- | --- | --- | --- |
| c1 1~6 的表内乘法 | 1–18 | | c6 认识三位数 | 61–73 |
| c2 1~6 的表内除法 | 19–32 | | c7 两位数加、减两位数 | 74–85 |
| c3 奇妙的七巧板 | 33–38 | | c8 欢乐购物街 | 86–90 |
| c4 7~9 的表内乘除法 | 39–55 | | c9 有余数的除法 | 91–97 |
| c5 生活中的方向 | 56–60 | | c10 期末复习 | 98–104 |

---

## 6. 六年级工程（苏教版上册）

### 6.1 数据层 `g6/data/`

**Lab = 一条 `LabDef`**（`schema/lab.ts`，类型与五年级同款）：id 前缀 `g6-`、
`kind` 33 种、`params` 滑块定义、`fixed` 常量、`formula`。校验器 `validate.ts`
（id 唯一 / 参数范围）；`index.ts` 提供 `findLabById / byChapter / totalLabs=33`。

**设计原则**：数据只声明；**求值逻辑在 `game/src/lib/labs/compute.ts`**（33 种 kind 全在这里，
返回 `{ value/text/steps/conclusion }`）；**渲染逻辑在 `components/labs/`**；kind→组件映射在
`lib/labs/registry.ts`。

### 6.2 33 种 Lab 类型（33 个 Lab）

| 单元 | Lab kind | 数量 | 组件 |
| --- | --- | --- | --- |
| c1 小数乘法和除法（二） | mul-decimal / mul-compare / mul-approx / div-decimal / div-approx / round-life | 6 | DecimalLab（方格模型） |
| c2 混合运算与数量关系（三） | frac-mix / estimate-shop / segment / segment-more / work-together | 5 | MixCalcLab / SegmentLab（线段图） |
| c2（附）分段计费 | piecewise | 1 | MixCalcLab |
| c3 数与运算的再认识 | place-value / compare-unit / op-consistency | 3 | NumberLab（数位板） |
| c3（附）二进制的秘密 | binary | 1 | NumberLab（满二进一） |
| c4 比和比例 | ratio-intro / ratio-value / ratio-simplify / ratio-distribute / proportion-basic / solve-proportion | 6 | RatioLab |
| c4（附）神奇的黄金比 | golden-ratio | 1 | RatioLab |
| c5 圆 | circle-feature / sector / circumference / circle-area / annulus / circle-composite | 6 | CircleLab（SVG 圆/扇形/环形） |
| c6 放大与缩小 | scale-shape / map-scale | 2 | ScaleLab（方格纸放大） |
| c7 确定位置 | coordinate / direction | 2 | PositionLab（座位图/方位图） |

### 6.3 训练游戏（12 个，`src/lib/games/`）

decimal-mul（小数乘法口算）/ decimal-div（小数除法口算）/ decimal-points（积的小数位数）/
mix-calc（分数混合运算）/ frac-find（求一个数的几分之几）/ taxi-fare（出租车分段计费）/
binary-quiz（二进制换算）/ compare-quiz（数的大小比较）/ ratio-simplify（化简比）/
solve-ratio（解比例）/ circle-calc（圆的计算）/ scale-map（比例尺换算）。
游戏组件统一用 `components/ui/GameAnswerBar.vue`（选项/输入两种模式）。

### 6.4 新增一个 Lab

与五年级流程一致（见 §4.4）：`data/chapters/cN.ts` 加 `LabDef` → 新 kind 时扩展
`schema/lab.ts` 的 `LabKind` + `compute.ts` 加分支 + `components/labs/` 写组件并注册到
`lib/labs/registry.ts` → 跑 `npm run test` + `npm run typecheck`。

### 6.5 六年级关键约定（踩坑记录）

- **模板禁止直接读 `props.values.x`**（类型是 `number | undefined`，直接 `toFixed(undefined)`
  会抛错且拉低分支覆盖率）：一律 `computed(() => props.values.x ?? 默认)` 后再引用；
  `test/component/labs.test.ts` 有**全 kind 空参数挂载**专门覆盖 `??` 兜底分支。
  （`mul-approx` 早期就因此崩过，已改为 computed 默认。）
- **`div-approx` 海狮游速**：`千米/时 → 米/秒` 必须 ÷3600（不是 ÷60，历史 bug 已修）。
- 无 Playwright E2E（未配 `playwright.config.ts`），页面行为由 vitest 组件层覆盖；
  `npm run test:click`（§8 真实点击验收）目前**不含 g6**。
- 跨应用导航/顶栏切换用共享 GradeShell 的原生 `<a>`（见 §3.5 四坑）。
- 类型检查：与五年级同源的一处共享 theme 类型提示（`nuxt/config` 在仓库根无 node_modules）
  属既有基线，其余 0 错误。

### 6.6 六年级单元书页

| 单元 | 书页 | | 单元 | 书页 |
| --- | --- | --- | --- | --- |
| c1 小数乘法和除法（二） | 1–13 | | c5 圆 | 68–87 |
| c2 混合运算与数量关系（三） | 14–25（附分段计费 26–29） | | c6 放大与缩小 | 92–102 |
| c3 数与运算的再认识 | 30–41（附二进制 42–43） | | c7 确定位置 | 103–111 |
| c4 比和比例 | 44–63（附黄金比 64–67） | | | |

---

## 7. OCR 管线

### 7.1 工具

`ocr/src/ocr.swift`（macOS Vision，编译产物 `ocr/src/ocr_bin`）。用法：

```bash
swiftc -O ocr/src/ocr.swift -o ocr/src/ocr_bin
./ocr/src/ocr_bin "<pdf>" <startPage> <endPage> [输出目录]
```

**第 5 参数（输出目录）必须指定**：缺省写 `ocr/pages`（一年级），
二年级务必传 `g2/ocr/pages`、五年级务必传 `g5/ocr/pages`、六年级传 `g6/ocr/pages`，
否则会覆盖一年级产物（历史事故，已用 git 恢复过一次）。

每页产物：`pNNN.txt`（OCR 文字）、`pNNN.jpg`（整页图）、`pNNN-N.jpg`（插图裁剪，
基于"非文本 + 非纯白"网格瓦片 8-连通聚簇，需 ≥2×2 瓦片且 ≤75% 页面）。

### 7.2 页面映射

- 一年级：书页 = PDF页 - 7（p1 封面 … p6-7 目录）。
- 二年级：书页 = PDF页 - 8（书页 1 = PDF p9），详见 `g2/docs/课本OCR与页面映射.md`。
- 五年级：书页 = PDF页 - 2（p1 封面 / p2 目录），详见 `g5/docs/课本OCR与页面映射.md`。
- 六年级：书页 = PDF页 - 2（p1 封面 / p2 目录），详见 `g6/docs/课本OCR与页面映射.md`。

### 7.3 一年级合订正文

`ocr/src/merge.py` 把 txt/图合并为 `ocr/book/上册_正文.md`（每页 = 标题→整页图→文字→插图片段）。

---

## 8. 测试

| 项目 | 命令（在各工程目录内） | 用例 | 说明 |
| --- | --- | --- | --- |
| 共享层 | `npm run test:shared`（仓库根） | 25 | 独立 vitest（node 环境，覆盖率 100%） |
| 真实点击验收 | `npm run test:click`（仓库根，先 `build:site:local`） | 46 | Playwright 真实浏览器点击：门户↔年级导航/答题/滑块/动画/three.js/移动端溢出 |
| 一年级 | `npm run test` | 311 | vitest 单元 + 组件 |
| 一年级 | `npm run test:e2e` | 34 | Playwright（构建产物运行，20 游戏矩阵） |
| 一年级 | `npm run typecheck` | 0 错误 | vue-tsc（本机 Node 24 下 vue-tsc 插件加载失败属环境问题，见 §12） |
| 二年级 | `npm run test` | 106 | vitest（data/compute/registry/组件/共享 GradeShell） |
| 二年级 | `npm run test:coverage` | 语句/行/分支/函数 ≥95% | v8 |
| 五年级 | `npm run test` | 105 | vitest（data/compute/registry/组件/共享 GradeShell） |
| 五年级 | `npm run test:e2e` | 6 | Playwright（`NITRO_PRESET=node-server` 本地构建） |
| 五年级 | `npm run test:coverage` | 语句/行/分支/函数 ≥95% | v8 |
| 六年级 | `npm run test` | 130 | vitest（data/compute/registry/组件/共享 GradeShell） |
| 六年级 | `npm run test:coverage` | 语句/行/分支/函数 ≥95% | v8 |

> 五年级覆盖率阈值（vitest.config.ts）：statements/lines/functions/branches **均 ≥95%**（当前 99.6/99.6/95/96）。
> 六年级同样四指标 **均 ≥95%**（当前 100/99.17/100/100）。
> 二年级同样四指标 **均 ≥95%**。
> 共享层独立阈值同为 95%。

**页面溢出探针（五年级开发时手写，已删）**：逐页访问 + 滑块拉满，
检查 `scrollWidth - clientWidth`、元素超出视口、SVG bbox 越界、console/pageerror。
新增可视化 Lab 时建议用类似方法回归（playwright 脚本，`--enable-unsafe-swiftshader` 启动参数
可让 headless 支持 WebGL，否则 three.js 页面 canvas 创建失败属于测试环境假象）。

**真实点击验收（仓库根 `npm run test:click`）**：基于聚合产物 `deploy/` 起静态服务，
真实 Chromium 点击覆盖：门户→一年级→五年级→回门户完整链路、11 种一年级题型答题、
11 个五年级 Lab 渲染、Lab 滑块联动/剪拼动画、three.js 页、移动端(375px) 横向溢出检查，
共 46 项；脚本 `scripts/real-click-test.mjs`，截图输出 `/tmp/math-shots/`。
> ⚠️ 该脚本目前**未覆盖二/六年级**（g2/g6 Lab/游戏未列入点击矩阵），新增 g2/g6 内容后建议补充。

---

## 9. 部署（单 Cloudflare Pages）

### 9.1 架构

```
GitHub: tesths/math-stage（main 分支）
        └─ npm run build:site（Cloudflare 构建命令）
              ├─ game/   : npm ci + BASE_URL=/g1/ nuxi generate → 111 页静态
              ├─ g2/game/: npm ci + BASE_URL=/g2/ nuxi generate → 48 页静态
              ├─ g5/game/: npm ci + BASE_URL=/g5/ nuxi generate → 55 页静态
              ├─ g6/game/: npm ci + BASE_URL=/g6/ nuxi generate → 56 页静态
              └─ portal/ : npm ci + BASE_URL=/ nuxi generate（门户 Nuxt 应用）
              → 聚合产物 deploy/
Cloudflare Pages 输出目录 deploy/
  /       门户（Nuxt 静态站，卡片用原生 <a href="/g1/" "/g2/" "/g5/" "/g6/">）
  /g1/*   一年级（111 页全量预渲染，直接命中静态文件）
  /g2/*   二年级（48 页全量预渲染，直接命中静态文件）
  /g5/*   五年级（55 页全量预渲染，直接命中静态文件）
  /g6/*   六年级（56 页全量预渲染，直接命中静态文件）
  404     由各子应用自带 404.html 兜底
```

### 9.2 关键配置点

- **五个 nuxt.config.ts 都从 `shared/theme/nuxt-config.ts` 引入统一片段**：
  `sharedNuxtConfig({...})` 提供 UI 离线字体 / 图标按需扫描（含共享组件图标清单）/ 主色 emerald /
  三方库优化 / 预渲染策略；各应用再覆盖 `nitro.prerender.ignore`（跨年级链接）与 `app`（baseURL/head）。
- **`app.baseURL = process.env.BASE_URL ?? '/'`**（本地默认根路径）；
  `nitro.prerender.crawlLinks = true`（静态导出时自动爬取全部路由）。
- **`nuxi generate`（Nuxt4 cloudflare-pages preset）输出到 `.output/public`**：
  页面在根目录（index.html 即应用首页），资源链接带 BASE_URL 前缀（`/g1/_nuxt/...`）；
  聚合脚本复制 `.output/public` → `deploy/gX`。
- **`scripts/site-build.mjs`**：清空 deploy → 对五个应用执行 `npm ci`（`build:site:local` 才跳过安装）→
  分别 `BASE_URL=... nuxi generate` → 复制 `.output/public` → 写 `_redirects`（仅注释）/`_headers`。
  ⚠️ 不要在 `_redirects` 里加 `/g1/* → /g1/200.html 200` 这类 SPA 重写：
  它会在 Cloudflare 上抢在静态文件前命中目录请求，被 clean URL 解析成 `/g1/200`，造成 308 循环（线上事故记录）。
- 根 `package.json`（无依赖，仅脚本）：`build:site` / `build:site:local`（跳过安装）/ `preview`。

### 9.3 Cloudflare Pages 配置（一次）

| 项 | 值 |
| --- | --- |
| 框架预设 | None |
| 构建命令 | `npm run build:site` |
| 构建输出目录 | `deploy` |

首次构建需装五个应用依赖，约 10~20 分钟（免费额度 20 分钟内）；若超时，
把脚本里 `npm ci` 改 `npm install`（利用 Cloudflare 构建缓存）或拆分触发。

### 9.4 本地构建与预览

```bash
npm run build:site:local   # 聚合构建（跳过五个应用依赖安装）
npx serve deploy           # 或 cd deploy && python3 -m http.server 4100
```

### 9.5 新增年级（三年级等）

1. 新建独立 Nuxt 工程（如 `g3/`），复制五年级/六年级的 nuxt.config 骨架
   （含 `sharedNuxtConfig` 引入、`BASE_URL` 支持、`@shared` alias）。
2. **`shared/grades/index.ts` 加一条 `GradeInfo` 记录**（id/base/label/title/accent/features…）——
   门户卡片、顶栏切换、页脚文案自动生成，无需改 portal 页面。
3. `scripts/site-build.mjs` 的 `APPS` 数组加一项 `{ dir: 'g3', base: '/g3/' }`。
4. Cloudflare 无需改动（构建命令/输出目录不变）。

---

## 10. 本地开发日常

| 场景 | 命令 |
| --- | --- |
| 一年级 dev | `cd game && npm run dev`（PORT 3000） |
| 二年级 dev | `cd g2/game && npm run dev`（PORT 3000，勿同时开两个 dev 端口冲突，可用 PORT=3200） |
| 五年级 dev | `cd g5/game && npm run dev`（PORT 3000，勿同时开两个 dev 端口冲突，可用 PORT=3100） |
| 六年级 dev | `cd g6/game && npm run dev`（PORT 3000，与五年级错开端口） |
| 一年级测试 | `cd game && npm run test` |
| 二年级测试 | `cd g2/game && npm run test` |
| 五年级测试 | `cd g5/game && npm run test` |
| 六年级测试 | `cd g6/game && npm run test` |
| 二年级覆盖率 | `cd g2/game && npm run test:coverage` |
| 五年级覆盖率 | `cd g5/game && npm run test:coverage` |
| 六年级覆盖率 | `cd g6/game && npm run test:coverage` |
| 五年级 E2E | `cd g5/game && npm run test:e2e`（自动 NITRO_PRESET=node-server 构建，端口 3100） |
| 类型检查 | `cd <game|g2/game|g5/game|g6/game> && npm run typecheck` |
| 聚合构建 | 仓库根 `npm run build:site:local` |

> E2E 端口注意：一年级 e2e 用 3000；五年级用 3100 且 `reuseExistingServer: true`，
> 若端口被旧服务占用会连错应用（曾经连到一年级 dev server 的教训），跑前确认端口空闲。
> dev 端口注意：四个年级 dev 默认都用 3000，**同时只能开一个**；错开用 `PORT=3100/3200`。

---

## 11. 命令速查

```bash
# 部署相关（仓库根）
npm run build:site          # 完整聚合构建（含五个应用 npm ci，Cloudflare 用）
npm run build:site:local    # 本地聚合（跳过依赖安装）
npm run preview             # npx serve deploy
npm run test:shared         # 共享层测试（25 用例，复用 g5/game 的 vitest）
npm run test:shared:coverage # 共享层覆盖率（阈值 95%）
npm run test:click          # 真实点击验收（需先 build:site:local；46 项，暂不含 g2/g6）

# 单工程（game/、g2/game/、g5/game/ 或 g6/game/ 内）
npm run dev                 # 开发
npm run test                # vitest
npm run test:coverage       # 覆盖率
npm run test:e2e            # Playwright（五年级）
npm run typecheck           # vue-tsc
npm run build               # 生产构建
npm run generate:site       # 静态导出（配合 BASE_URL=/g1/、/g2/、/g5/ 或 /g6/）

# OCR
swiftc -O ocr/src/ocr.swift -o ocr/src/ocr_bin
./ocr/src/ocr_bin "pdf路径" 1 120 "g2/ocr/pages"   # 二年级务必带输出目录
./ocr/src/ocr_bin "pdf路径" 1 131 "g5/ocr/pages"   # 五年级务必带输出目录
./ocr/src/ocr_bin "pdf路径" 1 131 "g6/ocr/pages"   # 六年级同上
```

---

## 12. 排错速查

| 现象 | 原因/处理 |
| --- | --- |
| 五年级 SVG 图形越界/被裁 | 几何没做动态适配，参照 §4.5 的策略（动态格宽/缩放/封顶） |
| 网格线整体偏移一格 | `v-for="i in n"` 从 1 开始，须用 `(i-1)*cell` |
| three.js 页面 canvas 空白 | 本地检查用 playwright `--enable-unsafe-swiftshader`；真实浏览器均有 WebGL |
| `npm run test:e2e` 连到错误站点 | 端口被旧服务占用（3000/3100），先 `lsof -i :3000 -i :3100` 清掉 |
| vue-tsc 报 `Load plugin failed: vue-router/volar/sfc-route-blocks` | Node 24 + vue-tsc 2.2 环境兼容问题（各工程均如此，非代码问题）；用 `nuxt build` + vitest 保证类型/行为正确 |
| 二/五/六年级 `vue-tsc` 报 `Cannot find module 'nuxt/config'`（shared/theme/nuxt-config.ts） | 仓库根无 node_modules，该共享文件里的类型导入无法从仓库根解析——二/五/六年级同源，属既有基线；`nuxt build` 不受影响（Nuxt 用自己的解析） |
| 部署后主色仍是旧色（一年级橙/门户蓝） | 聚合脚本曾复制旧 `dist/`；已改为复制 `.output/public`，重新 `npm run build:site:local` |
| 部署后 /g1/ 404 | 确认 Cloudflare 构建命令是 `npm run build:site`、输出目录 `deploy`；真实页面应已预渲染到 `deploy/g1/` |
| 从门户/年级点卡片进到 404（Nuxt 404 页） | 跨应用链接用了 NuxtLink/UButton → 改原生 `<a href>`（见 §3.5/§4.5 跨应用导航四坑） |
| 点击后 URL 是 /g5/200 且 404/循环 | 旧版 `_redirects` SPA 200 重写残留 → 已删；若浏览器缓存，硬刷新/清缓存/Cloudflare Purge |
| nuxt generate 构建中断（crawler 404） | 页面里有跨应用链接被 crawler 爬 → 保持 `prerender.failOnError: false`；门户保持 `crawlLinks: false + routes: ['/']` |
| 二/五年级 OCR 覆盖一年级 | ocr_bin 第 5 参数必须传输出目录，勿在仓库根无参运行 |
| nuxt generate 只出 2 页 | `nitro.prerender.crawlLinks` 未开启（各工程已默认开启） |
