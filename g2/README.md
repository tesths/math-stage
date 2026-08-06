# 二年级上册数学 —— 例题可视化 + 训练小游戏（苏教版 · 2022 课标 · 2025 新编）

在独立文件夹 `g2/` 中，为**苏教版二年级上册**（2022 年版课程标准修订，2025 新编）打造：
- **例题可视化 Lab**（22 个）：每个例题可拖动参数，图形/公式/计算过程实时联动；
  覆盖表内乘法（几个几/乘法口诀）、表内除法（平均分/每几个一份/用口诀求商）、
  七巧板（综合实践）、7~9 的表内乘除法（一句口诀算乘除）、生活中的方向（综合实践）、
  认识三位数（计数器/比较大小/算盘）、两位数加与减（进位/退位计数器）、
  欢乐购物街（认识人民币/付钱找零）、有余数的除法（分物余数/余数比除数小）、期末复习。
- **训练小游戏**（12 个）：随机出题，反复练习。
- 动效：Anime.js（结果弹跳/步骤交错淡入）、SVG / DOM 可视化（点阵/计数器/算盘/方向板/七巧板）。

## 目录结构

```
g2/
├── README.md                 本文件
├── ocr/upper/pages/                课本 OCR（120 页 p001.txt 文字 + 整页图 + 插图）
│   └── 书页 = PDF页 - 8（书页 1 = PDF p9）
├── ocr/lower/                未来下册 OCR 占位
├── data/upper/                     例题 Lab 数据（纯声明，计算在 game）
│   ├── schema/lab.ts         Lab 类型：参数定义（滑块范围/单位）+ kind + 公式
│   ├── schema/validate.ts    运行时校验（id 唯一 / 参数合法）
│   ├── chapters/meta.ts      10 单元元信息（书页区间来自课本目录）
│   ├── chapters/c1.ts … c10.ts 各单元 Lab（c3 七巧板、c5 方向、c8 人民币为综合实践）
│   └── index.ts              汇总（findLabById / byChapter / totalLabs=22）
├── data/lower/               未来下册 Lab 数据占位
├── game/                     二年级 Nuxt4 应用（Nuxt UI，主色 emerald）
│   ├── src/lib/engine/math.ts   纯数学工具（乘法口诀/中文数字/方向/三位数分解）
│   ├── src/lib/labs/compute.ts  每种 kind 的求值与分步过程（17 种）
│   ├── src/lib/labs/registry.ts kind → 组件（8 个）
│   ├── src/lib/games/          12 个游戏元数据 + slug → 组件
│   ├── src/components/labs/     8 个可视化组件（点阵/计数器/算盘/方向板/七巧板/人民币）
│   ├── src/components/games/    12 个训练游戏组件
│   ├── src/pages/
│   │   ├── index.vue           首页（单元 + Lab + 游戏分组）
│   │   ├── units/[id].vue      单元页（Lab 清单）
│   │   ├── labs/[id].vue       Lab 页（参数滑块 + 实时公式 + 分步思考）
│   │   └── games/[slug].vue    游戏页
│   └── test/                   vitest（unit/component，四指标均 ≥95%）
└── docs/
    └── 课本OCR与页面映射.md    课本页码 ↔ PDF 页码映射
```

## 例题可视化 Lab（可调参数）

| 单元 | 书页 | Lab 数 | 亮点 |
| --- | --- | --- | --- |
| 一 1~6的表内乘法 | 1-18 | 3 | 认识乘法（**几个几点阵**→加法→乘法）、5 的乘法口诀、6 的乘法口诀 |
| 二 1~6的表内除法 | 19-32 | 3 | **平均分点阵**（每份同样多）、每几个一份圈一圈、用乘法口诀求商 |
| 三 奇妙的七巧板（综合实践） | 33-38 | 1 | 7 块板拼正方形，高亮各图案用板 |
| 三 7~9的表内乘除法 | 39-55 | 4 | 7/8/9 的乘法口诀（n 个 9 比 10n 少 n）、一句口诀算乘除 |
| 生活中的方向（综合实践） | 56-60 | 1 | **方向板**：面向一方，前后左右方向 |
| 四 认识三位数 | 61-73 | 3 | 计数器摆三位数、比大小（先比百位）、**算盘拨珠**（上珠 5 下珠 1） |
| 五 两位数加、减两位数 | 74-85 | 2 | 计数器演示进位加、退位减 |
| 欢乐购物街（综合实践） | 86-90 | 2 | 认识人民币面额（1 元=10 角）、付钱找零 |
| 六 有余数的除法 | 91-97 | 2 | 分物有余数（10÷3）、余数比除数小 |
| 期末复习 | 98-104 | 1 | 表内乘除四则混合 |

Lab 页布局：左侧可视化，右侧参数滑块，下方"分步思考"过程与结论。
数据层只需声明 `params`（滑块定义）与 `formula`，计算逻辑在 `lib/labs/compute.ts`。

## 训练小游戏（12 个）

| 游戏 | 知识点 | 玩法 |
| --- | --- | --- |
| 九九乘法表 | 1~9 表内乘法 | 5 题口算选答案 |
| 除法口算 | 用乘法口诀求商 | 5 题选答案（提示口诀） |
| 表内乘除混合 | 乘除混合 | 5 题选结果 |
| 平均分挑战 | 平均分 | 求每份几个 |
| 三位数拼一拼 | 几个百/十/一 | 拼成三位数选答案 |
| 三位数比大小 | 先比百位 | 选 > / < / = |
| 算盘读数 | 上珠 5 下珠 1 | 读算盘上的数 |
| 两位数加减 | 进位/退位 | 输入答案 |
| 欢乐购物 | 付钱找零 | 输入找回的钱 |
| 有余数除法 | 商与余数 | 选「商 …… 余」 |
| 辨认方向 | 东南西北前后左右 | 选方向 |
| 七巧板拼图 | 哪几块拼成 | 选板块组合 |

## 运行

```bash
cd g2/game
npm ci
npm run dev          # 开发（PORT 3000）
npm run test         # vitest（unit + component）
npm run test:coverage# 四指标均 ≥95%
npm run typecheck    # vue-tsc --noEmit
BASE_URL=/g2/ npm run generate:site   # 静态导出 .output/public
```

已知约定（与五/六年级工程一致）：
- `vitest.config.ts` 的 `@data` 别名指向 `../data/upper`（本文件夹内）；`@shared` 别名指向仓库根 `shared/`。
- 布局使用共享 `shared/components/GradeShell.vue`（顶栏年级切换/页脚由 `shared/grades` 注册表驱动，
  注册后顶栏自动出现二年级入口）。
- 书页 = PDF 页 - 8；OCR 产物在 `g2/ocr/upper/pages`，勿与其他年级混淆。
- 覆盖率分支统计对 `??`/`||`/可选链判空等防御分支零容忍：模板中不要直接读
  `props.values.x`，一律先 `computed(() => props.values.x ?? 默认值)` 再引用。

## 新增一个 Lab

1. 在 `g2/data/upper/chapters/cN.ts` 加一条 `LabDef`（含 params 滑块定义、formula、可选 fixed 常量）。
2. 若为全新可视化类型，在 `schema/lab.ts` 扩展 `LabKind`、`lib/labs/compute.ts` 加计算分支、
   `components/labs/` 写组件并注册到 `lib/labs/registry.ts`。
3. 跑 `npm run test`（validateLabs 自动校验数据 + 全 kind 空参数挂载）+ `npm run typecheck`。
