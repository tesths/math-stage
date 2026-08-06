# 五年级上册数学 —— 例题可视化 + 训练小游戏（苏教版 · 2022 课标）

在独立文件夹 `g5/` 中，为**苏教版五年级上册**（2022 年版课程标准修订）打造：
- **例题可视化 Lab**（33 个）：每个例题可拖动参数，图形/公式/计算过程实时联动；
  覆盖图形的运动（three.js 三视图）、**统计表与条形统计图（chart.js）**、多边形的面积（剪拼动画）、
  小数乘除、可能性（随机模拟）、因数与倍数、用字母表示数、钉子板皮克定理。
- **训练小游戏**（10 个）：随机出题，反复练习。
- 动效：Anime.js（剪拼/视角切换补间/硬币 3D 翻转/结果弹跳）、three.js OrbitControls（3D 可拖拽旋转）。

## 目录结构

```
g5/
├── README.md                 本文件
├── ocr/upper/pages/                课本 OCR（131 页：p001.txt 文字 + 整页图 + 插图）
│   └── 书页 = PDF页 - 2（书页 1 = PDF p3）
├── ocr/lower/                未来下册 OCR 占位
├── data/upper/                     例题 Lab 数据（纯声明，计算在 game）
│   ├── schema/lab.ts         Lab 类型：参数定义（滑块范围/单位）+ kind + 公式
│   ├── schema/validate.ts    运行时校验（id 唯一 / 参数合法）
│   ├── chapters/meta.ts      8 单元元信息（书页区间来自课本目录）
│   ├── chapters/c1.ts … c8.ts 各单元 Lab（含探索规律 pinboard）
│   └── index.ts              汇总（findLabById / byChapter / totalLabs=31）
├── data/lower/               未来下册 Lab 数据占位
├── game/                     五年级 Nuxt4 应用（Nuxt UI，主色 emerald）
│   ├── src/lib/engine/math.ts   纯数学工具（因数/质数/gcd/lcm/面积/皮克）
│   ├── src/lib/labs/compute.ts  每种 kind 的求值与分步过程
│   ├── src/lib/labs/registry.ts kind → 组件
│   ├── src/lib/games/          10 个游戏元数据 + slug → 组件
│   ├── src/components/labs/     9 个可视化组件（SVG + three.js）
│   ├── src/components/games/    10 个训练游戏组件
│   ├── src/pages/
│   │   ├── index.vue           首页（单元 + Lab + 游戏分组）
│   │   ├── units/[id].vue      单元页（Lab 清单）
│   │   ├── labs/[id].vue       Lab 页（参数滑块 + 实时公式 + 分步思考）
│   │   └── games/[slug].vue    游戏页
│   ├── test/                   vitest（105 用例，statements/lines/functions/branches 均 ≥95%）
│   └── e2e/smoke.spec.ts       Playwright 6 用例
└── docs/
```

## 例题可视化 Lab（可调参数）

| 单元 | 书页 | Lab 数 | 亮点 |
| --- | --- | --- | --- |
| 一 图形的运动 | 1-13 | 5 | 平移（对应点距离）、旋转（闸杆/三角形）、轴对称补全 |
| 二 统计表和条形统计图（二） | 17-25 | 2 | **chart.js 复式统计表与复式条形统计图**（合计实时计算） |
| 三 多边形的面积 | 30-50 | 6 | 平行四边形/三角形/梯形**剪拼动画**、公顷换算、组合图形分割 |
| 四 小数乘法和除法（一） | 55-64 | 5 | 小数乘整数（方格模型+竖式）、除以整数（平均分）、小数点移动 |
| 五 可能性 | 65-73 | 2 | 转盘（区域占比+加权随机）、摸球（正字计数+理论概率） |
| 六 因数与倍数 | 74-95 | 7 | 因数拼图、倍数数轴、质数筛、公因数公倍数（含**皮克定理**） |
| 七 用字母表示数量关系（一） | 96-109 | 4 | 青蛙歌、正方形 C=4a/S=a²、路程 s=v×t |
| 八 观察物体（三） | 112-118 | 2 | **three.js 三维积木可拖拽旋转 + 前/右/上三视图** |

Lab 页布局：左侧可视化（SVG/three.js），右侧参数滑块，下方"分步思考"过程与结论。
数据层只需声明 `params`（滑块定义）与 `formula`，计算逻辑在 `lib/labs/compute.ts`。

## 训练小游戏（10 个）

| 游戏 | 知识点 | 玩法 |
| --- | --- | --- |
| 面积速算 | 平行四边形/三角形/梯形面积 | 随机出题 5 题选答案 |
| 小数乘除口算 | 小数乘除整数 | 5 题口算 |
| 小数点搬家 | 小数点移动 | ×10/×100/×1000 或 ÷，选结果 |
| 因数大冒险 | 因数 | 多选找出所有因数 |
| 质数快抢 | 质数/合数 | 45 秒限时判断 |
| 公因数公倍数 | 最大公因数/最小公倍数 | 5 题 |
| 平移旋转辨识 | 图形的运动 | 看图判断运动方式 |
| 抛硬币统计 | 可能性 | 抛 100 次看统计接近一半 |
| 面积单位换算 | 公顷/平方千米 | 5 题换算 |
| 三视图配对 | 观察物体（three.js） | 看 3D 模型选投影图 |

## 运行

```bash
cd g5/game
npm run dev          # 开发（PORT 3000）
npm run test         # vitest 105 用例（含共享 GradeShell 组件）
npm run test:coverage# 四指标均 ≥95%（statements/lines/functions/branches）
npm run test:e2e     # Playwright 6 用例（NITRO_PRESET=node-server 本地构建）
npm run build        # 构建（nitro preset: cloudflare-pages，可部署 Pages/静态）
```

已知约定（与一年级工程一致）：
- `game/` 内 `package.json` 依赖与一年级完全一致，`node_modules` 可复制共享。
- `vitest.config.ts` 的 `@data` 别名指向 `../data/upper`（本文件夹内），与一年级互不影响；
  `@shared` 别名指向仓库根 `shared/`（共享设计系统）。
- 布局使用共享 `shared/components/GradeShell.vue`（顶栏年级切换/页脚由 `shared/grades` 注册表驱动）。
- 书页 = PDF 页 - 2；OCR 脚本 `ocr/src/ocr.swift` 支持第 5 参数指定输出目录，
  五年级产物在 `g5/ocr/upper/pages`，勿与一年级 `g1/ocr/upper/pages` 混淆。

## 新增一个 Lab

1. 在 `g5/data/upper/chapters/cN.ts` 加一条 `LabDef`（含 params 滑块定义、formula、可选 fixed 常量）。
2. 若为全新可视化类型，在 `schema/lab.ts` 扩展 `LabKind`、`lib/labs/compute.ts` 加计算分支、
   `components/labs/` 写组件并注册到 `lib/labs/registry.ts`。
3. 跑 `npm run test`（validateLabs 自动校验数据）+ `npm run typecheck`。
