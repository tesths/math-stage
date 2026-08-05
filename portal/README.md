# 门户页（portal/）

小学数学互动学习平台的**总入口**，**Nuxt 4 + Nuxt UI** 应用（与各年级技术栈、视觉风格一致），
部署在 Cloudflare Pages 根路径 `/`，通过卡片链接进入四个年级：

- `/g1/` → 一年级（人教版上册，`game/` 应用）
- `/g2/` → 二年级（苏教版上册，`g2/game/` 应用）
- `/g5/` → 五年级（苏教版上册，`g5/game/` 应用）
- `/g6/` → 六年级（苏教版上册，`g6/game/` 应用）

## 结构与开发

| 文件 | 说明 |
| --- | --- |
| `pages/index.vue` | 门户首页（年级卡片由 `shared/grades` 注册表生成，原生 `<a href>` 跨应用跳转） |
| `nuxt.config.ts` | 共享 emerald 主题；`baseURL` 支持 `BASE_URL`；`prerender` 显式预渲染 `/`（**不要开 crawlLinks**，会爬 `/g1/` `/g2/` `/g5/` `/g6/` 链接导致 404 构建失败） |
| `app.vue` / `assets/css/main.css` | Nuxt UI 骨架 |

```bash
npm run dev            # 本地开发（PORT 3000）
npm run generate:site  # 静态导出（配合 BASE_URL=/ 输出到 .output/public）
```

## 新增年级（三年级等）

1. 新建独立 Nuxt 工程 `g3/`；
2. `shared/grades/index.ts` 加一条 `GradeInfo`；
3. `scripts/site-build.mjs` 的 `APPS` 加 `{ dir: 'g3', base: '/g3/', dist: '.output/public' }`；
4. 聚合脚本会自动构建门户 + 各年级，Cloudflare 面板无需改动。
