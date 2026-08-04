# 小学数学互动学习平台 —— 开发文档

> 面向后续开发者/维护者的完整说明。覆盖：项目架构、两个年级工程的内部结构、
> 数据格式、新增内容的标准流程、OCR 管线、测试、单 Cloudflare Pages 部署。
> 快速命令见文末 [§9 命令速查](#9-命令速查)。

---

## 1. 项目总览

一个 GitHub 仓库（`tesths/math-stage`）、**一个** Cloudflare Pages 部署，
同时承载两个年级的互动学习内容，外加一个门户首页：

| 部分 | 位置 | 内容 | 技术 |
| --- | --- | --- | --- |
| 门户 | `portal/` | 年级入口（深色卡片页） | 纯静态 HTML/CSS，零依赖 |
| 一年级 | `data/` + `game/` | 人教版一年级上册：78 道例题答题游戏 + 20 个小游戏 | Nuxt 4 + Nuxt UI（主色 orange） |
| 五年级 | `g5/data/` + `g5/game/` | 苏教版五年级上册：33 个可调参数可视化 Lab + 10 个训练游戏 | Nuxt 4 + Nuxt UI（主色 emerald）+ three.js / chart.js / animejs / jsxgraph |

部署后路由：`/` 门户，`/g1/*` 一年级，`/g5/*` 五年级。
两个年级是**完全独立的 Nuxt 工程**（管理上分开），构建时由 `scripts/site-build.mjs`
各自静态导出到子路径并聚合为一个产物 `deploy/`。

### 1.1 核心技术栈（两个工程一致）

- Nuxt 4（`srcDir: src/`）+ Vue 3 + vue-router
- Nuxt UI v4（`appConfig.ui.colors.primary` 定义主题色；`ui.fonts: false` 离线）
- three.js（五年级三视图）、animejs v4（动画）、chart.js v4（统计图）、jsxgraph（数轴，备用）
- Vitest（单元/组件）+ Playwright（E2E）+ vue-tsc（类型检查）
- nitro preset `cloudflare-pages`（部署）；E2E 用 `NITRO_PRESET=node-server` 本地构建

### 1.2 课本来源

| 年级 | 课本 | PDF | 页数 | 书页偏移 |
| --- | --- | --- | --- | --- |
| 一年级 | 人教版（2022 课标） | `（根据2022年版课程标准修订）义务教育教科书•数学一年级上册.pdf` | 105 | 书页 = PDF页 - 7 |
| 五年级 | 苏教版（2022 课标） | `最新【苏教版】5年级数学课本•上册.pdf` | 131 | 书页 = PDF页 - 2 |

---

## 2. 仓库结构

```
math/
├── README.md                  总入口说明（含部署章节）
├── docs/
│   ├── DEVELOPMENT.md         本文件（开发文档）
│   ├── example-audit.md       一年级例题核对报告
│   └── 游戏形式调研.md        一年级 20 个小游戏的课本出处调研
├── portal/                    门户（index.html / style.css / README.md）
├── package.json               根：build:site / build:site:local / preview
├── scripts/
│   ├── site-build.mjs         单 Pages 聚合构建脚本
│   └── verify_examples.py     一年级例题↔课本 OCR 机器核对
│
├── ── 一年级工程（人教版上册）──
├── data/
│   ├── schema/example.ts      例题类型定义（11 类题型）
│   ├── schema/validate.ts     运行时校验器
│   ├── chapters/meta.ts       9 单元元信息（书页区间/图标/简介）
│   ├── chapters/c1.ts … c9.ts 各单元例题（共 78 道）
│   └── index.ts               汇总（findById / byChapter）
├── game/                      Nuxt4 应用（主色 orange）
│   ├── src/lib/engine/        纯逻辑引擎（checker/count/position/generator/registry）
│   ├── src/lib/arcade/        20 个小游戏引擎 + 元数据 + slug→组件注册表
│   ├── src/lib/storage.ts     localStorage 安全封装
│   ├── src/lib/sound.ts       WebAudio 合成音效
│   ├── src/components/games/  8 个教材题类组件（Count/AddSub/Compare…）
│   ├── src/components/arcade/ 20 个小游戏组件
│   ├── src/components/ui/     QuestionCard / AnswerPad / FeedbackOverlay
│   ├── src/pages/             index / units/[id] / play/[id] / games/[slug] / games/
│   ├── test/                  vitest（308 用例）+ e2e/（Playwright 34 用例）
│   └── nuxt.config.ts         baseURL 支持 BASE_URL env；prerender.crawlLinks
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
│   └── game/                  Nuxt4 应用（主色 emerald）
│       ├── src/lib/engine/math.ts   纯数学工具（因数/质数/gcd/lcm/面积/皮克）
│       ├── src/lib/labs/             Lab 计算引擎（compute.ts）+ kind→组件注册表
│       ├── src/lib/games/            10 个游戏元数据 + slug→组件注册表
│       ├── src/lib/storage.ts / sound.ts
│       ├── src/components/labs/      9 个可视化组件（SVG + three.js + chart.js）
│       ├── src/components/games/     10 个训练游戏组件
│       ├── src/components/ui/        GameAnswerBar（选项/输入两种模式）
│       ├── src/pages/                index / units/[id] / labs/[id] / games/[slug] / games/
│       ├── test/                     vitest（41 用例）+ e2e/（Playwright 6 用例）
│       └── nuxt.config.ts            baseURL + prerender.crawlLinks；chart.js 依赖
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

## 5. OCR 管线

### 5.1 工具

`ocr/src/ocr.swift`（macOS Vision，编译产物 `ocr/src/ocr_bin`）。用法：

```bash
swiftc -O ocr/src/ocr.swift -o ocr/src/ocr_bin
./ocr/src/ocr_bin "<pdf>" <startPage> <endPage> [输出目录]
```

**第 5 参数（输出目录）必须指定**：缺省写 `ocr/pages`（一年级），
五年级务必传 `g5/ocr/pages`，否则会覆盖一年级产物（历史事故，已用 git 恢复过一次）。

每页产物：`pNNN.txt`（OCR 文字）、`pNNN.jpg`（整页图）、`pNNN-N.jpg`（插图裁剪，
基于"非文本 + 非纯白"网格瓦片 8-连通聚簇，需 ≥2×2 瓦片且 ≤75% 页面）。

### 5.2 页面映射

- 一年级：书页 = PDF页 - 7（p1 封面 … p6-7 目录）。
- 五年级：书页 = PDF页 - 2（p1 封面 / p2 目录），详见 `g5/docs/课本OCR与页面映射.md`。

### 5.3 一年级合订正文

`ocr/src/merge.py` 把 txt/图合并为 `ocr/book/上册_正文.md`（每页 = 标题→整页图→文字→插图片段）。

---

## 6. 测试

| 项目 | 命令（在各工程目录内） | 用例 | 说明 |
| --- | --- | --- | --- |
| 一年级 | `npm run test` | 308 | vitest 单元 + 组件 |
| 一年级 | `npm run test:e2e` | 34 | Playwright（构建产物运行，20 游戏矩阵） |
| 一年级 | `npm run typecheck` | 0 错误 | vue-tsc |
| 五年级 | `npm run test` | 41 | vitest（data/compute/registry/组件） |
| 五年级 | `npm run test:e2e` | 6 | Playwright（`NITRO_PRESET=node-server` 本地构建） |
| 五年级 | `npm run test:coverage` | 语句/行 ≥90% | v8 |

> 五年级覆盖率阈值：statements/lines 90、branches 60、functions 50（组件多为 UI，
> 核心计算引擎 compute.ts / math.ts 已充分覆盖）。

**页面溢出探针（五年级开发时手写，已删）**：逐页访问 + 滑块拉满，
检查 `scrollWidth - clientWidth`、元素超出视口、SVG bbox 越界、console/pageerror。
新增可视化 Lab 时建议用类似方法回归（playwright 脚本，`--enable-unsafe-swiftshader` 启动参数
可让 headless 支持 WebGL，否则 three.js 页面 canvas 创建失败属于测试环境假象）。

---

## 7. 部署（单 Cloudflare Pages）

### 7.1 架构

```
GitHub: tesths/math-stage（main 分支）
        └─ npm run build:site（Cloudflare 构建命令）
              ├─ game/   : npm ci + BASE_URL=/g1/ nuxi generate → 111 页静态
              ├─ g5/game/: npm ci + BASE_URL=/g5/ nuxi generate → 55 页静态
              └─ portal/ : 复制静态页
              → 聚合产物 deploy/
Cloudflare Pages 输出目录 deploy/
  /       门户（index.html，相对链接 ./g1/ ./g5/）
  /g1/*   一年级（111 页全量预渲染，直接命中静态文件）
  /g5/*   五年级（55 页全量预渲染，直接命中静态文件）
  404     由各子应用自带 404.html 兜底
```

### 7.2 关键配置点

- **两个 nuxt.config.ts 都支持**：`app.baseURL = process.env.BASE_URL ?? '/'`（本地默认根路径，不受影响）；
  `nitro.prerender.crawlLinks = true`（静态导出时自动爬取全部路由）。
- **`nuxi generate` 输出到 `dist/`**（cloudflare-pages preset），聚合脚本复制 `dist/gX` 到 `deploy/gX`。
- **`scripts/site-build.mjs`**：清空 deploy → 对两个子应用 `npm ci`（本地已装则跳过）→
  `BASE_URL=... npm run generate:site` → 复制 portal 与子路径 → 写 `_redirects`（仅注释）/`_headers`。
  ⚠️ 不要在 `_redirects` 里加 `/g1/* → /g1/200.html 200` 这类 SPA 重写：
  它会在 Cloudflare 上抢在静态文件前命中目录请求，被 clean URL 解析成 `/g1/200`，造成 308 循环（线上事故记录）。
- 根 `package.json`（无依赖，仅脚本）：`build:site` / `build:site:local`（跳过安装）/ `preview`。

### 7.3 Cloudflare Pages 配置（一次）

| 项 | 值 |
| --- | --- |
| 框架预设 | None |
| 构建命令 | `npm run build:site` |
| 构建输出目录 | `deploy` |

首次构建需装两个子应用依赖，约 8~15 分钟（免费额度 20 分钟内）；若超时，
把脚本里 `npm ci` 改 `npm install`（利用 Cloudflare 构建缓存）或拆分触发。

### 7.4 本地构建与预览

```bash
npm run build:site:local   # 聚合构建（跳过子应用依赖安装）
npx serve deploy           # 或 cd deploy && python3 -m http.server 4100
```

### 7.5 新增年级（三年级等）

1. 新建独立 Nuxt 工程（如 `g3/`），复制一年级/五年级的 nuxt.config 骨架
   （含 `BASE_URL` 支持、`prerender.crawlLinks`、Nuxt UI 离线配置）。
2. `scripts/site-build.mjs` 的 `APPS` 数组加一项 `{ dir: 'g3', base: '/g3/' }`。
3. `portal/index.html` 加一张年级卡片，链接 `./g3/`。
4. Cloudflare 无需改动（构建命令/输出目录不变）。

---

## 8. 本地开发日常

| 场景 | 命令 |
| --- | --- |
| 一年级 dev | `cd game && npm run dev`（PORT 3000） |
| 五年级 dev | `cd g5/game && npm run dev`（PORT 3000，勿同时开两个 dev 端口冲突，可用 PORT=3100） |
| 一年级测试 | `cd game && npm run test` |
| 五年级测试 | `cd g5/game && npm run test` |
| 五年级覆盖率 | `cd g5/game && npm run test:coverage` |
| 五年级 E2E | `cd g5/game && npm run test:e2e`（自动 NITRO_PRESET=node-server 构建，端口 3100） |
| 类型检查 | `cd <game|g5/game> && npm run typecheck` |
| 聚合构建 | 仓库根 `npm run build:site:local` |

> E2E 端口注意：一年级 e2e 用 3000；五年级用 3100 且 `reuseExistingServer: true`，
> 若端口被旧服务占用会连错应用（曾经连到一年级 dev server 的教训），跑前确认端口空闲。

---

## 9. 命令速查

```bash
# 部署相关（仓库根）
npm run build:site          # 完整聚合构建（含子应用 npm ci，Cloudflare 用）
npm run build:site:local    # 本地聚合（跳过依赖安装）
npm run preview             # npx serve deploy

# 单工程（game/ 或 g5/game/ 内）
npm run dev                 # 开发
npm run test                # vitest
npm run test:coverage       # 覆盖率（五年级）
npm run test:e2e            # Playwright
npm run typecheck           # vue-tsc
npm run build               # 生产构建（cloudflare-pages preset → dist/）
npm run generate:site       # 静态导出（配合 BASE_URL=/g1/ 或 /g5/）

# OCR
swiftc -O ocr/src/ocr.swift -o ocr/src/ocr_bin
./ocr/src/ocr_bin "pdf路径" 1 131 "g5/ocr/pages"   # 五年级务必带输出目录
```

---

## 10. 排错速查

| 现象 | 原因/处理 |
| --- | --- |
| 五年级 SVG 图形越界/被裁 | 几何没做动态适配，参照 §4.5 的策略（动态格宽/缩放/封顶） |
| 网格线整体偏移一格 | `v-for="i in n"` 从 1 开始，须用 `(i-1)*cell` |
| three.js 页面 canvas 空白 | 本地检查用 playwright `--enable-unsafe-swiftshader`；真实浏览器均有 WebGL |
| `npm run test:e2e` 连到错误站点 | 端口被旧服务占用（3000/3100），先 `lsof -i :3000 -i :3100` 清掉 |
| 部署后 /g1/ 404 | 确认 Cloudflare 构建命令是 `npm run build:site`、输出目录 `deploy`；_redirects 兜底已生成 |
| 五年级 OCR 覆盖一年级 | ocr_bin 第 5 参数必须传输出目录，勿在仓库根无参运行 |
| nuxt generate 只出 2 页 | `nitro.prerender.crawlLinks` 未开启（两个工程已默认开启） |
