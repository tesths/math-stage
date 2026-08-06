# 义务教育教科书·数学 —— OCR 与例题可视化 / 小游戏

> 📖 **开发者请看**：完整开发文档 `docs/DEVELOPMENT.md`（架构、数据格式、新增例题/Lab/游戏的标准流程、OCR 管线、测试、单 Cloudflare Pages 部署、排错速查）。

本仓库包含六个年级的独立工程，以及全平台共享的 `shared/` 设计系统（主样式以五年级为基准，全站统一 emerald）：

| 年级 | 课本 | 位置 | 内容 |
| --- | --- | --- | --- |
| 共享层 | — | `shared/`（年级注册表/主题令牌/GradeShell 布局/工具函数/runtime adapters） | 新增年级只改 `shared/grades` 一处；存储/音效逻辑在 shared 统一实现 |
| 门户 | — | `portal/`（Nuxt 静态站）+ 聚合脚本 `scripts/site-build.mjs` | **单 Cloudflare Pages 部署**：`/` 门户、`/g1/` 一年级、`/g2/` 二年级、`/g3/` 三年级、`/g4/` 四年级、`/g5/` 五年级、`/g6/` 六年级（详见文末部署章节） |
| 一年级（人教版·2022 课标） | 一年级上册扫描 PDF | `g1/data/upper/` + `g1/game/`（下册预留 `g1/data/lower/`） | 78 道例题答题游戏 + 20 个小游戏（详见下） |
| 二年级（苏教版·2022 课标·2025 新编） | 义务教育教科书•数学二年级上册.pdf | `g2/`（独立文件夹） | **22 个可调参数例题可视化 Lab**（七巧板/算盘/计数器/方向板/人民币等）+ 12 个训练小游戏（详见 `g2/README.md`） |
| 三年级（苏教版·2022 课标） | 义务教育教科书•数学三年级上册.pdf | `g3/`（独立文件夹） | **41 个可调参数例题可视化 Lab**（24 时记时法钟面、竖式 SVG、曹冲称象、three.js 三视图、线段图等）+ 16 个训练小游戏（详见 `g3/README.md`） |
| 四年级（苏教版·2022 课标·2026 新编） | 最新【苏教版】4年级数学课本•上册.pdf | `g4/`（独立文件夹） | **28 个可调参数例题可视化 Lab**（除法竖式试商、周长面积、数位表、大数运算等）+ 10 个训练小游戏（详见 `g4/README.md`） |
| 五年级（苏教版·2022 课标） | 最新【苏教版】5年级数学课本•上册.pdf | `g5/`（独立文件夹） | **33 个可调参数例题可视化 Lab**（three.js 三视图可拖拽、chart.js 统计图、多边形面积剪拼等）+ 10 个训练小游戏（详见 `g5/README.md`） |
| 六年级（苏教版·2022 课标） | 最新【苏教版】6年级数学课本•上册.pdf | `g6/`（独立文件夹） | **33 个可调参数例题可视化 Lab**（小数方格模型、圆/扇形 SVG、线段图、二进制、黄金比等）+ 12 个训练小游戏（详见 `g6/README.md`） |

---

# 一年级：例题游戏（人教版上册）

将人教版（2022 版课标）一年级上册扫描 PDF，通过 macOS Vision 做图文识别，产出**图文对照的合订正文**；再人工整理为结构化"例题"，在一个 Nuxt4 + Vue3 的互动小游戏网站上以游戏形式呈现。

## 目录结构

```
math/
├── README.md                      本文件（维护总入口，含 g1/ 到 g6/ 指引）
├── shared/                        全平台共享设计系统（主样式 = 五年级 emerald）
│   ├── grades/index.ts            年级注册表：新增年级只改这里
│   ├── theme/                     主题令牌 + 统一 CSS 覆盖层 + 共享 Nuxt 配置片段
│   ├── components/GradeShell.vue  统一布局壳（顶栏年级切换/页脚，由注册表驱动）
│   ├── utils/                     共享工具函数
│   ├── runtime/                   localStorage / WebAudio 共享 runtime adapter
│   └── test/                      独立 vitest（32 用例，覆盖率 100%）
├── g1/                             一年级（人教版）独立文件夹：
│   ├── README.md                  一年级上下册目录约定
│   ├── data/upper/                当前上册例题数据（78 道）
│   ├── data/lower/                未来下册例题数据占位
│   ├── ocr/upper/pages/           当前上册 OCR（文字 + 整页图 + 插图）
│   ├── ocr/upper/book/            当前上册合订 Markdown
│   ├── ocr/lower/                 未来下册 OCR 占位
│   └── game/                      一年级 Nuxt4 应用；未来同一应用内挂上下册入口
├── g2/                             二年级（苏教版上册）独立文件夹：
│   ├── README.md                  二年级工程说明
│   ├── ocr/upper/pages/           上册课本 OCR（书页 = PDF页 - 8）
│   ├── ocr/lower/                 未来下册 OCR 占位
│   ├── data/upper/                上册 22 个可调参数 Lab 数据
│   ├── data/lower/                未来下册 Lab 数据占位
│   ├── game/                      二年级 Nuxt4 应用（Nuxt UI）
│   └── docs/                      课本 OCR 与页面映射
├── g3/                             三年级（苏教版上册）独立文件夹：
│   ├── README.md                  三年级工程说明
│   ├── ocr/upper/pages/           上册课本 OCR（书页 = PDF页 - 8，132 页）
│   ├── ocr/lower/                 未来下册 OCR 占位
│   ├── data/upper/                上册 41 个可调参数 Lab 数据
│   ├── data/lower/                未来下册 Lab 数据占位
│   ├── game/                      三年级 Nuxt4 应用（Nuxt UI + three.js）
│   └── docs/                      课本 OCR 与页面映射
├── g4/                             四年级（苏教版上册）独立文件夹：
│   ├── README.md                  四年级工程说明
│   ├── ocr/upper/pages/           上册课本 OCR（书页 = PDF页 - 3，121 页）
│   ├── ocr/lower/                 未来下册 OCR 占位
│   ├── data/upper/                上册 28 个可调参数 Lab 数据
│   ├── data/lower/                未来下册 Lab 数据占位
│   ├── game/                      四年级 Nuxt4 应用（Nuxt UI）
│   └── docs/                      课本 OCR 与页面映射
├── g5/                             五年级（苏教版上册）独立文件夹：
│   ├── README.md                  五年级工程说明
│   ├── ocr/upper/pages/           上册课本 OCR（书页 = PDF页 - 2）
│   ├── ocr/lower/                 未来下册 OCR 占位
│   ├── data/upper/                上册 33 个可调参数 Lab 数据
│   ├── data/lower/                未来下册 Lab 数据占位
│   ├── game/                      五年级 Nuxt4 应用（Nuxt UI + three.js）
│   └── docs/                      课本 OCR 与页面映射
├── g6/                             六年级（苏教版上册）独立文件夹：
│   ├── README.md                  六年级工程说明
│   ├── ocr/upper/pages/           上册课本 OCR（书页 = PDF页 - 2）
│   ├── ocr/lower/                 未来下册 OCR 占位
│   ├── data/upper/                上册 33 个可调参数 Lab 数据
│   ├── data/lower/                未来下册 Lab 数据占位
│   ├── game/                      六年级 Nuxt4 应用（Nuxt UI）
│   └── docs/                      课本 OCR 与页面映射
├── （…）·数学一年级上册.pdf        原始扫描 PDF（105 页）
├── ocr/                           共享 OCR 工具源码（各年级输出到 gX/ocr/{upper,lower}/）
│   ├── src/ocr.swift              可执行 OCR：文字 + 整页图 + 插图自动裁剪
│   ├── src/ocr_bin                ocr.swift 的编译产物（swiftc -O 生成）
│   └── src/merge.py               txt/图 → gX/ocr/{upper,lower}/book/*.md
├── scripts/
│   ├── site-build.mjs       单 Pages 聚合构建脚本（六个年级 Nuxt 应用 + 门户）
│   ├── app-registry.mjs     聚合构建/验收共享应用注册表（六个年级 + 门户）
│   ├── prepare-nuxt.mjs     全应用 Nuxt prepare（清理代理变量，支持 Node 24）
│   ├── run-app-script.mjs   根层运行单个应用脚本（generate:g1 等）
│   ├── test-shared.mjs      共享层测试（npm run test:shared）
│   ├── real-click-test.mjs  真实点击验收（npm run test:click，46 项）
│   └── verify_examples.py   例题 ↔ 课本文字机器核对（STRONG/MEDIUM/FIG 三级证据）
└── docs/                          其他文档
    ├── example-audit.md           例题逐条核对报告（书页↔课本原文，含需看图复核清单）
    └── 游戏形式调研.md            20 个小游戏的课本出处/玩法设计调研
```

## OCR 管线（文字 + 图片）

命令行：`swiftc -O ocr/src/ocr.swift -o ocr/src/ocr_bin && ./ocr/src/ocr_bin "<pdf>" 1 105 "g1/ocr/upper/pages"`

每页输出三样产物：

| 产物 | 来源 | 用途 |
| --- | --- | --- |
| `g1/ocr/upper/pages/pNNN.txt` | Vision `VNRecognizeTextRequest`（zh-Hans + en-US，`.accurate`） | 纯文字提取 |
| `g1/ocr/upper/pages/pNNN.jpg` | 页面 PDFKit 2.0x 渲染 → JPEG(0.85) | 整页原图（图文对照） |
| `g1/ocr/upper/pages/pNNN-N.jpg` | 网格瓦片聚簇自动裁出"非文本 + 非纯白"区域 | 插图/示意图片段 |

插图识别启发式：页面按 6×5 网格分瓦片，某瓦片"文字覆盖率 ≤55% 且采样子像素非白占比 ≥10%"则标为插图候选，8-连通聚簇为矩形；要求面积 ≥ 2×2 瓦片、≤整页 75%（更大即整页，避免与整页图重复）。

然后 `python3 ocr/src/merge.py` 生成合订 `g1/ocr/upper/book/上册_正文.md`：每页即"标题 → 整页图 → OCR 文字 → 插图片段"，共嵌入 182 张图（105 整页 + 77 插图）。

### 页面映射约定

- 书页页码 = PDF 页码 - 7（书页 1 = PDF p8）。
- 前页：p1 封面 / p2 书名 / p3 版权 / p4 致同学 / p5 空白 / p6-7 目录。
- 后页：p102-103 附页卡片 / p104 后记 / p105 空白。
- 空白页 p005 / p007 / p105 → 无文字、跳过插图。

## 例题数据

`g1/data/upper/` 以 TS 类型 + 运行时校验器（`validate.ts`）保证结构正确，共 78 道，覆盖
11 类题型：count / write / split / addsub / compare / position / ordinal /
shape3d / numberline / sequence / ten。位置判定规则：左/上/前取前一项，否则取后一项。

分类字段：
- `source`（题源小节）：例题 36 / 想想做做 14 / 练习 14 / 活动 10 / 试一试 4；
  单元列表与答题卡显示该标签，区分课本"主情景例题"与"习题改编"。
- `tocLabel`（课本目录序号）：一~五，仅五个编号单元有；游戏/活动单元为空，
  首页与单元页按课本目录样式显示。

新增一道例题 = 在对应 `g1/data/upper/chapters/cN.ts` 加一条符合 `schema/example.ts` 的记录并保证通过校验器。

**例题准确性（机器核对）**：源码 `scripts/verify_examples.py` 对每条例题在该题
标注书页的 OCR 文字中查"印刷证据"，三级结论：STRONG 64（算式/不等式/填空/关键数
与课本印刷一致）、MEDIUM 9（故事题/文字题可在该页印证）、FIG 5（仅图内数量，全在
第 1 单元，需人工看图）。跨课本逐条对照见 `docs/example-audit.md`。

## 测试与构建

`g1/game/` 目录内：

```bash
npm run test          # vitest（单元 + 组件），311 用例全绿
npm run test:coverage # 覆盖率（statements 100% / branches 99.8% / lines 100% / functions 100%）
npm run test:e2e      # Playwright 34 个 E2E（含 20 个小游戏页矩阵，构建产物运行）
npm run dev           # 开发（PORT 3000）
npm run build | nuxt build
npm run generate      # 静态导出 .output/public（含 units/、play/、games/ 全部路由）
```

共享层（`shared/`）、二/三/五年级与六年级测试：

```bash
npm install          # 仓库根：Node 24 + npm workspace 单一依赖树
npm run typecheck    # 仓库根：先 prepare 七个 Nuxt 应用，再跑全部 typecheck
npm run test:shared    # 仓库根：共享层 32 用例（覆盖率 100%）
npm run test:shared:coverage
npm run test:click     # 仓库根：真实点击验收 46 项（需先 npm run build:site:local）
cd g2/game && npm run test          # 二年级单元 + 组件用例全绿
cd g2/game && npm run test:coverage # 二年级四指标均 ≥95%
cd g3/game && npm run test          # 三年级 112 用例全绿
cd g3/game && npm run test:e2e      # 三年级 Playwright 6 用例
cd g4/game && npm run test          # 四年级 119 用例全绿
cd g4/game && npm run test:coverage # 四年级 statements/lines/functions 100%，branches ≥95%
cd g4/game && npm run test:e2e      # 四年级 Playwright 6 用例
cd g5/game && npm run test          # 五年级 105 用例全绿
cd g5/game && npm run test:coverage # 五年级四指标均 ≥95%（99.6/96/95/99.6）
cd g6/game && npm run test          # 六年级 130 用例全绿
cd g6/game && npm run test:coverage # 六年级四指标均 ≥95%（100/99.17/100/100）
```

Node 约定：开发基线为 Node 24（见 `.nvmrc` / `.node-version`），依赖版本由仓库根 `package.json` + 根 `package-lock.json` 统一管理；各年级目录保留独立工程结构，但不再维护各自 lockfile。
如 npm 联网需要代理，可在安装时设置代理变量；Nuxt 本地 `prepare` / `generate` 由脚本自动清理代理变量，避免 `socks5h://` 被 Undici 误读。

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
- Nuxt UI v4 必须显式提供 CSS 入口；本仓库由 `shared/theme/app.css` 统一注入
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

## 单 Cloudflare Pages 部署（门户 + 一/二/三/四/五/六年级）

一个 GitHub 仓库、**一个** Cloudflare Pages 项目，门户在 `/`、一年级在 `/g1/`、二年级在 `/g2/`、三年级在 `/g3/`、四年级在 `/g4/`、五年级在 `/g5/`、六年级在 `/g6/`。
各年级仍是独立 Nuxt 工程（管理上分开），构建时聚合为一个产物 `deploy/`。

```
部署产物 deploy/
├── index.html    门户（portal/，链接 ./g1/、./g2/、./g3/、./g4/、./g5/ 与 ./g6/）
├── g1/           一年级（g1/game/，BASE_URL=/g1/ 静态导出，111 页）
├── g2/           二年级（g2/game/，BASE_URL=/g2/ 静态导出）
├── g3/           三年级（g3/game/，BASE_URL=/g3/ 静态导出，73 页）
├── g4/           四年级（g4/game/，BASE_URL=/g4/ 静态导出，51 页）
├── g5/           五年级（g5/game/，BASE_URL=/g5/ 静态导出，55 页）
├── g6/           六年级（g6/game/，BASE_URL=/g6/ 静态导出，56 页）
└── _redirects    仅注释；真实页面全部预渲染，禁止 SPA 200 重写
```

### 本地构建与预览

```bash
npm run build:site:local   # 聚合构建（复用根 node_modules，跳过 npm ci）
npx serve deploy           # 或 cd deploy && python3 -m http.server 4100
```

GitHub Actions 使用 Node 24 + npm 12，按根 workspace 顺序执行 `npm ci --ignore-scripts`、`npm run typecheck`、`npm run test:unit`、`npm run build:site:local`。

### Cloudflare Pages 配置（一次）

1. 把本仓库推送到 GitHub。
2. Cloudflare Dashboard → Workers & Pages → Create → **Pages → Connect to Git**，选本仓库。
3. 构建设置：
   | 项 | 值 |
   | --- | --- |
   | 框架预设 | None |
   | 构建命令 | `npm run build:site`（根目录执行一次 `npm ci --ignore-scripts`，再并发生成 g1/game/、g2/game/、g3/game/、g4/game/、g5/game/、g6/game/、portal/） |
   | 构建输出目录 | `deploy` |
4. 保存并部署。以后推送 `main` 分支即自动构建。

> 依赖安装已经集中到根 workspace；本地冷安装验证约 15 秒量级，Cloudflare 缓存命中后只需复用根 lockfile。
> 年级构建默认并发 2，可用 `SITE_BUILD_CONCURRENCY=1` 降低内存压力。

### 新增年级（三年级等）

1. 新建独立 Nuxt 工程（如 `g3/`，管理上独立），复制现有 nuxt.config 骨架（引入 `sharedNuxtConfig`）。
2. **`shared/grades/index.ts` 加一条 `GradeInfo` 记录**——门户卡片、顶栏切换、页脚文案自动生成。
3. `scripts/app-registry.mjs` 加一项应用记录；`scripts/site-build.mjs`、门户验收脚本会自动复用。

## 维护提示

- 改 OCR/数据后顺序：改产物 → `ocr/src/merge.py` 重生成 md → 抽查
  `g1/ocr/upper/book/上册_正文.md`；数据改动跑 `npm run test`，游戏改动补跑 E2E。
- 例题准确性回归：增改例题后跑 `python3 scripts/verify_examples.py`
  （STRONG/MEDIUM/FIG 三级证据），并同步 `docs/example-audit.md`。
- 运行预览：`g1/game/` 内 `npm run dev`（PORT 3000），或 `npm run build` 后
  `PORT=3000 node .output/server/index.mjs`。
