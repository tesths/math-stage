# 第 4 轮客观度量表（g1–g6）

> 生成时间：2026-10-24T03:45:39.287Z · 生成脚本：`node scripts/visual-metrics.mjs`
>
> **性质说明（必须一并读）**：这是**启发式静态度量**（正则扫源码 + 数测试断言 + 数截图文件），只回答「代码里有没有这类能力」，不构成教学效果证据；也不能判断「图形是否按真实比例」「结论是否循环论证」这类需要人看的 L0 问题。
>
> 判定口径见文末「方法」一节；明细见 `docs/audit/round4/metrics.json`。

## 1. 六册覆盖率对照

| 年级 | Lab 数 | 组件数 | 有操作 `hasAction` | 有概念追问 `hasConceptPrompt` | 组件内步骤列表 | 可步进 `hasStepControl` | 声明真实单位 `hasUnits` | 有尺寸/方格 `hasDims` | 参数合计 | 断言合计 | 截图合计 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| g1 | 78 | 8 | 13/78（16.7%） | 0/78（0%） | 5/78 | 28/78（35.9%） | 7/78 | 53/78（67.9%） | 0 | 460 | 156 |
| g2 | 22 | 8 | 10/22（45.5%） | 22/22（100%） | 0/22 | 14/22（63.6%） | 0/22 | 22/22（100%） | 41 | 265 | 44 |
| g3 | 41 | 13 | 28/41（68.3%） | 41/41（100%） | 10/41 | 18/41（43.9%） | 0/41 | 40/41（97.6%） | 103 | 216 | 82 |
| g4 | 28 | 10 | 11/28（39.3%） | 28/28（100%） | 4/28 | 8/28（28.6%） | 0/28 | 25/28（89.3%） | 61 | 199 | 56 |
| g5 | 33 | 10 | 33/33（100%） | 33/33（100%） | 0/33 | 18/33（54.5%） | 8/33 | 26/33（78.8%） | 74 | 864 | 66 |
| g6 | 47 | 15 | 47/47（100%） | 47/47（100%） | 0/47 | 35/47（74.5%） | 0/47 | 40/47（85.1%） | 104 | 1922 | 94 |
| **合计** | 249 | — | 142（57%） | 171（68.7%） | 19 | 121（48.6%） | 15 | 206（82.7%） | 383 | 3926 | 498 |

读法提醒：

- `hasAction` 是**组件级**结论：一个组件服务 N 个 Lab 时，这 N 行会同时为真（例如 g5 `MotionLab` 服务 5 个 Lab）。所以它不代表「每个 Lab 都有各自专属的操作」。
- `hasConceptPrompt` 对 g2–g4 为 0，原因是**这三册的 Lab 页根本没有渲染 `ConceptTip`**（数据层有 `tip`，页面从不读），不是这些题没有概念。这是本轮量出来的结构性缺口。
- `hasUnits` 对 g1–g4 很低/为 0，原因是这三册数据 schema **没有 `units` 字段**（只有 g5/g6 有）。同样不是「题里没有单位」，而是「单位写不进数据层」。
- g1 的组件共享情况：78 个 Lab 与其他 Lab 共用一个组件，0 个 Lab 独占一个组件——共用组件时「有操作」是**同一批按钮**在服务多道题。
- g2 的组件共享情况：20 个 Lab 与其他 Lab 共用一个组件，2 个 Lab 独占一个组件——共用组件时「有操作」是**同一批按钮**在服务多道题。
- g3 的组件共享情况：40 个 Lab 与其他 Lab 共用一个组件，1 个 Lab 独占一个组件——共用组件时「有操作」是**同一批按钮**在服务多道题。
- g4 的组件共享情况：24 个 Lab 与其他 Lab 共用一个组件，4 个 Lab 独占一个组件——共用组件时「有操作」是**同一批按钮**在服务多道题。
- g5 的组件共享情况：32 个 Lab 与其他 Lab 共用一个组件，1 个 Lab 独占一个组件——共用组件时「有操作」是**同一批按钮**在服务多道题。
- g6 的组件共享情况：47 个 Lab 与其他 Lab 共用一个组件，0 个 Lab 独占一个组件——共用组件时「有操作」是**同一批按钮**在服务多道题。
- 「组件内步骤列表」只统计**组件自己** v-for 渲染的步骤；g2–g6 的 Lab 页统一渲染 `compute` 返回的 `steps` 文字（人人都有），所以真正稀缺的是「步进控件」与「过程态图形变化」。
- `testsCount` 只数断言条数，不判断断言质量；`shotCount` 只数文件个数，不判断截图上图形对不对。

## 2. 逐 Lab 明细

图例：✅ 有 / ❌ 无；`组件` 列的 `*` 表示该组件被多个 Lab 共享。

### g1（78 个 Lab，8 个组件）

| id | 页 | kind | 组件 | 操作 | 概念追问 | 组件步骤列表 | 步进控件 | 单位 | 尺寸/方格 | 参数 | 断言 | 截图 |
| --- | ---: | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | ---: | ---: | ---: |
| `c1-count-01` | 2 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 0 | 6 | 2 |
| `c1-count-02` | 3 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 0 | 4 | 2 |
| `c1-count-03` | 4 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 0 | 4 | 2 |
| `c1-compare-01` | 4 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c1-count-04` | 5 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 0 | 4 | 2 |
| `c1-count-05` | 6 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 0 | 4 | 2 |
| `c2-count-01` | 12 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 4 | 2 |
| `c2-write-01` | 13 | write | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 7 | 2 |
| `c2-count-02` | 14 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 0 | 4 | 2 |
| `c2-write-02` | 15 | write | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 7 | 2 |
| `c2-ordinal-01` | 16 | ordinal | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c2-count-03` | 18 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 10 | 2 |
| `c2-compare-01` | 20 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c2-compare-02` | 21 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c2-addsub-01` | 25 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c2-addsub-02` | 27 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c2-addsub-03` | 26 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c2-addsub-04` | 28 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c3-position-01` | 32 | position | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c3-position-02` | 32 | position | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c3-position-03` | 33 | position | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c3-position-04` | 34 | position | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c3-ordinal-01` | 32 | ordinal | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c4-count-01` | 36 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 4 | 2 |
| `c4-count-02` | 37 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 4 | 2 |
| `c4-write-01` | 37 | write | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 7 | 2 |
| `c4-count-03` | 39 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 4 | 2 |
| `c4-ordinal-01` | 38 | ordinal | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c4-split-01` | 39 | split | SplitGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c4-addsub-01` | 40 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c4-addsub-02` | 40 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c4-addsub-03` | 41 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c4-addsub-04` | 42 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c4-addsub-05` | 43 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c4-addsub-06` | 44 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c4-addsub-07` | 45 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c4-compare-01` | 39 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c5-shape3d-01` | 54 | shape3d | Shape3DGame.vue* | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | 0 | 8 | 2 |
| `c5-shape3d-02` | 54 | shape3d | Shape3DGame.vue* | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | 0 | 8 | 2 |
| `c5-shape3d-03` | 55 | shape3d | Shape3DGame.vue* | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | 0 | 8 | 2 |
| `c5-shape3d-04` | 55 | shape3d | Shape3DGame.vue* | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | 0 | 8 | 2 |
| `c5-shape3d-05` | 56 | shape3d | Shape3DGame.vue* | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | 0 | 8 | 2 |
| `c5-ordinal-01` | 59 | ordinal | PositionGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c6-count-01` | 63 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 4 | 2 |
| `c6-count-02` | 64 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 0 | 4 | 2 |
| `c6-write-01` | 63 | write | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 7 | 2 |
| `c6-compare-01` | 64 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c6-split-01` | 70 | split | SplitGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c6-split-02` | 70 | split | SplitGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c6-split-03` | 70 | split | SplitGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |
| `c6-addsub-01` | 66 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c6-addsub-02` | 66 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c6-addsub-03` | 68 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c6-addsub-04` | 69 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c6-ten-01` | 66 | ten | TenGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0 | 8 | 2 |
| `c7-ten-01` | 75 | ten | TenGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0 | 8 | 2 |
| `c7-ten-02` | 75 | ten | TenGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0 | 8 | 2 |
| `c7-ten-03` | 76 | ten | TenGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0 | 8 | 2 |
| `c7-ten-04` | 76 | ten | TenGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0 | 8 | 2 |
| `c8-numberline-01` | 79 | numberline | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 7 | 2 |
| `c8-numberline-02` | 79 | numberline | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 7 | 2 |
| `c8-numberline-03` | 80 | numberline | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 7 | 2 |
| `c8-numberline-04` | 81 | numberline | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 7 | 2 |
| `c8-numberline-05` | 81 | numberline | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 7 | 2 |
| `c8-sequence-01` | 80 | sequence | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 17 | 2 |
| `c8-sequence-02` | 81 | sequence | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 17 | 2 |
| `c8-addsub-01` | 82 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c8-addsub-02` | 83 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c8-addsub-03` | 83 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c8-compare-01` | 81 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c8-compare-02` | 86 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c9-write-01` | 90 | write | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 7 | 2 |
| `c9-count-01` | 91 | count | CountGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 4 | 2 |
| `c9-compare-01` | 90 | compare | CompareGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 6 | 2 |
| `c9-addsub-01` | 91 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c9-addsub-02` | 91 | addsub | AddSubGame.vue* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 0 | 2 | 2 |
| `c9-numberline-01` | 90 | numberline | NumberLineGame.vue* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 7 | 2 |
| `c9-split-01` | 91 | split | SplitGame.vue* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 0 | 9 | 2 |

### g2（22 个 Lab，8 个组件）

| id | 页 | kind | 组件 | 操作 | 概念追问 | 组件步骤列表 | 步进控件 | 单位 | 尺寸/方格 | 参数 | 断言 | 截图 |
| --- | ---: | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | ---: | ---: | ---: |
| `g2-c1-groups-mult` | 2 | groups | MultLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 24 | 2 |
| `g2-c1-mult-table-5` | 10 | mult-table | MultLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 3 | 2 |
| `g2-c1-mult-table-6` | 12 | mult-table | MultLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 0 | 2 |
| `g2-c2-divide-share` | 20 | divide-share | DivideLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 15 | 2 |
| `g2-c2-divide-group` | 22 | divide-group | DivideLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 5 | 2 |
| `g2-c2-quotient` | 28 | quotient | DivideLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 12 | 2 |
| `g2-c3-tangram` | 34 | tangram | TangramLab.vue | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 28 | 2 |
| `g2-c4-mult-table-7` | 40 | mult-table | MultLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 0 | 2 |
| `g2-c4-mult-table-8` | 44 | mult-table | MultLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 0 | 2 |
| `g2-c4-mult-table-9` | 48 | mult-table | MultLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 0 | 2 |
| `g2-c4-table-calc` | 52 | table-calc | CalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 5 | 2 |
| `g2-c5-direction` | 57 | direction | DirectionLab.vue | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 15 | 2 |
| `g2-c6-place-value` | 65 | place-value | NumberLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 7 | 2 |
| `g2-c6-compare` | 67 | compare | NumberLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 19 | 2 |
| `g2-c6-abacus` | 69 | abacus | NumberLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 10 | 2 |
| `g2-c7-twodigit-add` | 79 | twodigit-add | TwodigitLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 4 | 23 | 2 |
| `g2-c7-twodigit-sub` | 81 | twodigit-sub | TwodigitLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 4 | 45 | 2 |
| `g2-c8-money` | 87 | money | MoneyLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 11 | 2 |
| `g2-c8-money-calc` | 89 | money-calc | MoneyLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 10 | 2 |
| `g2-c9-remainder` | 92 | remainder | CalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 20 | 2 |
| `g2-c9-remainder-rule` | 93 | remainder-rule | CalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 10 | 2 |
| `g2-c10-review-calc` | 99 | table-calc | CalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 3 | 2 |

### g3（41 个 Lab，13 个组件）

| id | 页 | kind | 组件 | 操作 | 概念追问 | 组件步骤列表 | 步进控件 | 单位 | 尺寸/方格 | 参数 | 断言 | 截图 |
| --- | ---: | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | ---: | ---: | ---: |
| `g3-c1-mix-multadd` | 2 | mix-calc | MixCalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 8 | 2 |
| `g3-c1-mix-divadd` | 4 | mix-calc | MixCalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 7 | 2 |
| `g3-c1-mix-order` | 5 | bracket | MixCalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 6 | 2 |
| `g3-c1-mix-bracket` | 7 | bracket | MixCalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 5 | 2 |
| `g3-c2-time24` | 12 | time24 | TimeLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 26 | 2 |
| `g3-c2-elapsed` | 13 | elapsed | TimeLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 5 | 2 |
| `g3-c3-mul-oral` | 18 | mul-oral | MulLab.vue* | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | 2 | 7 | 2 |
| `g3-c3-mul-estimate` | 19 | mul-oral | MulLab.vue* | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | 3 | 10 | 2 |
| `g3-c3-mul-pen` | 21 | mul-pen | MulLab.vue* | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | 3 | 10 | 2 |
| `g3-c3-mul-carry` | 24 | mul-pen | MulLab.vue* | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | 4 | 5 | 2 |
| `g3-c3-mul-zero` | 27 | mul-pen | MulLab.vue* | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | 4 | 5 | 2 |
| `g3-c4-weight` | 34 | weight | WeightLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 2 | 2 |
| `g3-c4-equivalent` | 31 | equivalent | WeightLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 8 | 2 |
| `g3-c5-tally` | 37 | tally | TallyLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 4 | 2 | 2 |
| `g3-c5-stat` | 38 | stat | TallyLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 4 | 6 | 2 |
| `g3-c6-mm-cm` | 51 | length-convert | LengthLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 1 | 2 |
| `g3-c6-dm-m` | 53 | length-convert | LengthLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 4 | 2 |
| `g3-c6-km-m` | 55 | length-convert | LengthLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 2 | 2 |
| `g3-c6-length-mix` | 52 | length-convert | LengthLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 10 | 2 |
| `g3-c7-translate` | 60 | translate | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 5 | 2 |
| `g3-c7-rotate` | 61 | rotate | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 5 | 2 |
| `g3-c7-axis` | 63 | axis | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 1 | 2 |
| `g3-c7-symmetry` | 64 | axis | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 1 | 2 |
| `g3-c8-div-oral` | 69 | div-oral | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 2 | 6 | 2 |
| `g3-c8-div-pen` | 71 | div-pen | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 3 | 4 | 2 |
| `g3-c8-div-more` | 75 | div-pen | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 4 | 1 | 2 |
| `g3-c8-remainder` | 72 | remainder | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 2 | 4 | 2 |
| `g3-c8-div-zero` | 81 | div-pen | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 4 | 1 | 2 |
| `g3-c9-interval` | 86 | interval | IntervalLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 6 | 2 |
| `g3-c9-interval-circle` | 87 | interval | IntervalLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 2 | 2 |
| `g3-c10-segment-total` | 89 | segment | SegmentLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 1 | 2 |
| `g3-c10-segment-more` | 90 | segment | SegmentLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 6 | 2 |
| `g3-c10-rows` | 91 | segment | SegmentLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 1 | 2 |
| `g3-c10-times-word` | 90 | segment | SegmentLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 5 | 2 |
| `g3-c11-views-cube` | 98 | views | ViewsLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 1 | 2 |
| `g3-c11-views-match` | 100 | views | ViewsLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 9 | 2 |
| `g3-c11-views3d` | 96 | views3d | Views3DLab.vue | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 1 | 1 | 2 |
| `g3-c12-times-concept` | 112 | times | TimesLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 9 | 2 |
| `g3-c12-times-mul` | 113 | times-mul | TimesLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 5 | 2 |
| `g3-c12-times-div` | 115 | times-div | TimesLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 3 | 2 |
| `g3-c12-times-mix` | 116 | times-div | TimesLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 10 | 2 |

### g4（28 个 Lab，10 个组件）

| id | 页 | kind | 组件 | 操作 | 概念追问 | 组件步骤列表 | 步进控件 | 单位 | 尺寸/方格 | 参数 | 断言 | 截图 |
| --- | ---: | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | ---: | ---: | ---: |
| `g4-c1-div-oral` | 2 | div-oral | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 2 | 4 | 2 |
| `g4-c1-div-try` | 5 | div-try | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 2 | 14 | 2 |
| `g4-c1-div-pen` | 9 | div-pen | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 2 | 11 | 2 |
| `g4-c1-div-route` | 11 | div-route | DivLab.vue* | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | 3 | 3 | 2 |
| `g4-c2-peri-rect` | 24 | peri-rect | ShapeLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 13 | 2 |
| `g4-c2-peri-square` | 25 | peri-square | ShapeLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 2 | 2 |
| `g4-c2-area-grid` | 29 | area-grid | ShapeLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 2 | 2 |
| `g4-c2-area-rect` | 31 | area-rect | ShapeLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 7 | 2 |
| `g4-c2-area-square` | 32 | area-square | ShapeLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 2 | 2 |
| `g4-c2-area-unit` | 36 | area-unit | AreaUnitLab.vue | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 3 | 25 | 2 |
| `g4-c3-peri-area-change` | 43 | peri-area-change | PuzzleLab.vue | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 12 | 2 |
| `g4-c4-mul-meaning` | 46 | mul-meaning | QuantityLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 2 | 2 |
| `g4-c4-mul-total` | 49 | mul-total | QuantityLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 7 | 2 |
| `g4-c4-mul-distance` | 51 | mul-distance | QuantityLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 5 | 2 |
| `g4-c4-mul-solve` | 55 | mul-solve | QuantityLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 6 | 2 |
| `g4-c5-mix-three` | 59 | mix-three | MixCalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | 3 | 3 | 2 |
| `g4-c5-mix-bracket` | 61 | mix-bracket | MixCalcLab.vue* | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | 4 | 2 | 2 |
| `g4-c5-mix-segment` | 62 | mix-segment | SegmentLab.vue | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 8 | 2 |
| `g4-c6-travel-plan` | 65 | travel-plan | QuantityLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 5 | 3 | 2 |
| `g4-c7-num-count` | 69 | num-count | NumberLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 18 | 2 |
| `g4-c7-num-place` | 78 | num-place | NumberLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 6 | 2 |
| `g4-c7-num-multidigit` | 75 | num-multidigit | NumberLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 6 | 2 |
| `g4-c7-num-approx` | 81 | num-approx | NumberLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 10 | 2 |
| `g4-c7-num-idcode` | 83 | num-idcode | NumberLab.vue* | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 2 | 2 |
| `g4-c8-measure-story` | 90 | measure-story | MeasureLab.vue | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 3 | 2 |
| `g4-c9-big-mul` | 96 | big-mul | BigNumLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 8 | 2 |
| `g4-c9-big-calc` | 101 | big-calc | BigNumLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 7 | 2 |
| `g4-c9-big-1yi` | 105 | big-1yi | BigNumLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 8 | 2 |

### g5（33 个 Lab，10 个组件）

| id | 页 | kind | 组件 | 操作 | 概念追问 | 组件步骤列表 | 步进控件 | 单位 | 尺寸/方格 | 参数 | 断言 | 截图 |
| --- | ---: | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | ---: | ---: | ---: |
| `g5-c1-translate-boat` | 2 | translate | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 49 | 2 |
| `g5-c1-translate-fish` | 3 | translate | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 10 | 2 |
| `g5-c1-rotate-lever` | 4 | rotate | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 33 | 2 |
| `g5-c1-rotate-triangle` | 6 | rotate | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 12 | 2 |
| `g5-c1-axis-polygon` | 9 | axis | MotionLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 32 | 2 |
| `g5-c2-stats-table` | 18 | stats-table | ChartLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 8 | 42 | 2 |
| `g5-c2-stats-bar` | 25 | stats-chart | ChartLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 10 | 17 | 2 |
| `g5-c3-area-parallelogram` | 31 | area | AreaLab.vue* | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 3 | 41 | 2 |
| `g5-c3-area-triangle` | 34 | area | AreaLab.vue* | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 2 | 37 | 2 |
| `g5-c3-area-trapezoid` | 35 | area | AreaLab.vue* | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 3 | 46 | 2 |
| `g5-c3-area-mcfield` | 36 | area | AreaLab.vue* | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 3 | 22 | 2 |
| `g5-c3-hectare-square` | 40 | hectare | MeasureLab.vue* | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 1 | 28 | 2 |
| `g5-c3-hectare-field` | 42 | composite | MeasureLab.vue* | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 4 | 30 | 2 |
| `g5-c4-dmul-pencil` | 56 | decimal-mul | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 25 | 2 |
| `g5-c4-dmul-ballpen` | 57 | decimal-mul | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 32 | 2 |
| `g5-c4-dmul-paper` | 58 | decimal-point | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 35 | 2 |
| `g5-c4-ddiv-eraser` | 60 | decimal-div | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 51 | 2 |
| `g5-c4-ddiv-sugarcane` | 62 | decimal-point | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 26 | 2 |
| `g5-c5-spinner-rotate` | 72 | spinner | ChanceLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 3 | 23 | 2 |
| `g5-c5-marble-bag` | 66 | marble | ChanceLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 2 | 17 | 2 |
| `g5-c6-factors-12` | 75 | factors | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 13 | 2 |
| `g5-c6-factors-16` | 76 | factors | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 20 | 2 |
| `g5-c6-multiples-3` | 77 | multiples | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 5 | 2 |
| `g5-c6-prime-sieve` | 85 | prime | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 16 | 2 |
| `g5-c6-gcdlcm-8-12` | 88 | gcdlcm | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 21 | 2 |
| `g5-c6-gcdlcm-6-9` | 90 | gcdlcm | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 19 | 2 |
| `g5-c7-frog-song` | 96 | frog | FormulaLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 17 | 2 |
| `g5-c7-square-formula` | 99 | square | FormulaLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 17 | 2 |
| `g5-c7-speed-car` | 100 | speed | FormulaLab.vue* | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 2 | 11 | 2 |
| `g5-c7-speed-train` | 102 | speed | FormulaLab.vue* | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 2 | 11 | 2 |
| `g5-pinboard-area` | 110 | pinboard | PinboardLab.vue | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 1 | 61 | 2 |
| `g5-c8-views3d-blocks` | 113 | views3d | Views3DLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 1 | 36 | 2 |
| `g5-c8-views3d-move` | 115 | views3d | Views3DLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 1 | 9 | 2 |

### g6（47 个 Lab，15 个组件）

| id | 页 | kind | 组件 | 操作 | 概念追问 | 组件步骤列表 | 步进控件 | 单位 | 尺寸/方格 | 参数 | 断言 | 截图 |
| --- | ---: | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | ---: | ---: | ---: |
| `g6-c1-mul-decimal` | 2 | mul-decimal | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 21 | 2 |
| `g6-c1-mul-compare` | 6 | mul-compare | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 12 | 2 |
| `g6-c1-mul-approx` | 4 | mul-approx | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 37 | 2 |
| `g6-c1-div-decimal` | 7 | div-decimal | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 38 | 2 |
| `g6-c1-div-approx` | 9 | div-approx | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 39 | 2 |
| `g6-c1-round-life` | 10 | round-life | DecimalLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 26 | 2 |
| `g6-c1-ex-div11-cycle` | 13 | ex-c1-div11-cycle | ExerciseC1Lab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 31 | 2 |
| `g6-c1-ex-pgram-area` | 5 | ex-c1-pgram-area | ExerciseC1Lab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 30 | 2 |
| `g6-c2-frac-mix` | 15 | frac-mix | MixCalcLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 3 | 14 | 2 |
| `g6-c2-estimate-shop` | 16 | estimate-shop | MixCalcLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 1 | 22 | 2 |
| `g6-c2-segment` | 19 | segment | SegmentLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 53 | 2 |
| `g6-c2-segment-more` | 20 | segment-more | SegmentLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 4 | 35 | 2 |
| `g6-c2-work-together` | 23 | work-together | SegmentLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 24 | 2 |
| `g6-c2-piecewise` | 26 | piecewise | MixCalcLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 1 | 25 | 2 |
| `g6-c2-ex-overlap-club` | 22 | ex-c2-overlap-club | ExerciseC2Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 47 | 2 |
| `g6-c2-ex-egg-crate` | 18 | ex-c2-egg-crate | ExerciseC2Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 64 | 2 |
| `g6-c3-place-value` | 31 | place-value | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 1 | 17 | 2 |
| `g6-c3-compare-unit` | 32 | compare-unit | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 1 | 14 | 2 |
| `g6-c3-op-consistency` | 38 | op-consistency | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 1 | 20 | 2 |
| `g6-c3-binary` | 42 | binary | NumberLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 1 | 18 | 2 |
| `g6-c3-ex-div-to-mul` | 41 | ex-c3-div-to-mul | ExerciseC3Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 52 | 2 |
| `g6-c3-ex-frac-split` | 40 | ex-c3-frac-split | ExerciseC3Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 35 | 2 |
| `g6-c4-ratio-intro` | 45 | ratio-intro | RatioLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 47 | 2 |
| `g6-c4-ratio-value` | 47 | ratio-value | RatioLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 55 | 2 |
| `g6-c4-ratio-simplify` | 53 | ratio-simplify | RatioLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 1 | 67 | 2 |
| `g6-c4-ratio-distribute` | 54 | ratio-distribute | RatioLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 43 | 2 |
| `g6-c4-proportion-basic` | 59 | proportion-basic | RatioLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 28 | 2 |
| `g6-c4-solve-proportion` | 60 | solve-proportion | RatioLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 27 | 2 |
| `g6-c4-golden-ratio` | 64 | golden-ratio | RatioLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 10 | 2 |
| `g6-c4-ex-cube-ratio` | 55 | ex-c4-cube-ratio | ExerciseC4Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 66 | 2 |
| `g6-c4-ex-football-ratio` | 54 | ex-c4-football-ratio | ExerciseC4Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 52 | 2 |
| `g6-c5-circle-feature` | 70 | circle-feature | CircleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 38 | 2 |
| `g6-c5-sector` | 72 | sector | CircleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 78 | 2 |
| `g6-c5-circumference` | 77 | circumference | CircleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 47 | 2 |
| `g6-c5-circle-area` | 80 | circle-area | CircleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 51 | 2 |
| `g6-c5-annulus` | 81 | annulus | CircleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 2 | 74 | 2 |
| `g6-c5-circle-composite` | 81 | circle-composite | CircleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 1 | 63 | 2 |
| `g6-c5-ex-wheel-roll` | 85 | ex-c5-wheel-roll | ExerciseC5Lab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 45 | 2 |
| `g6-c5-ex-circle-packing` | 86 | ex-c5-circle-packing | ExerciseC5Lab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 49 | 2 |
| `g6-c6-scale-shape` | 93 | scale-shape | ScaleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 3 | 60 | 2 |
| `g6-c6-map-scale` | 98 | map-scale | ScaleLab.vue* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 4 | 16 | 2 |
| `g6-c6-ex-scale-area` | 97 | ex-c6-scale-area | ExerciseC6Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 55 | 2 |
| `g6-c6-ex-two-maps` | 102 | ex-c6-two-maps | ExerciseC6Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 59 | 2 |
| `g6-c7-coordinate` | 104 | coordinate | PositionLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 2 | 48 | 2 |
| `g6-c7-direction` | 106 | direction | PositionLab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 22 | 2 |
| `g6-c7-ex-route-path` | 109 | ex-c7-route-path | ExerciseC7Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 61 | 2 |
| `g6-c7-ex-observer-point` | 111 | ex-c7-observer-point | ExerciseC7Lab.vue* | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | 3 | 87 | 2 |

## 3. 方法（可复现）

- **hasAction**：组件 <button>/<UButton> 文本命中操作类词表，且 @click 的处理函数体内写入 .value（状态真的变）
- **hasConceptPrompt**：Lab 页渲染 ConceptTip 且数据层 tip 非空（默认收起、点击展开），或组件内有可展开提示块
- **hasSteps**：hasSteps = 有步骤列表（页面渲染 compute 的 steps，或组件 v-for 渲染步骤）或 有步进控件（step-bar/step-chip 类 + 索引 ref）
- **hasStepControl**：「可步进」单列：组件里有 step/stage/round 索引 + 点击切换的步进按钮（L3 过程可分步的强指标）
- **hasUnits**：数据层 LabDef.units 非空（g1 用 GameQuestion.config.visual.unitLabel）
- **hasDims**：组件 SVG 出现 stroke-dasharray / <line> / <pattern> / grid|tick 类名
- **testsCount**：test/** 中 it()/test() 块内提到该 id 的 expect() 个数；只按 kind 命中的块按「同 kind 的 Lab 数」摊分（testsScope 标出归属方式）
- **shotCount**：docs/visual-review-screenshots/<grade>/<id>*.png 文件数
- **sharedComponentsNote**：同一组件服务多个 Lab 时，hasAction/hasSteps/hasDims 是组件级结论，会在这些 Lab 上同时为真；metrics.json 的 componentScope 标出共享情况。

复现：`node scripts/visual-metrics.mjs`（只读；全六册约 3 秒）。

