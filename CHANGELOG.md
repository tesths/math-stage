# 变更记录 · Changelog

本项目的所有重要变更都记录在此文件。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划中
- 下册内容（各年级 `data/lower/`、`ocr/lower/` 占位已预留）
- 更多练习题可视化与训练小游戏
- 文档英文化持续推进

## [0.1.0] - 2026-11-16

首个开源版本。

### Added
- 一至六年级 + 门户共 7 个 Nuxt 4 应用，共享 `shared/` 设计系统（emerald 主题）
- 二至六年级 171 个可调参数可视化 Lab；一年级 78 道例题答题游戏
- 80 个训练小游戏
- 课本 OCR 管线（macOS Vision + GLM-OCR）与六册合订正文
- 单 Cloudflare Pages 聚合部署（`scripts/site-build.mjs`）与链接 / 点击验收脚本
- 开源配套：MIT `LICENSE`、教材版权 `NOTICE`、中英文 README、贡献指南、行为准则、安全策略、Issue / PR 模板
- `docs/` 文档中心与索引
