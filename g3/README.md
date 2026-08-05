# 三年级上册数学 —— 例题可视化 + 训练小游戏（苏教版 · 2022 课标）

在独立文件夹 `g3/` 中，为**苏教版三年级上册**（2022 年版课程标准修订）打造：
- **例题可视化 Lab**（41 个）：每个例题可拖动参数，图形/公式/计算过程实时联动；
  覆盖混合运算与小括号、24 时记时法与经过时间、两三位数乘一位数（口算/估算/竖式）、
  克千克吨与曹冲称象、画"正"字统计、毫米分米千米、平移旋转轴对称、
  两三位数除以一位数（竖式 SVG）、间隔排列、线段图数量关系、
  观察物体（three.js 三视图）、倍的认识。
- **训练小游戏**（16 个）：随机出题，反复练习。
- 动效：Anime.js（数值滚动/结果弹跳/步骤交错/平移旋转动画）、three.js OrbitControls（3D 可拖拽旋转）。

## 目录结构

```
g3/
├── README.md                 本文件
├── ocr/pages/                课本 OCR（132 页：p001.txt 文字 + 整页图 + 插图）
│   └── 书页 = PDF页 - 8（书页 1 = PDF p9）
├── data/                     例题 Lab 数据（纯声明，计算在 game）
│   ├── schema/lab.ts         Lab 类型：参数定义（滑块范围/单位）+ kind + 公式
│   ├── schema/validate.ts    运行时校验（id 唯一 / 参数合法）
│   ├── chapters/meta.ts      12 单元元信息（书页区间来自课本目录）
│   ├── chapters/c1.ts … c12.ts 各单元 Lab
│   └── index.ts              汇总（findLabById / byChapter / totalLabs=41）
├── game/                     三年级 Nuxt4 应用（Nuxt UI，主色 emerald）
│   ├── src/lib/engine/math.ts   纯数学工具（运算顺序/时间/长度/质量/除法竖式/正字/倍）
│   ├── src/lib/labs/compute.ts  每种 kind 的求值与分步过程
│   ├── src/lib/labs/registry.ts kind → 组件
│   ├── src/lib/games/          16 个游戏元数据 + slug → 组件
│   ├── src/components/labs/     13 个可视化组件（SVG + three.js）
│   ├── src/components/games/    16 个训练游戏组件
│   ├── src/pages/
│   │   ├── index.vue           首页（单元 + Lab + 游戏分组）
│   │   ├── units/[id].vue      单元页（Lab 清单）
│   │   ├── labs/[id].vue       Lab 页（参数滑块 + 实时公式 + 分步思考）
│   │   └── games/[slug].vue    游戏页
│   ├── test/                   vitest（10 文件 112 用例）
│   ├── e2e/smoke.spec.ts       Playwright 6 用例
│   └── docs/                  课本 OCR 与页面映射
```

## 例题可视化 Lab（可调参数）

| 单元 | 书页 | Lab 数 | 亮点 |
| --- | --- | --- | --- |
| 一 混合运算与数量关系（一） | 1-10 | 4 | 乘加/除加混合（先乘除后加减）、小括号改变运算顺序 |
| 一天的时间（综合与实践） | 11-16 | 2 | 钟面 SVG 24 时制⇄普通制、时间轴经过时间 |
| 二 两、三位数乘一位数 | 17-30 | 5 | 点子图口算、四舍五入估算、竖式逐步（含连续进位、中间 0） |
| 曹冲称象的故事（综合与实践） | 31-35 | 2 | 🐘 等量代换石块、千克/克/吨换算 |
| 三 数据的收集与整理（综合与实践） | 36-49 | 2 | 画"正"字记录、统计表 + 条形图 |
| 四 毫米、分米和千米 | 50-58 | 4 | 直尺 mm-cm SVG、m-cm 分段条、km 路条、5 单位混合换算 |
| 五 平移、旋转和轴对称 | 59-67 | 4 | 平移动画、顺/逆时针旋转、轴对称对折、剪对称图案 |
| 六 两、三位数除以一位数 | 68-85 | 5 | 口算分组、竖式 SVG 逐步（含商中间 0）、有余数除法 |
| 间隔排列（探索规律） | 86-87 | 2 | 环形/直线两端相同或不同的两种物体个数关系 |
| 七 数量关系的分析（一） | 88-94 | 4 | 线段图：还剩多少 / 多几少几 / 变换队形 / 两步计算 |
| 八 观察物体（二） | 95-103 | 3 | 等距三视图投影网格、**three.js 三维可拖拽 + 前/右/上三视图** |
| 附录 倍的认识 | 111-118 | 4 | 倍的含义、求一个数的几倍、求一个数是另一个数的几倍 |

Lab 页布局：左侧可视化（SVG/three.js），右侧参数滑块，下方"分步思考"过程与结论。
数据层只需声明 `params`（滑块定义）与 `formula`，计算逻辑在 `lib/labs/compute.ts`。

## 训练小游戏（16 个）

| 游戏 | 知识点 | 玩法 |
| --- | --- | --- |
| 混合运算快算 | 乘加除加、小括号顺序 | 5 题选答案 |
| 24 时记时法 | 普通⇄24 时制 | 5 题互转 |
| 经过时间 | 结束 − 开始 | 5 题 |
| 乘法口算冲刺 | 整十整百×一位数 | 5 题口算 |
| 竖式乘法填空 | 两三位数×一位数 | 输入结果 |
| 质量单位换算 | 千克/克/吨 | 5 题换算 |
| 长度单位换算 | mm/cm/dm/m/km | 5 题换算 |
| 除法口算冲刺 | 整十整百÷一位数 | 5 题口算 |
| 竖式除法填空 | 两三位数÷一位数 | 选择结果 |
| 平移旋转辨识 | 平移/旋转 | 判断运动方式 |
| 轴对称判断 | 轴对称图形 | 判断是否对称 |
| 统计正字挑战 | 画"正"字统计 | 求合计/分类人数 |
| 间隔排列推理 | 两端相同/不同/围圈 | 判断两种物体个数 |
| 数量关系挑战 | 两步计算（线段图） | 选正确答案 |
| 三视图配对 | 观察物体 | 看 3D 模型选投影 |
| 倍的挑战 | 求几倍 / 求倍数关系 | 5 题 |

## 运行

```bash
cd g3/game
npm run dev          # 开发（PORT 3000）
npm run test         # vitest 112 用例（含共享 GradeShell 组件）
npm run test:e2e     # Playwright 6 用例（NITRO_PRESET=node-server 本地构建）
npm run typecheck    # vue-tsc（shared/theme 的 nuxt/config 提示为既有基线，见 docs/DEVELOPMENT.md §12）
npm run generate     # 静态导出 .output/public（BASE_URL 支持子路径部署 /g3/）
```

已知约定（与 g2/g5/g6 工程一致）：
- `game/` 内 `package.json` 依赖与五年级一致，`node_modules` 可复制共享。
- `vitest.config.ts` 的 `@data` 别名指向 `../data`（本文件夹内）；`@shared` 指向仓库根 `shared/`。
- 布局使用共享 `shared/components/GradeShell.vue`（顶栏年级切换/页脚由 `shared/grades` 注册表驱动）。
- 书页 = PDF 页 - 8；OCR 产物在 `g3/ocr/pages`。
- 跨应用导航（顶栏切年级/回门户）必须用原生 `<a href>`，不能用 NuxtLink/UButton（详见 `docs/DEVELOPMENT.md`）。

## 新增一个 Lab

1. 在 `data/chapters/cN.ts` 加一条 `LabDef`（含 params 滑块定义、formula、可选 fixed 常量）。
2. 若为全新可视化类型，在 `schema/lab.ts` 扩展 `LabKind`、`lib/labs/compute.ts` 加计算分支、
   `components/labs/` 写组件并注册到 `lib/labs/registry.ts`。
3. 跑 `npm run test`（validateLabs 自动校验数据）+ `npm run typecheck`。
