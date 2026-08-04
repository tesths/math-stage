# 义务教育教科书·数学 —— OCR 与例题可视化 / 小游戏

本仓库包含两个年级的独立工程：

| 年级 | 课本 | 位置 | 内容 |
| --- | --- | --- | --- |
| 门户 | — | `portal/`（纯静态）+ 聚合脚本 `scripts/site-build.mjs` | **单 Cloudflare Pages 部署**：`/` 门户、`/g1/` 一年级、`/g5/` 五年级（详见文末部署章节） |
| 一年级（人教版·2022 课标） | 一年级上册扫描 PDF | `data/` + `game/` | 78 道例题答题游戏 + 20 个小游戏（详见下） |
| 五年级（苏教版·2022 课标） | 最新【苏教版】5年级数学课本•上册.pdf | `g5/`（独立文件夹） | **33 个可调参数例题可视化 Lab**（three.js 三视图可拖拽、chart.js 统计图、多边形面积剪拼等）+ 10 个训练小游戏（详见 `g5/README.md`） |

---

# 一年级：例题游戏（人教版上册）

将人教版（2022 版课标）一年级上册扫描 PDF，通过 macOS Vision 做图文识别，产出**图文对照的合订正文**；再人工整理为结构化"例题"，在一个 Nuxt4 + Vue3 的互动小游戏网站上以游戏形式呈现。

## 目录结构

```
math/
├── README.md                      本文件（维护总入口，含五年级 g5/ 指引）
├── g5/                             五年级（苏教版上册）独立文件夹：
│   ├── README.md                  五年级工程说明
│   ├── ocr/pages/                 课本 OCR（书页 = PDF页 - 2）
│   ├── data/                      31 个可调参数 Lab 数据
│   ├── game/                      五年级 Nuxt4 应用（Nuxt UI + three.js）
│   └── docs/                      课本 OCR 与页面映射
├── （…）·数学一年级上册.pdf        原始扫描 PDF（105 页）
├── ocr/                           一年级文字识别管线
│   ├── src/ocr.swift              可执行 OCR：文字 + 整页图 + 插图自动裁剪
│   ├── src/ocr_bin                ocr.swift 的编译产物（swiftc -O 生成）
│   ├── src/merge.py               txt/图 → 上册_正文.md
│   ├── pages/p001.txt             每页 OCR 文字（文本）
│   ├── pages/p001.jpg             每页整版原图（图文对照）
│   ├── pages/p001-1.jpg           自动识别的插图片段（非文字版面区）
│   └── book/上册_正文.md         合订图文版正文字册
│       book/上册_目录.md          目录（OCR 原样）
├── data/                          例题数据（由 OCR 结果人工整理）
│   ├── schema/example.ts          数据 Schema + 校验器（source / tocLabel）
│   ├── chapters/meta.ts           单元元信息（标题/tocLabel/书页/图标/简介）
│   ├── chapters/c1.ts … c9.ts     9 个单元例题（78 道，带 source 题源小节）
│   └── index.ts                   汇总结点（findById / examplesOfChapter …）
├── scripts/verify_examples.py 例题 ↔ 课本文字机器核对（STRONG/MEDIUM/FIG 三级证据）
├── game/                          Nuxt4 前端工程（Nuxt UI 界面，主色 orange）
│   ├── src/assets/css/main.css    Nuxt UI v4 必填 CSS 入口（tailwindcss + @nuxt/ui）
│   ├── src/lib/engine/            纯逻辑引擎（checker/position/count/generator/registry）
│   │   ├── src/lib/arcade/        20 个小游戏纯逻辑引擎（warbattle/frogjump/matchstick…）
│   │   ├── src/lib/storage.ts     localStorage 安全封装（音效静默持久化）
│   │   ├── src/lib/sound.ts       WebAudio 音效 + 静默持久化
│   │   ├── src/layouts/default.vue    全局布局（顶栏 / 容器 / 页脚）
│   │   ├── src/components/games/      8 个教材题类组件（与 data/ 例题一一对应）
│   │   ├── src/components/arcade/     20 个课本主题小游戏（加数朋友/海底拾珠/数独…）
│   │   │   src/components/ui/     QuestionCard / AnswerPad / FeedbackOverlay（Nuxt UI 组件）
│   │   ├── src/pages/index.vue        首页（课本目录 9 单元 + 玩法演示 11 题型 + 游戏专区按单元分组）
│   │   │   units/[id].vue             单元页（例题清单 + 来源标签）
│   │   │   play/[id].vue              答题页（书页/来源标签 + anime 入场动画）
│   │   │   games/[slug].vue           小游戏页（20 个 /games/* 路由）
│   │   ├── vitest.config.ts           单元 + 组件测试（覆盖率阈值 ≥95%）
│   │   ├── playwright.config.ts       E2E（构建产物运行）
│   │   └── e2e/smoke.spec.ts          冒烟用例 + games.spec.ts（34 个 E2E）
└── docs/                          其他文档
    ├── example-audit.md           例题逐条核对报告（书页↔课本原文，含需看图复核清单）
    └── 游戏形式调研.md            20 个小游戏的课本出处/玩法设计调研
```

## OCR 管线（文字 + 图片）

命令行：`swiftc -O ocr/src/ocr.swift -o ocr/src/ocr_bin && ./ocr/src/ocr_bin "<pdf>" 1 105`

每页输出三样产物：

| 产物 | 来源 | 用途 |
| --- | --- | --- |
| `pages/pNNN.txt` | Vision `VNRecognizeTextRequest`（zh-Hans + en-US，`.accurate`） | 纯文字提取 |
| `pages/pNNN.jpg` | 页面 PDFKit 2.0x 渲染 → JPEG(0.85) | 整页原图（图文对照） |
| `pages/pNNN-N.jpg` | 网格瓦片聚簇自动裁出"非文本 + 非纯白"区域 | 插图/示意图片段 |

插图识别启发式：页面按 6×5 网格分瓦片，某瓦片"文字覆盖率 ≤55% 且采样子像素非白占比 ≥10%"则标为插图候选，8-连通聚簇为矩形；要求面积 ≥ 2×2 瓦片、≤整页 75%（更大即整页，避免与整页图重复）。

然后 `python3 ocr/src/merge.py` 生成合订 `ocr/book/上册_正文.md`：每页即"标题 → 整页图 → OCR 文字 → 插图片段"，共嵌入 182 张图（105 整页 + 77 插图）。

### 页面映射约定

- 书页页码 = PDF 页码 - 7（书页 1 = PDF p8）。
- 前页：p1 封面 / p2 书名 / p3 版权 / p4 致同学 / p5 空白 / p6-7 目录。
- 后页：p102-103 附页卡片 / p104 后记 / p105 空白。
- 空白页 p005 / p007 / p105 → 无文字、跳过插图。

## 例题数据

`data/` 以 TS 类型 + 运行时校验器（`validate.ts`）保证结构正确，共 78 道，覆盖
11 类题型：count / write / split / addsub / compare / position / ordinal /
shape3d / numberline / sequence / ten。位置判定规则：左/上/前取前一项，否则取后一项。

分类字段：
- `source`（题源小节）：例题 36 / 想想做做 14 / 练习 14 / 活动 10 / 试一试 4；
  单元列表与答题卡显示该标签，区分课本"主情景例题"与"习题改编"。
- `tocLabel`（课本目录序号）：一~五，仅五个编号单元有；游戏/活动单元为空，
  首页与单元页按课本目录样式显示。

新增一道例题 = 在对应 `chapters/cN.ts` 加一条符合 `schema/example.ts` 的记录并保证通过校验器。

**例题准确性（机器核对）**：源码 `scripts/verify_examples.py` 对每条例题在该题
标注书页的 OCR 文字中查"印刷证据"，三级结论：STRONG 64（算式/不等式/填空/关键数
与课本印刷一致）、MEDIUM 9（故事题/文字题可在该页印证）、FIG 5（仅图内数量，全在
第 1 单元，需人工看图）。跨课本逐条对照见 `docs/example-audit.md`。

## 测试与构建

`game/` 目录内：

```bash
npm run test          # vitest（单元 + 组件），308 用例全绿
npm run test:coverage # 覆盖率（statements 100% / branches 99.9% / lines 100% / functions 100%）
npm run test:e2e      # Playwright 34 个 E2E（含 20 个小游戏页矩阵，构建产物运行）
npm run typecheck     # vue-tsc 类型检查，0 报错
npm run dev           # 开发（PORT 3000）
npm run build | nuxt build
npm run generate      # 静态导出 dist/（含 units/、play/、games/ 全部路由）
```

已知约定（极易踩坑）：
- `test/nuxt/`（`@vitest-environment nuxt`）页面测试在本工程环境本就无法初始化
  （最小 smoke 同样失败），`npm run test` 不含它们；页面由 Playwright e2e 覆盖，
  不要尝试单独启用。
- 覆盖率分支统计对 `??`/`||`/可选链判空等防御分支零容忍：组件内禁止
  出现测试覆盖不到的空值兜底，用 `!`/索引断言（`deck.value[a]!`）替代
  `?? 0`/`?.x ?? 0`，否则会拉低 branches 阈值。
- emoji 数量统计必须用 `visibleUnits()/countUnits()`（剥变体选择符），否则 ⛹=2 码会数错。
- animejs v4 无 default 导出，用 `import { animate }`。
- Nuxt UI v4 的 `ui.fonts` 需显式置 `false`（离线环境不拉 Google Fonts），
  自定义图标须安装 `@iconify-json/heroicons`、`@iconify-json/lucide` 并开启
  `icon.clientBundle.scan`，否则 SSR 运行时图标无法解析。
- Nuxt UI v4 必须显式提供 CSS 入口 `src/assets/css/main.css`：
  `@import "tailwindcss"; @import "@nuxt/ui";`，缺失时全站无任何样式。
- Nuxt 4 中 `appConfig` 是**顶层配置键**（写在 `app:` 下会静默失效），
  UI 主题色在 `nuxt.config.ts` 顶层 `appConfig.ui.colors.primary`。
- 游戏组件样式统一使用 Nuxt UI 设计令牌（`--ui-primary`、`--ui-bg-*`、
  `--ui-border-*`、`--ui-text-*`、`--ui-radius-*`、`--ui-color-{color}-{shade}`），
  禁止硬编码色值；文本淡化统一用 `text-(--ui-text-muted)`（`--ui-muted` 不是有效令牌）。
- 游戏组件自带答题反馈浮层，页面层不要再叠加 FeedbackOverlay。
- 小游戏引擎/组件新增时必须同步：`src/lib/arcade/registry.ts` 注册路由 slug、
  组件级 vitest 测试、`e2e/games.spec.ts` 矩阵 [slug, 根类, 交互类] 三条，否则 E2E 漏覆盖。
- 游戏元数据 `src/lib/arcade/index.ts` 的 `chapters` 字段标注适用单元（c1~c9），
  驱动首页按单元分组和 `/games` 卡片徽章；增删游戏务必同步该字段与 `unitNoOf()` 测试
  （`test/unit/arcade/games.test.ts` 最后一组 describe），缺口会让首页分组/徽章失真。

## 单 Cloudflare Pages 部署（门户 + 一年级 + 五年级）

一个 GitHub 仓库、**一个** Cloudflare Pages 项目，门户在 `/`、一年级在 `/g1/`、五年级在 `/g5/`。
两个年级仍是独立 Nuxt 工程（管理上分开），构建时聚合为一个产物 `deploy/`。

```
部署产物 deploy/
├── index.html    门户（portal/，链接 ./g1/ 与 ./g5/）
├── g1/           一年级（game/，BASE_URL=/g1/ 静态导出，111 页）
├── g5/           五年级（g5/game/，BASE_URL=/g5/ 静态导出，55 页）
└── _redirects    SPA 兜底（/g1/* → 200.html、/g5/* → 200.html）
```

### 本地构建与预览

```bash
npm run build:site:local   # 聚合构建（跳过子应用依赖安装）
npx serve deploy           # 或 cd deploy && python3 -m http.server 4100
```

### Cloudflare Pages 配置（一次）

1. 把本仓库推送到 GitHub。
2. Cloudflare Dashboard → Workers & Pages → Create → **Pages → Connect to Git**，选本仓库。
3. 构建设置：
   | 项 | 值 |
   | --- | --- |
   | 框架预设 | None |
   | 构建命令 | `npm run build:site`（脚本内自动对 game/、g5/game/ 执行 `npm ci` 并分别 `nuxi generate`） |
   | 构建输出目录 | `deploy` |
4. 保存并部署。以后推送 `main` 分支即自动构建。

> 首次构建需要安装两个子应用的依赖，约 8~15 分钟（免费额度 20 分钟以内）。
> 若超时，可在两个子应用各自提交后，把 `scripts/site-build.mjs` 中 `npm ci` 改为
> `npm install`（Cloudflare 构建缓存命中后更快），或拆分触发。

### 新增年级（三年级等）

1. 新建独立 Nuxt 工程（如 `g3/`，管理上独立），同样配置 `BASE_URL` 与 `nitro.prerender.crawlLinks`。
2. `scripts/site-build.mjs` 的 `APPS` 数组加一项 `{ dir: 'g3', base: '/g3/' }`。
3. `portal/index.html` 加一张年级卡片，链接 `./g3/`。

## 维护提示

- 改 OCR/数据后顺序：改产物 → `ocr/src/merge.py` 重生成 md → 抽查
  `ocr/book/上册_正文.md`；数据改动跑 `npm run test`，游戏改动补跑 E2E。
- 例题准确性回归：增改例题后跑 `python3 scripts/verify_examples.py`
  （STRONG/MEDIUM/FIG 三级证据），并同步 `docs/example-audit.md`。
- 运行预览：`game/` 内 `npm run dev`（PORT 3000），或 `npm run build` 后
  `PORT=3000 node .output/server/index.mjs`。