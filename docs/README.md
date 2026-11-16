# 文档中心 · Documentation

本目录汇集本项目的开发、部署、教材核对与可视化评审文档。新加入的开发者建议按下面顺序阅读：

1. [项目 README](../README.md) —— 项目是什么、怎么跑起来
2. [开发文档 DEVELOPMENT.md](DEVELOPMENT.md) —— 架构与新增内容的标准流程
3. [部署文档 DEPLOYMENT.md](DEPLOYMENT.md) —— 上线到 Cloudflare Pages

## 核心文档

| 文档 | 说明 |
| --- | --- |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 架构、各年级工程结构、数据格式、新增例题 / Lab / 游戏 / 年级的流程、OCR 管线、测试、命令与排错速查 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 单 Cloudflare Pages 部署详解：参数全景表、面板操作、构建/预览、部署后核对清单 |

## 教材核对与质量

| 文档 | 说明 |
| --- | --- |
| [example-audit.md](example-audit.md) | 一年级例题 ↔ Vision OCR 逐条核对（STRONG / MEDIUM / FIG 三级证据） |
| [example-audit-glm.md](example-audit-glm.md) | 六册 235 条例题 ↔ GLM-OCR 全量核对报告与数据修正记录 |
| [audit/g6-circle-ratio-audit.md](audit/g6-circle-ratio-audit.md) | 六年级「圆与比」逐 Lab 数学审查（含坐标复算与行号证据） |
| [audit/g6-scale-position-number-audit.md](audit/g6-scale-position-number-audit.md) | 六年级「比例尺 / 确定位置 / 数」逐 Lab 审查 |
| [audit/round4/](audit/round4/) | 第 4 轮全量审计的机器可读结果（各年级 JSON + metrics.json） |

## 可视化评审（逐题）

| 文档 | 说明 |
| --- | --- |
| [example-visual-review.md](example-visual-review.md) | 六册逐题可视化 review 总表：截图、题源证据、问题、改进方案与优先级 |
| [example-visual-improvements.md](example-visual-improvements.md) | 五、六年级逐题改进记录（改了什么、数学错在哪、怎么验证） |
| [example-visual-upgrade-spec.md](example-visual-upgrade-spec.md) | 组件级实施规格（按组件族套用，而非逐题临场设计） |
| [example-visual-rubric-v4.md](example-visual-rubric-v4.md) | 第 4 轮统一验收口径（L0–L5 分级 + P0–P3 优先级 + 证据强制项） |
| [example-visual-handoff.md](example-visual-handoff.md) | 可视化改进的交接说明（如何按矩阵认领与验收） |
| [visual-review-screenshots/](visual-review-screenshots/) | 六册例题的可视化回归截图（`<id>.png` 初始态、`<id>-act.png` 过程态） |

## 阶段报告

| 文档 | 说明 |
| --- | --- |
| [reports/round4/round4-summary.md](reports/round4/round4-summary.md) | 第 4 轮总报告（口径、结论、遗留项） |
| [reports/round4/round4-g1g2.md](reports/round4/round4-g1g2.md) | 一、二年级分册报告 |
| [reports/round4/round4-g3g4.md](reports/round4/round4-g3g4.md) | 三、四年级分册报告 |
| [reports/round4/round4-g5g6.md](reports/round4/round4-g5g6.md) | 五、六年级分册报告 |
| [reports/round4/round4-metrics.md](reports/round4/round4-metrics.md) | 第 4 轮量化指标汇总 |

## 调研

| 文档 | 说明 |
| --- | --- |
| [research/数学可视化调研-国内实践.md](research/数学可视化调研-国内实践.md) | 国内数学可视化教学实践调研 |
| [research/数学可视化调研-国际平台与前端实现.md](research/数学可视化调研-国际平台与前端实现.md) | 国际平台与前端实现调研 |
| [research/五六年级例题重点概念清单.md](research/五六年级例题重点概念清单.md) | 五、六年级逐题「这道例题要建立什么概念」清单 |
| [research/小组对抗计算类小游戏调研.md](research/小组对抗计算类小游戏调研.md) | 小组对抗计算类小游戏调研 |
| [游戏形式调研.md](游戏形式调研.md) | 20 个小游戏的课本出处 / 玩法设计调研 |

## 资源

| 目录 | 说明 |
| --- | --- |
| [assets/](assets/) | README 横幅（`banner.svg`）与精选界面截图 |

> 说明：`docs/visual-review-screenshots/` 体量较大（数十 MB），仅用于评审留痕；日常开发无需下载全部图片。
