# 门户页（portal/）

小学数学互动学习平台的**总入口**，纯静态（无框架），部署在 Cloudflare Pages 根路径 `/`，
通过相对链接进入两个年级：

- `./g1/` → 一年级（人教版上册，`game/` 应用）
- `./g5/` → 五年级（苏教版上册，`g5/game/` 应用）

## 本地预览聚合产物

```bash
# 1) 聚合构建（跳过子应用依赖安装，本地已装）
npm run build:site:local

# 2) 静态预览 deploy/
npx serve deploy
# 或：cd deploy && python3 -m http.server 4100
```

打开 http://localhost:3000 或 4100 查看门户 → 两个年级。

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | 门户页面（两张年级卡片） |
| `style.css` | 样式（深色渐变 + 玻璃拟态卡片） |

新增年级（如三年级）时：复制一张卡片、改链接为 `./g3/`，并在
`scripts/site-build.mjs` 的 `APPS` 数组里加一项。
