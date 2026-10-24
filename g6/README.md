# 六年级上册数学 —— 例题 + 练习题可视化 + 训练小游戏（苏教版 · 2022 课标）

在独立文件夹 `g6/` 中，为**苏教版六年级上册**（2022 年版课程标准修订）打造：

- **例题可视化 Lab**（33 个）：每个例题可拖动参数，图形/公式/计算过程实时联动；
  覆盖小数乘除法（方格模型/近似值/进一去尾）、分数混合运算与数量关系（线段图/工程问题/分段计费）、
  数与运算的再认识（数位/二进制）、比和比例（化简比/按比例分配/黄金比）、圆（周长/面积/扇形/环形）、
  图形的放大与缩小（方格纸/比例尺）、确定位置（数对/方向距离）。
- **练习题可视化 Lab**（14 个，2026-09 新增）：从课本「练一练 / 练习一~十四 / 练习与应用 / 探索与实践」中
  由 DeepSeek 判定出最适合可视化讲解的题目，每个单元 2 个，同样支持拖动参数实时联动，
  并给出针对该题情境的分步思考与结论（详见下文「练习题可视化」）。
- **训练小游戏**（12 个）：随机出题，反复练习。
- 动效：Anime.js（结果弹跳/平滑补间）、SVG 图形可视化（方格模型/圆/扇形/方位图/放大图形）。

合计 **47 个可调参数 Lab**（33 例题 + 14 练习题）。

## 目录结构

```
g6/
├── README.md                 本文件
├── ocr/upper/pages/                课本 OCR（340 个文件：p001.txt 文字 + 整页图 + 插图）
│   └── 书页 = PDF页 - 2（书页 1 = PDF p3）
├── ocr/lower/                未来下册 OCR 占位
├── data/upper/               Lab 数据（纯声明，计算在 game）
│   ├── schema/lab.ts         Lab 类型：CoreLabKind（33 例题）+ ExerciseLabKind（14 练习题）+ 公式
│   ├── schema/validate.ts    运行时校验（id 唯一 / 参数合法）
│   ├── chapters/meta.ts      7 单元元信息（书页区间来自课本目录）
│   ├── chapters/c1.ts … c7.ts        各单元例题 Lab（c2 附分段计费、c3 附二进制、c4 附黄金比）
│   ├── chapters/c1-exercises.ts … c7-exercises.ts  各单元练习题 Lab（每单元 2 个）
│   ├── exercises/candidates.json      练习题候选（机器抽取，59 个练习小节）
│   ├── exercises/briefs/cN.md         每单元练习题候选简报（判定输入）
│   └── index.ts              汇总（findLabById / byChapter / totalLabs=47）
├── data/lower/               未来下册 Lab 数据占位
├── game/                     六年级 Nuxt4 应用（Nuxt UI，主色 emerald）
│   ├── src/lib/engine/math.ts       纯数学工具（四舍五入/进一去尾/分数/比/π）+ KIND_LABELS（47 种）
│   ├── src/lib/labs/types.ts        LabResult / LabStep 公共类型
│   ├── src/lib/labs/compute.ts      例题 kind 的求值与分步过程（33 种）+ 练习题分派
│   ├── src/lib/labs/exercises/      练习题求值（index.ts 分派 + c1.ts … c7.ts 每单元一个模块）
│   ├── src/lib/labs/registry.ts     kind → 组件
│   ├── src/lib/games/               12 个游戏元数据 + slug → 组件
│   ├── src/components/labs/         8 个例题可视化组件（SVG）
│   ├── src/components/labs/exercises/  7 个练习题可视化组件（每单元 1 个，按 kind 分支）
│   ├── src/components/games/        12 个训练游戏组件
│   ├── src/pages/
│   │   ├── index.vue           首页（单元 + 例题/练习题计数 + 游戏分组）
│   │   ├── units/[id].vue      单元页（例题可视化 / 练习题可视化 两个分区）
│   │   ├── labs/[id].vue       Lab 页（参数滑块 + 实时公式 + 分步思考）
│   │   └── games/[slug].vue    游戏页
│   ├── test/                   vitest（15 文件 196 用例，statements/lines/functions 100%、branches ≥95%）
│   └── e2e/                   （暂无；页面由 vitest 组件层覆盖）
└── docs/
    ├── 课本OCR与页面映射.md      课本页码 ↔ PDF 页码映射
    └── 练习题候选清单.md         练习题候选（按单元，判定前的人工可读清单）
```

## 例题可视化 Lab（33 个，可调参数）

| 单元 | 书页 | Lab 数 | 亮点 |
| --- | --- | --- | --- |
| 一 小数乘法和除法（二） | 1-13 | 6 | 小数乘小数**方格模型**、积与因数比较、积的近似值、商的海狮游速（千米/时→米/分）、进一去尾 |
| 二 混合运算与数量关系（三） | 14-25 | 5 | 分数四则混合、估算购物（两种估法）、**线段图**求几分之几、工程问题 |
| 二（附）生活中的分段计费 | 26-29 | 1 | 出租车分段计价（起步价 + 超出部分） |
| 三 数与运算的再认识 | 30-41 | 3 | 数位与计数单位、相同计数单位比较、运算意义的一致性 |
| 三（附）二进制的秘密 | 42-43 | 1 | 满二进一计数法（十进制 ⇄ 二进制） |
| 四 比和比例 | 44-63 | 6 | 比的认识/比值/化简比、按比例分配、比例基本性质、解比例 |
| 四（附）神奇的黄金比 | 64-67 | 1 | 黄金比 0.618 |
| 五 圆 | 68-87 | 6 | 认识圆与扇形（SVG）、周长 π、**面积剪拼成近似长方形**、环形、组合图形（窗户） |
| 六 放大与缩小 | 92-102 | 2 | 方格纸按比放大缩小、比例尺（图上/实际距离换算） |
| 七 确定位置 | 103-111 | 2 | 用数对确定位置、用方向与距离描述位置（方位图） |

## 练习题可视化 Lab（14 个）

识别与判定流程（可复现）：

1. `python3 scripts/extract_g6_exercises.py` 从 `g6/ocr/upper/book/上册_正文.md`（GLM-OCR 合订正文）
   抽取全部练习小节 → `g6/data/upper/exercises/candidates.json`（59 小节）+ `briefs/cN.md` + `g6/docs/练习题候选清单.md`。
2. DeepSeek 按「可视化适配度」（可调参数 / 结构化图形 / 能讲清算理 / 不与已有 Lab 重复 / 课本代表性）
   逐单元评分，选出每单元 2 条 ≥4 分的题目。
3. 实现为独立 Lab：**一条练习题 = 一种 kind**（`ExerciseLabKind`），
   文案与题目情境一一对应，避免复用例题 kind 时 steps/conclusion 出现“苹果/喷水池”等不符情境。

| 单元 | 练习题 | 课本出处 | kind |
| --- | --- | --- | --- |
| 一 小数乘除法 | 除以 11 的循环小数（长除法/循环节/规律表/放大数轴） | 练习二 第 15 题 | `ex-c1-div11-cycle` |
| 一 小数乘除法 | 平行四边形面积估算（估算值 vs 计算值条形对比） | 练习一 第 7 题 | `ex-c1-pgram-area` |
| 二 混合运算 | 既喜欢跳舞又唱歌（双长条叠加讲容斥） | 练习四 第 16 题 | `ex-c2-overlap-club` |
| 二 混合运算 | 一筐鸡蛋卖多少元（两次连筐称重逆推） | 练习三 第 14 题 | `ex-c2-egg-crate` |
| 三 数的再认识 | 除法转化成乘法（单位方格 + 两条等价横条） | 练习六 第 9 题 | `ex-c3-div-to-mul` |
| 三 数的再认识 | 和（差）是 7/12 的两个分数（12 格分数条拆分） | 练习六 第 5 题 | `ex-c3-frac-split` |
| 四 比和比例 | 棱长比·面积比·体积比（平方/立方联动） | 练习八 第 4 题 | `ex-c4-cube-ratio` |
| 四 比和比例 | 足球皮按比分黑白（份数条） | 练一练 第 1 题 | `ex-c4-football-ratio` |
| 五 圆 | 车轮滚动的路程（周长×圈数×时间） | 练习与应用 第 8 题 | `ex-c5-wheel-roll` |
| 五 圆 | 长方形纸剪圆片（去尾法行列排列 + 余料） | 探索与实践 第 16 题 | `ex-c5-circle-packing` |
| 六 放大与缩小 | 放大缩小后的面积倍数（n² / 1/d²） | 练习十二 第 6 题 | `ex-c6-scale-area` |
| 六 放大与缩小 | 两种比例尺图纸对比（同一实际距离换算） | 练习十三 第 6 题 | `ex-c6-two-maps` |
| 七 确定位置 | 数对画出行走路线（逐格 +1 高亮） | 练习十四 第 1 题 | `ex-c7-route-path` |
| 七 确定位置 | 两个观测点找家（方向 + 距离 + 定位弧） | 练习十四 第 8 题 | `ex-c7-observer-point` |

Lab 页布局：左侧可视化（SVG），右侧参数滑块，下方“分步思考”过程与结论，最下方是
**「重点概念」卡**（数据层 `LabDef.tip`，五、六年级共用 `shared/components/ConceptTip.vue`；默认收起，
点「先想一想，再看提示」才展开——先动手、后看结论）。

**核心例题新增了「按重点概念设计的可操作环节」**（8 个核心组件各 1 条，覆盖全部 7 个单元，详见
[`docs/example-visual-improvements.md`](../docs/example-visual-improvements.md) §7）：去尾/进一/四舍五入的「三法并排对照」、
分段计费的「逐段计费步进」、工程问题的「效率条相加步进」、数位的「满十进一」现场、
黄金比的「一键吸附 + 与 0.618 的差」、圆面积的「逐级翻倍 + 与 πr 的差」、
放大缩小的「逐个对应边量一量（比恒等 + 面积 ×n²）」、确定位置的「按数对走一格」。

数据层只需声明 `params`（滑块定义）与 `formula`，计算逻辑在 `lib/labs/exercises/`（练习题）或 `lib/labs/compute.ts`（例题）。

## 训练小游戏（12 个）

| 游戏 | 知识点 | 玩法 |
| --- | --- | --- |
| 小数乘法口算 | 小数乘小数/整数 | 5 题口算选答案 |
| 小数除法口算 | 小数除以整数/小数 | 5 题口算选答案 |
| 积的小数位数 | 因数小数位数和 | 判断积有几位小数 |
| 分数混合运算 | 分数四则混合运算 | 5 题选结果 |
| 求一个数的几分之几 | 总数 × 几分之几 | 输入部分量 |
| 出租车计费 | 分段计费 | 按起步价 + 超出部分算车费 |
| 二进制的秘密 | 二进制 | 十进制（0~31）改写成二进制 |
| 数的大小比较 | 相同计数单位比较 | 判断大小关系 |
| 化简比高手 | 比的基本性质 | 选最简整数比 |
| 解比例 | 外项积 = 内项积 | 求出未知数 x |
| 圆的计算 | 周长与面积 | π 取 3.14，输入答案 |
| 比例尺换算 | 图上/实际距离 | 正向与反向换算 |

## 运行

```bash
cd g6/game
npm run dev          # 开发（PORT 3000）
npm run test         # vitest 196 用例（15 文件）
npm run test:coverage# 四指标均 ≥95%（当前 100/98.99/100/100）
npm run typecheck    # vue-tsc（与五年级同源的一处共享 theme 类型提示一致，属既有基线）
npm run build        # 构建（配合 BASE_URL=/g6/ 静态导出）
```

已知约定（与五年级工程一致）：
- `game/` 内 `package.json` 依赖与五年级一致，`node_modules` 可复制共享。
- `vitest.config.ts` 的 `@data` 别名指向 `../data/upper`（本文件夹内），与五年级互不影响；
  `@shared` 别名指向仓库根 `shared/`（共享设计系统）；覆盖率排除纯类型文件 `src/lib/labs/types.ts`。
- 布局使用共享 `shared/components/GradeShell.vue`（顶栏年级切换/页脚由 `shared/grades` 注册表驱动）。
- 书页 = PDF 页 - 2；OCR 脚本 `ocr/src/ocr.swift` 支持第 5 参数指定输出目录，
  六年级产物在 `g6/ocr/upper/pages`，勿与一年级 `g1/ocr/upper/pages` 混淆。
- 覆盖率分支统计对 `??`/`||`/可选链判空等防御分支零容忍：模板中不要直接读
  `props.values.x`，一律先 `computed(() => props.values.x ?? 默认值)` 再引用，
  并用空参数挂载测试覆盖兜底分支（见 `test/component/labs.test.ts`、`exercises` 各测试）。

## 可视化质量与回归证据

- 纯几何抽到 `game/src/lib/labs/circle.ts`：等分圆上下一一交错拼成的图形，宽 = n·R·sin(π/n)、高 = R，
  n·sin(π/n) → π；滚圆一周前进 2πR、轮上一点轨迹是摆线。由 `test/unit/circle-geometry.test.ts` 断言。
- 十进制安全的四舍五入 `roundHalfUp` / `fixedN`（`lib/engine/math.ts`）：`(0.7×0.5).toFixed(1)` 会给出 0.3，
  正确值是 0.4；`test/unit/decimal-regression.test.ts` 对 7220 个可达组合与 BigInt 参考实现逐一比对，
  并保证组件显示值与 compute 文案同源。
- 截图回归：`node scripts/visual-shots.mjs --base http://localhost:3106 --grade g6 --all-labs`。
- 逐题改动清单：[`docs/example-visual-improvements.md`](../docs/example-visual-improvements.md)；
  逐 Lab 数学审查（含坐标复算与行号）：[`docs/audit/`](../docs/audit/)。

## 新增一个例题 Lab

1. 在 `g6/data/upper/chapters/cN.ts` 加一条 `LabDef`（含 params 滑块定义、formula、可选 fixed 常量）。
2. 若为全新可视化类型，在 `schema/lab.ts` 扩展 `CoreLabKind`、`lib/labs/compute.ts` 加计算分支、
   `components/labs/` 写组件并注册到 `lib/labs/registry.ts`。
3. 跑 `npm run test`（validateLabs 自动校验数据 + 全 kind 空参数挂载）+ `npm run typecheck`。

## 新增一个练习题 Lab

1. 重新跑 `python3 scripts/extract_g6_exercises.py` 更新候选，再按「判定流程」确定题目。
2. `schema/lab.ts` 的对应 `CNExerciseKind` 加 kind 名（并同步 `ExerciseLabKind`）。
3. `data/upper/chapters/cN-exercises.ts` 加 `LabDef`；`lib/labs/exercises/cN.ts` 加 compute case；
   `components/labs/exercises/ExerciseCNLab.vue` 加 `kind` 分支；`lib/labs/exercises/index.ts`
   的 `EXERCISE_KINDS` 与 `computeExerciseLab` 同步；`lib/engine/math.ts` 的 `KIND_LABELS`
   与 `lib/labs/registry.ts` 同步。
4. 补组件测试（含空参数挂载）与 `test/unit/data.test.ts` 计数，跑
   `npm run test:coverage`（四指标 ≥95%）+ `npm run typecheck`。
