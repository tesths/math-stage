# 第 4 轮 · 三年级（g3）+ 四年级（g4）例题可视化优化报告

- 范围：**g3 41 个 Lab + g4 28 个 Lab，共 69 个**
- 基线：`f698a83`；本轮只改 `g3/`、`g4/`（未动 `shared/`、根 `README.md`、`docs/example-visual-improvements.md`、`scripts/visual-shots.mjs`）
- 逐题机器可读记录：`docs/audit/round4/g3.json`（41 条）、`docs/audit/round4/g4.json`（28 条）
- 截图：`docs/visual-review-screenshots/g3/`（82 张 = 41 × 初始态 + 41 × 过程态）、`docs/visual-review-screenshots/g4/`（56 张 = 28 × 2），**没有 `.notes.txt`**（全量重截后 0 个控制台报错页面）
- 断言：g3 `it` 用例 **123 → 181**（`npx vitest run` 实跑 181 passed / 14 files）；g4 **121 → 157**（实跑 157 passed / 12 files）
- 类型检查：`cd g3/game && npx vue-tsc --noEmit` 与 `cd g4/game && npx vue-tsc --noEmit` 均 exit 0（只剩既有的 `[Vue] Load plugin failed` 无害警告）
- 新增纯函数内核（可单测）：g3 `lib/labs/{arith,length,time,views}.ts`；g4 `lib/labs/{divTry,number,segment}.ts`
- 优先级口径：P0 真错误 > P1 空转 > P2 缺支撑 > P3 打磨，逐项落在 `fixed` 里

## L0–L5 判定分布与判定口径（先看这里，别读成"69/69 全绿"）

| 年级 | L0 | L1 | L2 | L3 | L4 | L5 |
| --- | --- | --- | --- | --- | --- | --- |
| g3（41） | 41 pass | 40 pass / **1 partial** | 37 pass / **4 partial** | 40 pass / **1 partial** | 40 pass / **1 partial** | 41 pass |
| g4（28） | 28 pass | 28 pass | 25 pass / **3 partial** | 28 pass | 28 pass | 28 pass |

合计 **10 处 `partial`**（g3 7 处、g4 3 处），逐条写在对应 lab 的 `remaining` 里，并在下面「逐题记录」用 `[Lx partial]` 标出。
`partial` 是本轮按 Lead 收口口径补的取值（rubric 原文只列 `pass/fail/n-a`），含义是"基本达标但不完全满足"。

**判定方法（也写进了 JSON 的 `method` 字段）**：
- L0：读实现代码 + 抽 `lib/labs/*.ts` 纯函数做单测复算（整数性/单位/坐标/面积/四舍五入），并对照 OCR 页码题干；
- L1：对照课本 OCR 的题干与参数默认值；
- **L2 / L4 是"组件级断言 + 抽样人眼"，不是 69 题逐张人眼验收**（每册约 10 张截图目视 + 改动的 22 个组件逐一核对）——
  所以有这 10 处 `partial`，而不是"全过"；
- L3：靠可证伪证据（md5 不相同 + 组件断言点击前后 DOM/数据变化 + 11 次"改坏→变红→还原"）；
- L5：全量重截 0 报错页面、0 `notes.txt`。

## 过程态证据（-act.png 的可证伪自检）

按 Lead 给的硬口径，逐对比较 `<id>.png` 与 `<id>-act.png` 的 md5：

```
$ for f in docs/visual-review-screenshots/g3/*.png docs/visual-review-screenshots/g4/*.png; do
    case "$f" in *-act.png) continue;; esac
    b="${f%.png}-act.png"; [ -f "$b" ] || continue
    [ "$(md5 -q "$f")" = "$(md5 -q "$b")" ] && echo "同图: $f"; done
（无输出）
```

`scripts/visual-shots.mjs` 自己的汇总行也一致：**g3「假过程态 0 个」、g4「假过程态 0 个」**。
（第一次全量重截时 g3 报过 1 个：`g3-c12-times-mix`——那是"倍的混合练习"分支，确实一张静态图，已补真过程按钮，重截后 md5 不同；
另有 10 个题在更早一版是全等图，逐个补了真操作后复检为 0：g3 `c12-times-concept`、`c12-times-mix`、`c12-times-mul`、`c3-mul-estimate`、`c3-mul-oral`、`c4-equivalent`、`c6-dm-m`、`c8-div-oral`，g4 `c4-mul-solve`、`c7-num-count`。）

**没有一题用 `n-a` 蒙过去**：69 题全部补了"点击后图形/数据真的改变"的操作按钮（唯一的 `n-a` 使用者是 0 题）。

## 逐题记录 · 三年级（41）

- `g3-c1-mix-multadd`（2 页 · mix-calc）改前：乘加混合只有三块静态卡片，"先算乘法、再算加法"看不到步骤；改为逐条出现并高亮当前一步；改后：算式与图上数据加了同一份来源的标注（乘加/减加/带括号三支）；tip 重写为"概念 + 一句易错点"；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c1-mix-multadd.png` / `-act.png`）。
- `g3-c1-mix-divadd`（4 页 · mix-calc）改前：除加混合同样只有静态文字，补"一步一步算"过程与 live 算式；改后：tip 增加易错点（把除法算完忘了再加）；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c1-mix-divadd.png` / `-act.png`）。
- `g3-c1-mix-order`（5 页 · bracket）改前：运算顺序题原来只写一句"先乘后加"，加"第 1/2 步"逐条过程；改后：tip 增易错点：从左往右依次算；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c1-mix-order.png` / `-act.png`）。
- `g3-c1-mix-bracket`（7 页 · bracket）改前：带括号题补括号先行的高亮与分步过程；改后：tip 增易错点：漏算括号；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c1-mix-bracket.png` / `-act.png`）。
- `g3-c2-time24`（12 页 · time24）改前：24 时计时法用两个一模一样的 12 小时钟面并排，看不出 20:00 与 8:00 的对应关系；改为内圈 1–12 + 外圈 13–24 的双环钟面 + 对应连线 + 真实指针角度；改后：另外修掉 math.ts 里 time12Text(0) 写成"凌晨"的问题（0 时应是晚上 12 时）　**[`L2 partial`]**；证据：test/unit/time.test.ts、test/unit/math.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c2-time24.png` / `-act.png`）。
- `g3-c2-elapsed`（13 页 · elapsed）改前：经过时间只给结果，补"一小时一小时往回倒"的过程链与分步文本；改后：tip 增易错点：跨整点时少算 1 小时；证据：test/unit/time.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c2-elapsed.png` / `-act.png`）。
- `g3-c3-mul-oral`（18 页 · mul-oral）改前：整十整百的点子图是静态的，加"一捆一捆地数"过程（未数到的小棒变淡，计数同步）；改后：tip 增易错点：末尾 0 的个数；证据：test/unit/arith.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c3-mul-oral.png` / `-act.png`）。
- `g3-c3-mul-estimate`（19 页 · mul-oral）改前：估算"够不够买"原来只看一个四舍五入后的估计值：24 → 20 时会把 24×9=216 > 180 判成"够买"（真错误）；改为估大/估小/精算三值判定；改后：补"先估大、再估小、最后精算"三步过程；tip 增易错点；证据：test/unit/arith.test.ts、test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c3-mul-estimate.png` / `-act.png`）。
- `g3-c3-mul-pen`（21 页 · mul-pen）改前：竖式乘法原来一次把结果全画出来，补"演示下一步"逐位出现（未算到的数位不显示）；改后：逐位文字与 verticalMul 同一份数据（4×3=12 写 2 进 1）；证据：test/unit/arith.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c3-mul-pen.png` / `-act.png`）。
- `g3-c3-mul-carry`（24 页 · mul-pen）改前：连续进位的进位气泡一次全给，补逐步出现与进位说明；改后：tip 增易错点：忘记加进位；证据：test/unit/arith.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c3-mul-carry.png` / `-act.png`）。
- `g3-c3-mul-zero`（27 页 · mul-pen）改前："中间有 0"的参数 mid 只能取 0，滑块等于死的（学不到 102/120 的区别）；改为 0–9 并补两条易错分支；改后：补逐步竖式与"这一位写 0"的提示；证据：test/unit/arith.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c3-mul-zero.png` / `-act.png`）。
- `g3-c4-equivalent`（31 页 · equivalent）改前："大象 = 几块石头"是用石头总数反推象重再比石头，属于循环论证（真错误）；改为固定象重 + stonesToMatch 求所需块数并给出差额；改后：补两块船 + 水位线 + "再放一块石头"过程；证据：test/unit/arith.test.ts、test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c4-equivalent.png` / `-act.png`）。
- `g3-c4-weight`（34 页 · weight）改前：克/千克/吨只给换算结论，补 10×10 方格（每格 10 克 = 1 千克）与"开始换算"过程；改后：tip 增易错点：进率 1000 写成 100　**[`L4 partial`]**；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c4-weight.png` / `-act.png`）。
- `g3-c5-tally`（37 页 · tally）改前：画"正"字原来一次画满，补逐笔出现；改后：tip 增易错点：一个正字是 5 笔；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c5-tally.png` / `-act.png`）。
- `g3-c5-stat`（38 页 · stat）改前：统计图圆点被 Math.min 静默截断（数据画少了却仍标总数）；改为全部画出并按总数缩放；改后：补一格一格填色过程与"每个小圆点表示 1 人"的标注；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c5-stat.png` / `-act.png`）。
- `g3-c6-mm-cm`（51 页 · length-convert）改前："到哪个单位"参数没有 choices，拖动与题意对不上（形数不同帧）；补单位选项；改后：改为真实毫米刻度尺 + 数刻度过程；tip 增易错点；证据：test/component/labs.test.ts + 2 张截图（`g3-c6-mm-cm.png` / `-act.png`）。　⚠ 仍留：test/unit/length.test.ts
- `g3-c6-length-mix`（52 页 · length-convert）改前：综合换算的"开始换算"路径没有真的沿阶梯走，补 conversionSteps + 逐步高亮与实际数值；改后：tip 增易错点：大单位→小单位用乘还是除；证据：test/unit/length.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c6-length-mix.png` / `-act.png`）。
- `g3-c6-dm-m`（53 页 · length-convert）改前：分米条最多画 20 段（3 米 90 厘米这种就画不全）；改为 meterRows 按米分行、每行 10 格；改后：补"10 厘米一格，一格一格地量"过程；证据：test/unit/length.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c6-dm-m.png` / `-act.png`）。
- `g3-c6-km-m`（55 页 · length-convert）改前：单位阶梯上米→千米也写 ×10（真错误，应为 ×1000）；改为 rateBetween/rateLabel；改后：千米路段原来是 i <= km*10/3 的假比例尺（3 千米填满 10 段、1 千米 3.33 段），改为每段 100 米、10 段 1 千米；证据：test/unit/length.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c6-km-m.png` / `-act.png`）。
- `g3-c7-translate`（60 页 · translate）改前：平移只显示终点，补"一格一格地移"与方向/格数标注；改后：tip 增易错点：数格子少数起点格　**[`L1 partial`]**；证据：test/component/labs.test.ts + 2 张截图（`g3-c7-translate.png` / `-act.png`）。　⚠ 仍留：参数 choices 已补；斜向平移仍只按横竖两个方向（课本有斜向情境）
- `g3-c7-rotate`（61 页 · rotate）改前：旋转图形直接跳到终态，补旋转进度与角度标注（90°/180° 逐帧）；改后：tip 增易错点：顺时针/逆时针搞反；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c7-rotate.png` / `-act.png`）。
- `g3-c7-axis`（63 页 · axis）改前：轴对称只画结果，补"对折"过程与对应点标记；改后：tip 增易错点：对称轴不是图形的一半；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c7-axis.png` / `-act.png`）。
- `g3-c7-symmetry`（64 页 · axis）改前：判断对称只给答案，补对折动画与对应点连线；改后：tip 增易错点：把"看起来像"当对称；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c7-symmetry.png` / `-act.png`）。
- `g3-c8-div-oral`（69 页 · div-oral）改前：整十数除法的分组图是静态的，加"一份一份地分"，答案在分完后才给出；改后：tip 增易错点：商的末尾少写 0；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c8-div-oral.png` / `-act.png`）。
- `g3-c8-div-pen`（71 页 · div-pen）改前：竖式除法一次画完，改为逐轮（开始下一轮/上一轮/重来）+ 每轮的"拿 X 除以 Y，商写在…"；改后：商写到哪一位上面由竖式列号算出，不再手写；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c8-div-pen.png` / `-act.png`）。
- `g3-c8-remainder`（72 页 · remainder）改前：有余数除法补逐轮过程与"余数要比除数小"的即时检查；改后：tip 增易错点：余数等于除数还能再分；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c8-remainder.png` / `-act.png`）。
- `g3-c8-div-more`（75 页 · div-pen）改前：同上的逐轮过程；首位不够商 1 的分支补说明；改后：tip 增易错点：前一位不够除要看前两位；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c8-div-more.png` / `-act.png`）。
- `g3-c8-div-zero`（81 页 · div-pen）改前：商中间有 0 的情况补占位 0 的显示与逐轮过程；改后：tip 增易错点：漏写商中间的 0；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c8-div-zero.png` / `-act.png`）。
- `g3-c9-interval`（86 页 · interval）改前："两端都放/只放一端/都不放"的物体数与间隔数原来只在两端相同时才对（真错误）；改为 intervalCounts 分三种情形；改后：补弧形间隔 + 逐个数间隔的过程；证据：test/unit/arith.test.ts、test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c9-interval.png` / `-act.png`）。
- `g3-c9-interval-circle`（87 页 · interval）改前：封闭图形（围一圈）的间隔数与物体数关系同样按直线处理（真错误）；改为环形间隔计算；改后：补逐段点亮的环形过程；证据：test/unit/arith.test.ts、test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c9-interval-circle.png` / `-act.png`）。
- `g3-c10-segment-total`（89 页 · segment）改前：三条线段原来都从 x=0 起画，互相压住（图形本身错）；改为累计偏移 + 间隔 + 尺寸线；改后：补"同一比例尺"标注与逐步求数量关系的过程；tip 增易错点　**[`L2 partial`]**；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c10-segment-total.png` / `-act.png`）。　⚠ 仍留：多段线段图仍按总长等比缩放，段数很多时标注会挤
- `g3-c10-segment-more`（90 页 · segment）改前："多 15 个/多 20 个"的对比段与主段重叠 → 改成拼接 + 差值标注；改后：补数量关系式与分步过程　**[`L2 partial`]**；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c10-segment-more.png` / `-act.png`）。
- `g3-c10-times-word`（90 页 · segment）改前："少 13 幅"的线段与总线段没有对齐关系，改为同一比例尺 + 差值段；改后：补关系式与分步过程　**[`L2 partial`]**；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c10-times-word.png` / `-act.png`）。
- `g3-c10-rows`（91 页 · segment）改前："每行几个 × 几行"原来是静态网格，加一行一行出现的过程；改后：tip 增易错点（行数与每行个数搞反）；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c10-rows.png` / `-act.png`）。
- `g3-c11-views3d`（96 页 · views3d）改前：3D 视图缺少与三视图的对应关系，补 viewGrids 驱动的投影与"绕物体转一圈"；改后：tip 增易错点：把上面看的形状当成前面　**[`L3 partial`]**；证据：test/unit/views.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c11-views3d.png` / `-act.png`）。　⚠ 仍留：3D 旋转只改变观察角度，不改变方块数据（L3 的"过程"是观察过程，不是数量过程）
- `g3-c11-views-cube`（98 页 · views）改前：结论"前面 6 个方格一排"是硬编码字符串，与画的 2×3×1 立体图矛盾（真错误）；改为 viewGrids 由同一份方块数据算出三视图；改后：三视图加尺寸标注（几列 × 几行）与"一列一列放"过程；证据：test/unit/views.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c11-views-cube.png` / `-act.png`）。
- `g3-c11-views-match`（100 页 · views）改前：三视图与立体图原来各画一套数据；改为共享 viewGrids；改后：补逐格放置过程与行列数标注；证据：test/unit/views.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c11-views-match.png` / `-act.png`）。
- `g3-c12-times-concept`（112 页 · times）改前："几个几"是静态卡片，加"一盒一盒地数"（未数到的盒子变淡，计数同步变化）；改后：tip 增易错点：3 个 4 与 4 个 3；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c12-times-concept.png` / `-act.png`）。
- `g3-c12-times-mul`（113 页 · times-mul）改前："求几倍"静态展示，加"一组一组摆出来"过程；改后：tip 增易错点：把"几倍"当"多几"；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c12-times-mul.png` / `-act.png`）。
- `g3-c12-times-div`（115 页 · times-div）改前："求一个数是另一个数的几倍"原来直接给 2.33 这种非整数倍（与"倍"的定义矛盾）；改为商 + 余数并说明不是整倍数；改后：补"一圈一圈地分"过程；tip 增易错点；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c12-times-div.png` / `-act.png`）。
- `g3-c12-times-mix`（116 页 · times-div）改前：混合题用"≈ 5 倍"把非整倍数四舍五入成倍（真错误）；改为如实给商和余数；改后：补"先求爸爸年龄、再求倍数"两步过程；tip 增易错点；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g3-c12-times-mix.png` / `-act.png`）。
## 逐题记录 · 四年级（28）

- `g4-c1-div-oral`（2 页 · div-oral）改前：整十数口算只有静态"几包"，补"一包一包地分"（未分到的包变淡）；改后：tip 增易错点：把 60÷20 算成 30；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c1-div-oral.png` / `-act.png`）。
- `g4-c1-div-try`（5 页 · div-try）改前：试商是循环论证：直接用精确商再"验算"，永远通过（学生会以为试商不必调商）；改为 roundDivisor + trialRound 真试商（估除数→初商→乘积超了调小/余数不小于除数调大）；改后：补"一步一步试商"过程，192÷24 会显示"初商偏大，调小成 8"；证据：test/unit/divTry.test.ts、test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c1-div-try.png` / `-act.png`）。
- `g4-c1-div-pen`（9 页 · div-pen）改前：竖式一次全画完，补"开始下一轮/上一轮/重来"与每轮数位说明（商写在哪一位）；改后：修掉商为两位数时最前面多画一个空商位（被除数三位、商两位）；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c1-div-pen.png` / `-act.png`）。
- `g4-c1-div-route`（11 页 · div-route）改前：两步连除只有公式，补"两步算下去"逐条出现与进度；改后：tip 增易错点：连除顺序与括号；证据：test/unit/compute.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c1-div-route.png` / `-act.png`）。
- `g4-c2-peri-rect`（24 页 · peri-rect）改前：参数默认值 12×8 与题干 36×24 不一致（学生调不到课本数据）；改为 36/24 并放宽上限；改后：补两侧尺寸线（带端点）与"把四条边拉直"过程（长+宽+长+宽 拉成一条直线）；tip 增易错点：只算一条长加一条宽　**[`L2 partial`]**；证据：test/component/labs.test.ts + 2 张截图（`g4-c2-peri-rect.png` / `-act.png`）。　⚠ 仍留：长宽比很大时仍靠整体缩放，格子会变小
- `g4-c2-peri-square`（25 页 · peri-square）改前：边长默认 12 与题干 25 不一致；改为 25；改后：补尺寸线与四条边拉直过程；tip 增易错点：周长与面积公式混用；证据：test/component/labs.test.ts + 2 张截图（`g4-c2-peri-square.png` / `-act.png`）。
- `g4-c2-area-grid`（29 页 · area-grid）改前：格子只在 CSS 里生成、没有单位标注与过程；改为 SVG 单位方格 + 一排一排铺满 + 每排个数×排数标注；改后：tip 增易错点：把每排个数与排数相加；证据：test/component/labs.test.ts + 2 张截图（`g4-c2-area-grid.png` / `-act.png`）。
- `g4-c2-area-rect`（31 页 · area-rect）改前：只标了长，没有宽、没有单位方格，S=a×b 只能背；补两侧尺寸线 + 40 个 1 平方厘米方格 + 逐排铺满；改后：tip 增易错点：用周长公式算面积；证据：test/component/labs.test.ts + 2 张截图（`g4-c2-area-rect.png` / `-act.png`）。
- `g4-c2-area-square`（32 页 · area-square）改前：同上：补尺寸线、单位方格与铺满过程；改后：tip 增易错点：边长×4 当面积；证据：test/component/labs.test.ts + 2 张截图（`g4-c2-area-square.png` / `-act.png`）。
- `g4-c2-area-unit`（36 页 · area-unit）改前：100 个小正方形一次全亮，"1 平方分米 = 100 平方厘米"只能背；补一排一排铺满（10/20/…/100）；改后：tip 增易错点：面积进率当成 10；证据：test/component/labs.test.ts + 2 张截图（`g4-c2-area-unit.png` / `-act.png`）。
- `g4-c3-peri-area-change`（43 页 · peri-area-change）改前：只能看参数对应的一种拼法，补"换一种拼法"在 5 种拼法间切换（面积不变、周长变）；改后：tip 增易错点：以为面积不变周长就不变；证据：test/component/labs.test.ts + 2 张截图（`g4-c3-peri-area-change.png` / `-act.png`）。
- `g4-c4-mul-meaning`（46 页 · mul-meaning）改前：点阵静态，补"一组一组地数"与每组个数标注；改后：tip 增易错点：3 个 4 与 4 个 3；证据：test/component/labs.test.ts + 2 张截图（`g4-c4-mul-meaning.png` / `-act.png`）。
- `g4-c4-mul-total`（49 页 · mul-total）改前：数量超过 12 就"…共 N 个"（30 支时只画 12 支），改为全部画出并按数量缩小；补"一个一个地买"过程；改后：tip 增易错点：单价×数量 与 单价+数量　**[`L2 partial`]**；证据：test/component/labs.test.ts + 2 张截图（`g4-c4-mul-total.png` / `-act.png`）。　⚠ 仍留：数量很大时单个商品图标停止缩小（>10 支时仍有可能换行）
- `g4-c4-mul-distance`（51 页 · mul-distance）改前：小人位置用 min(300, 米×2.2) 封顶（超过 136 米就不动了，图与数值脱钩，假比例尺）；改为每分钟一段、段长恒定、段数=分钟数；改后：补"走 1 分钟"过程与已走米数实时标注；tip 增易错点：路程用除法；证据：test/component/labs.test.ts + 2 张截图（`g4-c4-mul-distance.png` / `-act.png`）。
- `g4-c4-mul-solve`（55 页 · mul-solve）改前：题干"3 本 18 元"写死在文字里，改单价参数后文字与算式矛盾（真错误）；改为由单价算出已知条件；改后：补"先求单价，再求总价"两步过程；证据：test/component/labs.test.ts + 2 张截图（`g4-c4-mul-solve.png` / `-act.png`）。
- `g4-c5-mix-three`（59 页 · mix-three）改前：三步混合只有柱状图 + 三条算式，补"一步一步算"（先乘、再加、最后减）；改后：tip 增易错点：从左往右依次算；证据：test/component/labs.test.ts + 2 张截图（`g4-c5-mix-three.png` / `-act.png`）。
- `g4-c5-mix-bracket`（61 页 · mix-bracket）改前：小括号题补"一步一步算"（括号里的乘法→减法→除法）；改后：tip 增易错点：漏算括号；证据：test/component/labs.test.ts + 2 张截图（`g4-c5-mix-bracket.png` / `-act.png`）。
- `g4-c5-mix-segment`（62 页 · mix-segment）改前："橘子比梨少"可能比梨还多 → 画出负数长度线段、算式出现负数箱（真错误）；改为 segModel 约束并如实提示；改后：苹果那一条改为 times 段、每段 = 梨 + 橘子；补"先画梨→再画橘子→最后苹果"三步过程；证据：test/unit/segment.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c5-mix-segment.png` / `-act.png`）。
- `g4-c6-travel-plan`（65 页 · travel-plan）改前：四项费用一次全给，补"一项一项算"（含已算合计）；改后：tip 增易错点：漏算住宿或餐费；证据：test/component/labs.test.ts + 2 张截图（`g4-c6-travel-plan.png` / `-act.png`）。
- `g4-c7-num-count`（69 页 · num-count）改前：不是整份数时显示"2.5 个万"（真错误）；改为"2 个万，还剩 5000"；改后：补一个一个数的过程（从 0 开始，计数与方块同步）；证据：test/unit/number.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c7-num-count.png` / `-act.png`）。
- `g4-c7-num-multidigit`（75 页 · num-multidigit）改前：补四位一级分级的展示与切换（从右边起分级）；改后：tip 增易错点：从左边开始分级；证据：test/unit/number.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c7-num-multidigit.png` / `-act.png`）。
- `g4-c7-num-place`（78 页 · num-place）改前：数位顺序表静态，补"从高位往低位一位一位看"的过程；改后：tip 增易错点：数位与计数单位说反；证据：test/component/labs.test.ts + 2 张截图（`g4-c7-num-place.png` / `-act.png`）。
- `g4-c7-num-approx`（81 页 · num-approx）改前：用 digitsOf(v)[3] 取"千位"，实际取到百位：385204 会被判成"不满 5 舍去"却进位到 39 万（真错误）；改为 thousandsDigit/roundToWan；改后：补"看千位决定进不进"的过程按钮；证据：test/unit/number.test.ts、test/component/labs.test.ts + 2 张截图（`g4-c7-num-approx.png` / `-act.png`）。
- `g4-c7-num-idcode`（83 页 · num-idcode）改前：身份证只标了出生日期一段，补一段一段读的过程与三段分区标注；改后：tip 增易错点：月、日不补 0；证据：test/component/labs.test.ts + 2 张截图（`g4-c7-num-idcode.png` / `-act.png`）。
- `g4-c8-measure-story`（90 页 · measure-story）改前：三张换算卡片没有任何图形支撑；补 1 尺 = 23 厘米 与 1 米 的同一比例尺长短对比图；改后：补一件一件量的过程；tip 增易错点：把古代 1 尺当 1 米；证据：test/component/labs.test.ts + 2 张截图（`g4-c8-measure-story.png` / `-act.png`）。
- `g4-c9-big-mul`（96 页 · big-mul）改前：数位没对齐（真错误）：两个因数画在 x=130~190，两个部分积却各自右对齐到 250/220，还有个孤立的 0 落在 230，照着抄必然错位；改为共用个位线，第二部分积整体左移一位、个位补 0；改后：补"先乘个位、再乘十位、再相加"三步过程与数位列标注；证据：test/component/labs.test.ts + 2 张截图（`g4-c9-big-mul.png` / `-act.png`）。
- `g4-c9-big-calc`（101 页 · big-calc）改前：规律只给结果，补"末两位 25、前面 n×(n+1)"两步验算过程；改后：tip 增易错点：前面算成 n×n；证据：test/component/labs.test.ts + 2 张截图（`g4-c9-big-calc.png` / `-act.png`）。
- `g4-c9-big-1yi`（105 页 · big-1yi）改前：纸堆高度用 min(140, 米/20) 假比例尺（一超过就压平，1 亿张与 1000 万张看起来一样高）；改为与珠峰共用同一比例尺；改后：补"和珠穆朗玛峰比一比"的对比结论　**[`L2 partial`]**；证据：test/component/labs.test.ts + 2 张截图（`g4-c9-big-1yi.png` / `-act.png`）。　⚠ 仍留：珠峰仍画成示意三角，没有按真实地形绘制

## 断言"能失败"自检（改坏 → 跑红 → 还原）

每条新断言都做过一次"故意改坏实现，确认断言变红，再原样还原"的验证（还原后两册全绿）：

| 改坏的位置 | 手法 | 变红的用例数 |
| --- | --- | --- |
| `g3/lib/labs/length.ts` `rateBetween` | 米↔千米 硬写成 10 倍 | g3 3 个 |
| `g3/lib/labs/length.ts` `conversionSteps` | 乘除方向对调 | g3 4 个 |
| `g3/lib/labs/arith.ts` `intervalCounts` | `sameEnds` 恒为真 | g3 1 个 |
| `g3/lib/labs/time.ts` `handAngles` | 分针 5°/分；时针不加上分钟部分 | g3 各 1 个 |
| `g3/components/TimesLab.vue` | 概念分支去掉"变淡"class | g3 1 个 |
| `g3/components/LengthLab.vue` | 分米行去掉"已量格数"class | g3 1 个 |
| `g4/lib/labs/number.ts` `thousandsDigit` | 改成取百位（旧 bug） | g4 5 个 |
| `g4/lib/labs/divTry.ts` `trialRound` | 去掉"偏大调小"分支 | g4 5 个 |
| `g4/lib/labs/segment.ts` `segModel` | 不夹取"少"的上限 | g4 2 个 |
| `g4/components/QuantityLab.vue` | `solveStep` 初值 2 → 0 | g4 1 个 |
| `g4/components/NumberLab.vue` | 计数从满值开始（旧行为） | g4 1 个 |

## 旧证据过期情况

本轮发现"旧证据本身不可信"的三类情况，逐类说明（这也是为什么本轮全部 69 题重截、重算，而不是复用旧图）：

### ① 旧截图里的问题，当前基线代码已经没有了（旧证据过期，不能作为 P0 依据）

- **`g4-c1-div-try`「6 ÷ 24 = 4」**：Lead 复核指出这条来自 2026-08-11 的旧截图。本轮我在 3114 端口实跑该页，
  基线 `penSteps` 的乘积是正确的（96 ÷ 24 = 4，乘积 96、余数 0），**截图里的 6 是过期证据**；
  该题真正的问题是另一件事（P0/P1 兼有）：试商直接用 `Math.floor(dividend / divisor)` 拿精确商再"验算"，属于循环论证，
  学生永远看不到"初商偏大要调小"。已改成 `divTry.ts` 的真试商，并在报告/JSON 里按"循环论证"记 L0。
- **`g4-c9-big-1yi` 的旧图**：旧图里纸堆和珠峰"看起来差不多高"，容易被当成比例正确；
  实际代码是 `min(140, 米/20)`，一超过 140px 就压平。旧截图**掩盖**了假比例尺，不是证明它没问题。

### ② 旧截图看不出、但代码确实错的（旧证据"沉默失败"）

- `g3-c11-views-cube`：结论文字"前面 6 个方格一排"是硬编码，与画的 2×3×1 立体图矛盾；旧截图只看画面是"对的"。
- `g3-c5-stat`：`Math.min(...)` 静默截断圆点，数据画少了但总数照写；旧截图上只看总数看不出少画。
- `g4-c7-num-approx`：用 `digitsOf(v)[3]` 当千位（实际是百位）；384204 的判定文字"舍去"和结果 38 万恰好一致，
  385204 才会暴露矛盾（"不满 5 舍去"却进了 1 位）。旧截图用的就是 384204，**恰好掩盖了 bug**。

### ③ 旧证据链里"初态被拍成空白 / -act 反而正常"

Agent A 升级 `scripts/visual-shots.mjs` 后（等 ClientOnly 的「加载可视化…」占位消失）我全量重截了一遍；
本轮我这两册在旧脚本下没有出现空白初态，但 `g3-c1-mix-multadd` 在全量重截时曾报过一次
`TypeError: Cannot read properties of null (reading 'innerText')`——那是 dev server 冷启动时首个页面的瞬时错误，
单页复跑 0 报错，`notes.txt` 已删除；现在两册全部 0 报错。

## 本轮没做到 / 做不动（诚实清单）

`[lab xxx]` 的已写进对应 lab 的 `remaining`；`[global]` 的写在两个 JSON 顶层的 `globalRemaining`。

1. `[lab g3-c11-views3d]` **`g3-c11-views3d` 的 3D 视角不是"数量过程"**：加了"绕物体转一圈"，但转的是相机，方块数据不变；
   L3 只能算"观察过程"，无法像三视图那样"多放一块就多一格"。要真正做到需要可拖拽的方块编辑器，本轮没做。
2. `[lab g3-c10-segment-total / -segment-more / -times-word]` **`g3-c10-segment-*` 的长线段仍靠整体缩放**：段数多（如 60 幅）时比例尺压得很小，文字标注会互相挤压；
   要治本需要"局部放大镜"或分页线段图，我没做。
3. `[lab g3-c7-translate]` **`g3-c7-translate` 只支持横/竖平移**：课本有斜向平移题，参数里仍只有两个方向；
   做斜向要重写坐标映射与格点吸附，本轮时间不够。
4. `[lab g4-c4-mul-total]` **`g4-c4-mul-total` 数量极大时（> 30 支）图标换行**：已改成"全部画出 + 按数量缩小"，但缩到 34px 后仍会换行，
   视觉上不如课本的"一盒一盒"。要更好需要图标分组成盒。
5. `[lab g4-c9-big-1yi]` **`g4-c9-big-1yi` 的珠峰还是示意图**：共用比例尺解决了"谁高"，但山峰是三角剪影，不是真实轮廓；
   要贴课本照片感需要图片资源，我没有引入外部资源。
6. `[lab g3-c2-time24]` **`g3-c2-time24` 的 24 小时双环钟面在窄屏（< 360px）挤**：外圈 13–24 与内圈 1–12 在小屏上字会重叠；
   因为 Nuxt 页面宽度可控，本轮没做响应式缩写（可用 `viewBox` 缩放缓解）。
7. `[lab g4-c2-peri-rect]` **`g4-c2-peri-rect` 长宽比很大时（40×1）方格/尺寸线仍偏挤**：只做了整体等比缩放，没有自适应换行标注。
8. `[global]` **没有做"跨年级一致性"复核**：g3 与 g4 的 `tip` 写法我按同一模板（概念 + 一句易错点）重写，
   但没有和 g5/g6 的既有 `tip` 风格逐条对比，可能存在措辞风格差异。
9. `[lab g3-c4-weight]` **`g3-c4-weight` 的"1 吨"情境**：课本用"大宗货物"情境，我保留了参数但没有吨级实际物品图（只有格子），
   学用价值弱于其他题。
10. `[global]` **声音/动画无障碍**：所有过程按钮都没有做 `aria-live` 播报，键盘可用但读屏体验未验证。

## 结论：这些可视化到底帮不帮得到学生/老师（第一手判断）

- **真的有用的一类**：能"一按就看见变化"的题——`peri-rect` 把长宽高拉成一条直线（周长 = 四条边）、
  `area-rect` 一格一格铺满 40 格、`div-try` 的"初商偏大，调小成 8"、`time24` 的双环钟面 + 对应连线。
  这几处我按"老师会不会拿它上课"的标准自查过：数值与图形同帧、错误能被自己看见，可以直接投屏讲。
- **仍然一般的一类**：把"结论"做得很漂亮但过程只有一两步的（如 `big-calc` 的末两位 25、
  `num-idcode` 的三段分区）。它们对"记结论"有帮助，对"为什么"帮助有限。
- **偏弱**：`views3d`（只能转视角）、`measure-story`（古今单位只能靠文字感受）、`big-1yi`（珠峰是剪影）。
  这三处如果要进课堂，我建议下一步优先改，而不是继续打磨其他题的视觉细节。
- **给老师的一句话**：这批题现在**默认不剧透结论**，先点"试一试"再看结论；如果有老师反映"太啰嗦"，
  应该给一个"直接看结论"的开关，而不是把过程删掉。
