# 四年级上册数学 —— 例题可视化 + 训练小游戏（苏教版 · 2022 课标）

在独立文件夹 `g4/` 中，为**苏教版四年级上册**（2022 年版课程标准修订）打造：
- **例题可视化 Lab**（28 个）：每个例题可拖动参数，图形/公式/计算过程实时联动；
  覆盖两、三位数除以两位数（竖式试商）、周长与面积、周长与面积的变化、
  乘法数量关系、混合运算与数量关系（二）、制订旅游计划、多位数的认识、
  度量衡的故事、大数的运算。
- **训练小游戏**（10 个）：随机出题，反复练习。
- 动效：Anime.js（结果弹跳/步骤交错淡入）。

## 目录结构

```
g4/
├── README.md                 本文件
├── ocr/upper/pages/                课本 OCR（121 页：p001.txt 文字 + 整页图 + 插图）
│   └── 书页 = PDF页 - 3（书页 1 = PDF p4）
├── ocr/lower/                未来下册 OCR 占位
├── data/upper/                     例题 Lab 数据（纯声明，计算在 game）
│   ├── schema/lab.ts         Lab 类型：参数定义（滑块范围/单位）+ kind + 公式
│   ├── schema/validate.ts    运行时校验（id 唯一 / 参数合法）
│   ├── chapters/meta.ts      9 单元元信息（书页区间来自课本目录）
│   ├── chapters/c1.ts … c9.ts 各单元 Lab
│   └── index.ts              汇总（findLabById / byChapter / totalLabs=28）
├── data/lower/               未来下册 Lab 数据占位
├── game/                     四年级 Nuxt4 应用（Nuxt UI，主色 emerald）
│   ├── src/lib/engine/math.ts   纯数学工具（数位/四舍五入/大数格式化）
│   ├── src/lib/labs/compute.ts  每种 kind 的求值与分步过程
│   ├── src/lib/labs/registry.ts kind → 组件
│   ├── src/lib/games/          10 个游戏元数据 + slug → 组件
│   ├── src/components/labs/     10 个可视化组件（SVG：竖式/网格/线段图/数位表）
│   ├── src/components/games/    10 个训练游戏组件
│   ├── src/pages/
│   │   ├── index.vue           首页（单元 + Lab + 游戏分组）
│   │   ├── units/[id].vue      单元页（Lab 清单）
│   │   ├── labs/[id].vue       Lab 页（参数滑块 + 实时公式 + 分步思考）
│   │   └── games/[slug].vue    游戏页
│   ├── test/                   vitest（119 用例，statements/lines/functions ≥100%，branches ≥95%）
│   └── e2e/smoke.spec.ts       Playwright 6 用例
└── docs/
```

## 例题可视化 Lab（可调参数）

| 单元 | 书页 | Lab 数 | 亮点 |
| --- | --- | --- | --- |
| 一 两、三位数除以两位数 | 1-16 | 4 | 整十数口算分组、**竖式试商**（除数看作整十数）、两步连除 |
| 二 周长与面积 | 17-41 | 6 | 长方形/正方形周长与面积（SVG 动态图形）、面积单位量面积、面积单位换算 |
| 周长与面积的变化 | 42-43 | 1 | 面积一定时拼长方形，对比周长变化（正方形周长最短） |
| 三 乘法数量关系 | 44-56 | 4 | 乘法的意义、总价=单价×数量、路程=速度×时间、归一解决问题 |
| 四 混合运算与数量关系（二） | 57-63 | 3 | 三步混合运算（先乘除后加减）、含括号运算、线段图分析 |
| 制订旅游计划 | 64-66 | 1 | 交通/门票/住宿/餐费的费用估算 |
| 五 多位数的认识 | 67-88 | 5 | 计数单位、数位顺序表、万级亿级多位数、四舍五入、身份证编码 |
| 度量衡的故事 | 89-93 | 1 | 古代尺/升/斤与现代单位的换算 |
| 六 大数的运算 | 94-108 | 3 | 三位数乘两位数竖式、计算器探索规律、1 亿有多大推算 |

Lab 页布局：左侧可视化（SVG），右侧参数滑块，下方"分步思考"过程与结论。
数据层只需声明 `params`（滑块定义）与 `formula`，计算逻辑在 `lib/labs/compute.ts`。

## 训练小游戏（10 个）

| 游戏 | 知识点 | 玩法 |
| --- | --- | --- |
| 除法口算 | 整十数除以整十数 | 随机出题 5 题选答案 |
| 试商小达人 | 除数看作整十数试商 | 5 题选商 |
| 周长挑战 | 长方形/正方形周长 | 5 题选答案 |
| 面积挑战 | 长方形/正方形面积 | 5 题选答案 |
| 面积单位换算 | 平方厘米/平方分米/平方米 | 进率 100，5 题 |
| 购物总价 | 总价=单价×数量 | 求总价/单价/数量 |
| 速度时间路程 | 路程=速度×时间 | 求路程/速度/时间 |
| 混合运算快算 | 三步混合运算 | 5 题选得数 |
| 四舍五入 | 求近似数（万/亿） | 5 题选近似数 |
| 大数乘法 | 三位数乘两位数 | 5 题选积 |

## 运行

```bash
cd g4/game
npm run dev          # 开发（PORT 3000）
npm run test         # vitest 119 用例（含共享 GradeShell 组件）
npm run test:coverage# 四指标：statements/lines/functions 100%，branches ≥95%
npm run test:e2e     # Playwright 6 用例（NITRO_PRESET=node-server 本地构建）
npm run build        # 构建（nitro preset: cloudflare-pages，可部署 Pages/静态）
```

已知约定（与五年级工程一致）：
- `game/` 内 `package.json` 依赖与五年级一致，`node_modules` 可复制共享。
- `vitest.config.ts` 的 `@data` 别名指向 `../data/upper`（本文件夹内），与一年级互不影响；
  `@shared` 别名指向仓库根 `shared/`（共享设计系统）。
- 布局使用共享 `shared/components/GradeShell.vue`（顶栏年级切换/页脚由 `shared/grades` 注册表驱动）。
- 书页 = PDF 页 - 3；OCR 产物在 `g4/ocr/upper/pages`，勿与一年级 `g1/ocr/upper/pages` 混淆。

## 新增一个 Lab

1. 在 `g4/data/upper/chapters/cN.ts` 加一条 `LabDef`（含 params 滑块定义、formula、可选 fixed 常量）。
2. 若为全新可视化类型，在 `schema/lab.ts` 扩展 `LabKind`、`lib/labs/compute.ts` 加计算分支、
   `components/labs/` 写组件并注册到 `lib/labs/registry.ts`。
3. 跑 `npm run test`（validateLabs 自动校验数据）+ `npm run test:coverage`。
