# 部署方案详解（单 Cloudflare Pages · 门户 + 一/二/三/四/五/六年级）

> 本文是 `docs/DEVELOPMENT.md` §10 的**展开版**，逐参数说明如何修改。
> 目标：**一个 GitHub 仓库（tesths/math-stage）→ 一个 Cloudflare Pages 项目**，
> 线上结构 `/` 门户、`/g1/*` 一年级、`/g2/*` 二年级、`/g3/*` 三年级、`/g4/*` 四年级、`/g5/*` 五年级、`/g6/*` 六年级。

---

## 1. 部署架构与数据流

```
GitHub 仓库 main 分支
   │  推送触发
   ▼
Cloudflare Pages 构建机
   │  ① npm run build:site（面板配置的构建命令）
   │      └─ node scripts/site-build.mjs
   │           ├─ 根 workspace: npm ci（单 lockfile）
   │           ├─ g1/game/: BASE_URL=/g1/ nuxi generate → g1/game/.output/public（111 页）
   │           ├─ g2/game/: BASE_URL=/g2/ nuxi generate → g2/game/.output/public（48 页）
   │           ├─ g3/game/: BASE_URL=/g3/ nuxi generate → g3/game/.output/public（73 页）
   │           ├─ g4/game/: BASE_URL=/g4/ nuxi generate → g4/game/.output/public（51 页）
   │           ├─ g5/game/: BASE_URL=/g5/ nuxi generate → g5/game/.output/public（55 页）
   │           ├─ g6/game/: BASE_URL=/g6/ nuxi generate → g6/game/.output/public（56 页）
   │           ├─ portal/ : BASE_URL=/ nuxi generate → portal/.output/public（门户 Nuxt 应用）
   │           └─ 写出 _redirects / _headers
   ▼
deploy/（聚合产物 = 面板配置的"构建输出目录"）
   ├── index.html + _nuxt/  门户（Nuxt 静态站）
   ├── g1/…                 一年级静态站（111 页全量预渲染）
   ├── g2/…                 二年级静态站（48 页全量预渲染）
   ├── g3/…                 三年级静态站（73 页全量预渲染）
   ├── g4/…                 四年级静态站（51 页全量预渲染）
   ├── g5/…                 五年级静态站（55 页全量预渲染）
   ├── g6/…                 六年级静态站（56 页全量预渲染）
   ├── _redirects           仅注释（不要加 SPA 200 重写，会 308 循环）
   └── _headers             安全响应头
   ▼
Cloudflare 边缘网络 → 用户浏览器
   /       门户
   /g1/*   一年级
   /g2/*   二年级
   /g3/*   三年级
   /g4/*   四年级
   /g5/*   五年级
   /g6/*   六年级
```

---

## 2. 参数全景表（先看这张表，再往下看细节）

| # | 参数 | 所在位置 | 当前值 | 作用 | 修改入口 |
| --- | --- | --- | --- | --- | --- |
| 1 | 构建命令 | Cloudflare 面板 | `npm run build:site` | 触发聚合构建 | 面板 Settings → Builds & deployments |
| 2 | 构建输出目录 | Cloudflare 面板 | `deploy` | 告诉 Cloudflare 产物在哪 | 同上 |
| 3 | 框架预设 | Cloudflare 面板 | `None` | 不要选 Nuxt，避免自动构建冲突 | 同上 |
| 4 | 生产分支 | Cloudflare 面板 | `main` | 推 main 自动部署 | 同上 |
| 5 | 构建根目录 | Cloudflare 面板 | `/`（留空） | 在仓库子目录构建时才需要改 | 同上 |
| 6 | 年级应用注册表 | `scripts/app-registry.mjs` | 见 §4.1 | 注册每个年级应用（workspace/目录/子路径） | 改注册表 |
| 7 | `OUT` | 同上 | `deploy` | 聚合输出目录（**必须与面板 #2 一致**） | 改脚本 |
| 8 | `SKIP_INSTALL` | 同上（`--skip-install` 或 `SKIP_INSTALL=1`） | 本地用 | 跳过根 workspace `npm ci`（本地加速） | 命令行 |
| 9 | 子路径前缀 | `nuxt.config.ts` 的 `app.baseURL` | `process.env.BASE_URL ?? '/'` | 资源/路由前缀（/g1/、/g2/、/g3/、/g4/、/g5/、/g6/） | 改注册表 base 或配置文件 |
| 10 | 静态导出爬取 | `nitro.prerender.crawlLinks` | `true` | 决定是否预渲染全部路由 | 改 nuxt.config |
| 11 | 静态导出预设 | `scripts/site-build.mjs` 传入的 `NITRO_PRESET` | `static` | 固定 `.output/public` 产物形态，避免 Cloudflare 环境自动切换输出目录 | 一般不改 |
| 12 | `deploy/_redirects` | 脚本生成的 | 仅注释 | 全部页面已预渲染，无需重写；**禁止**加 200 SPA 重写（308 循环） | 改脚本 §4.4 |
| 13 | 门户年级链接 | `shared/grades/index.ts` | `base: "/g1/"` ... `base: "/g6/"` | 门户卡片与顶栏切换跳转 | 改年级注册表 |
| 14 | 门户样式 | `shared/theme/nuxt-config.ts` + `pages/index.vue` | primary: emerald | 与年级一致的 Nuxt UI 风格 | 改共享主题/注册表 |
| 15 | 依赖安装方式 | 根 workspace | `npm ci` | 用根 `package-lock.json` 一次性安装所有 workspace 依赖 | 改根 package/lock；不再维护各应用 lockfile |
| 16 | 产物忽略 | 根 `.gitignore` | `deploy/`、`dist/`、`node_modules/` 等 | 构建产物不提交 | 一般不改 |
| 17 | Node/npm 版本 | 根 package.json `engines` | node `>=24 <25`、npm `>=11` | CF 自带 node24.13.1+npm11.8.0，`engine-strict` 强制校验；**禁写 `packageManager` 字段**（npm11 会切到 npm12 → EBADENGINE） | 见 §4.2 版本约束 |

---

## 3. Cloudflare Pages 面板操作（从零开始，一步步）

### 3.1 新建项目

1. 登录 Cloudflare → 左侧 **Workers & Pages** → **Create** → **Pages** 选项卡。
2. 选 **Connect to Git** → 授权 GitHub → 选择仓库 `tesths/math-stage` → **Begin setup**。
3. 在 **Set up builds and deployments** 页面填三个值：

| 字段 | 填什么 | 为什么 |
| --- | --- | --- |
| Framework preset | **None**（不要选 Nuxt/Vue） | 我们有自定义聚合脚本，选框架会让 Cloudflare 用错命令 |
| Build command | **`npm run build:site`** | 仓库根 package.json 里的脚本（见 §4.2） |
| Build output directory | **`deploy`** | 聚合脚本把产物写到这里（见 §4.1 的 OUT） |

4. （可选）**Root directory** 保持空/`/` —— 只有把仓库里某个子目录当项目根时才改。
5. 点 **Save and Deploy**。

### 3.2 部署完成后的验证

- 打开构建日志，最后应有聚合脚本的汇总：
  `deploy/ 共 397 个 HTML 页面 / 门户 / 一年级 111 页 / 二年级 48 页 / 三年级 73 页 / 四年级 51 页 / 五年级 55 页 / 六年级 56 页`。
- 访问 `https://<项目名>.pages.dev/` → 应看到门户六张卡片。
- 点"进入一年级"→ URL 变 `/g1/`；二至六年级入口分别进入 `/g2/`、`/g3/`、`/g4/`、`/g5/`、`/g6/`。
- **全量断链审计（推荐，覆盖本地与线上）**：
  ```bash
  node scripts/link-audit.mjs        # 本地 deploy/ 全量 href 审计（11867+ 条链接，0 断链）
  node scripts/link-audit.mjs --live # 浏览器级爬取线上全站逐页核对（约 3 分钟，防限流间隔 200ms）
  ```
  应输出 `✅ 无断链`；出现 `❌ 本地断链` / `❌ 线上校验失败` 时按路径定位。
- 抽查深层页面（均应为 200）：
  `/g1/play/c1-count-01/`、`/g2/labs/g2-c6-abacus/`、`/g3/labs/g3-c3-mul-pen/`、
  `/g4/labs/g4-c1-div-pen/`、`/g5/labs/g5-c3-area-parallelogram/`、`/g6/labs/g6-c1-mul-decimal/`。
  注意：预渲染链接**统一带尾斜杠**（`shared/theme/nuxt-config.ts` 的 `experimental.defaults.nuxtLink.trailingSlash: 'append'`），
  浏览器与审计均按带尾斜杠形态校验；无尾斜杠深链由 Cloudflare 自动 308 到规范形态。

### 3.3 已有旧项目（之前部署的是 game 目录）怎么改

如果这个仓库之前已经连过 Cloudflare Pages（部署目录是 `game`）：

1. 项目 → **Settings → Builds & deployments**。
2. 把 **Build command** 改为 `npm run build:site`。
3. 把 **Build output directory** 改为 `deploy`。
4. 点 **Save**，然后 **Deployments → 手动触发一次部署**（或推送一次）。
5. 旧产物会被覆盖，线上立刻变成门户 + 六个年级。

> 如果旧项目名/URL 想保留，直接改配置即可；想换名，删掉重建成 3.1 的流程。

### 3.4 其他面板参数（可选修改）

| 面板参数 | 说明 |
| --- | --- |
| Production branch | 默认 `main`；推 main 自动部署。改其他分支则只有该分支触发 |
| Deployments → Preview | 每次 PR 会生成预览 URL（默认开启），用于测试再上生产 |
| Custom domains | 绑定自定义域名（如 `math.example.com`），自动配 HTTPS |
| Environment variables | **本项目不需要**：BASE_URL 由聚合脚本内部传入，勿在面板设置 |
| Build cache | 开启后可加速根 workspace `npm ci`（构建超时时用，见 §5.4） |
| Always use HTTPS | 建议开启 |
| Redirects (自定义) | 无需配置，`deploy/_redirects` 仅保留说明注释；真实页面全部预渲染 |

---

## 4. 仓库侧参数详解（改代码改什么）

### 4.1 `scripts/site-build.mjs` —— 聚合脚本（核心）

```js
// scripts/app-registry.mjs
export const gradeApps = [
  { id: 'g1', workspace: 'math-game', dir: 'g1/game', base: '/g1/', dist: '.output/public' },
  { id: 'g2', workspace: 'math-game-g2', dir: 'g2/game', base: '/g2/', dist: '.output/public' },
  { id: 'g3', workspace: 'math-game-g3', dir: 'g3/game', base: '/g3/', dist: '.output/public' },
  { id: 'g4', workspace: 'math-game-g4', dir: 'g4/game', base: '/g4/', dist: '.output/public' },
  { id: 'g5', workspace: 'math-game-g5', dir: 'g5/game', base: '/g5/', dist: '.output/public' },
  { id: 'g6', workspace: 'math-game-g6', dir: 'g6/game', base: '/g6/', dist: '.output/public' },
]
```

| 字段 | 含义 | 修改示例 |
| --- | --- | --- |
| `workspace` | 根 `package.json` workspaces 中的包名 | 新增七年级 → `math-game-g7` |
| `dir` | 年级应用相对仓库根的路径 | 新增七年级 → `{ dir: 'g7/game', ... }` |
| `base` | 线上子路径前缀（**决定 /g1/ 还是 /grade1/**） | 想改 `/grade1/` → `base: '/grade1/'`，同时同步 `shared/grades` 的 `base` |
| `dist` | 年级应用 `nuxi generate` 的产物相对路径。当前 Nuxt4 输出为 `.output/public`，聚合脚本再复制到 `deploy/<base>` | 一般不改；新增同类 Nuxt 应用沿用 `.output/public` |
| `OUT` | 聚合输出目录，**必须与 Cloudflare 面板的 Build output directory 完全一致** | 改成 `dist-site` 时，面板也要填 `dist-site` |

> ⚠️ **改 `base` 的两个联动**：① `scripts/app-registry.mjs` 的 `base`；② `shared/grades/index.ts` 的 `base`。
> `_redirects` 不加 SPA 200 重写，门户卡片由注册表自动生成。

### 4.2 根 `package.json` —— 脚本入口

```json
"scripts": {
  "build:site": "node scripts/site-build.mjs",          // Cloudflare 用（含 npm ci）
  "build:site:local": "node scripts/site-build.mjs --skip-install", // 本地用（跳过安装）
  "preview": "npx serve deploy"
}
```

- 面板构建命令填 `npm run build:site`。
- 本地预览：`npm run build:site:local && npm run preview`。
- 想调整构建行为（如 CI 上强制重装）就改这里的参数，不要改面板。

**⚠️ Node/npm 版本约束（2026-08 线上事故教训，改 package.json 前必读）**

- Cloudflare Pages 的 Node 由 `.node-version`/`.nvmrc` 决定，但实际装的是**自身快照的最新 24.x**
  （实测为 `v24.13.1`），且**自带 npm 11.8.0**，与本地 npm 12 不同。
- 根 `.npmrc` 设了 `engine-strict=true`，因此 `engines` 校验会拦截版本不兼容：
  - `engines.node`：`>=24 <25`（CF 的 24.13.1 满足）。
  - `engines.npm`：**必须 `>=11`**（CF 自带 npm 11.8.0；不要写 `>=12`，否则 CF 构建第一步就 EBADENGINE）。
- **禁止在根 `package.json` 写 `packageManager` 字段**：npm ≥11 会读取该字段自动切换执行指定版本，
  npm@12.0.1 要求 node `^22.22.2 || ^24.15.0 || >=26.0.0`，而 CF 的 node 24.13.1 不满足 → 构建报
  `EBADENGINE Unsupported engine ... npm@12.0.1 ... Not compatible`。
- 本地/CI 用 npm 12 没问题（不依赖 `packageManager` 字段），CF 用自带 npm 11 也没问题；
  发布上线前先在本地过 `npm run typecheck` + `npm run build:site:local`，再用 §3.2 的 `link-audit --live` 复测。

### 4.3 各年级应用 `nuxt.config.ts` —— 子路径与预渲染

```ts
...sharedNuxtConfig({
  nitro: {
    prerender: {
      ignore: gradePrerenderIgnore('g1'), // 当前年级构建时忽略其他年级子路径
    },
  },
  app: {
    baseURL: process.env.BASE_URL ?? '/', // 子路径前缀；聚合脚本以 BASE_URL=/g1/ 调用
    ...
  },
})
```

| 参数 | 作用 | 注意事项 |
| --- | --- | --- |
| `app.baseURL` | 让资源路径变成 `/g1/_nuxt/…`、路由变成 `/g1/play/…` | 默认 `/`，本地 dev 不受影响；**不要硬编码 `/g1/`**，必须用 `process.env.BASE_URL`，否则本地开发也被迫加前缀 |
| `nitro.prerender.crawlLinks` | `true` 才全量预渲染路由（一年级 111 页/二年级 48 页/三年级 73 页/四年级 51 页/五年级 55 页/六年级 56 页） | 由 `sharedNuxtConfig` 统一开启；跨年级链接由 `gradePrerenderIgnore()` 忽略 |
| `NITRO_PRESET` | 聚合脚本传 `static`，保证当前 `nuxi generate` 输出到 `.output/public` | 与 E2E 的 `NITRO_PRESET=node-server` 无关（e2e 单独覆盖） |

### 4.4 `_redirects`（脚本自动生成，一般不用手改）

当前内容仅为注释，**没有任何重写规则**。

⚠️ **线上事故教训（2026-08）**：不要加 `/g1/* → /g1/200.html 200` 这类 SPA 兜底。
Cloudflare 的 200 重写会抢在静态文件之前命中 `/g1/` 目录请求，
且 clean URL 机制把目标 `/g1/200.html` 再解析成 `/g1/200`，形成 **308 重定向循环**，
导致年级目录入口全部打不开。

正确做法：所有真实页面全量预渲染（crawlLinks）直接命中；
不存在的路径由各年级应用自带的 `404.html` 兜底。

### 4.5 `portal/pages/index.vue` —— 门户卡片

```vue
<a href="/g1/" rel="external">
  <UCard>
    <UBadge :color="g.accent">{{ g.standard }}</UBadge>
    …
    <UButton :color="g.accent" trailing icon="i-heroicons-arrow-right-circle">{{ g.cta }}</UButton>
  </UCard>
</a>
```

- 门户是 **Nuxt 4 + Nuxt UI 应用**（风格与各年级一致），跨应用链接必须用原生 `<a href>`。
- 新增年级：在 `shared/grades/index.ts` 加一条 `GradeInfo`，门户卡片自动生成。
- 门户 `nuxt.config.ts` 的 `prerender` 必须是 `crawlLinks: false + routes: ['/']`：
  开 crawlLinks 会爬 `/g1/`、`/g2/`、`/g3/`、`/g4/`、`/g5/`、`/g6/` 链接，在门户应用里 404 → 构建失败（已踩坑）。

### 4.6 `.gitignore`（防误提交）

```
node_modules/  .nuxt/  .output/  dist/  test-results/  coverage/  deploy/  *.pdf  .DS_Store
```

- `deploy/`、`dist/` 是构建产物，**必须忽略**，否则每次构建后 git 状态脏。
- 历史上根部 `game/dist` 曾是提交的符号链接，现已移除跟踪（`git rm --cached`），勿加回。

---

## 5. 常见修改场景（参数怎么改）

### 5.1 新增下一个年级

1. 新建独立年级目录与 Nuxt 工程（例如 `g7/game/`），保留年级目录独立维护；同一年级上下册数据放在 `g7/data/upper/`、`g7/data/lower/`。
2. 根 `package.json` 的 `workspaces` 加入新应用，并在该应用 `package.json` 设置唯一包名（例如 `math-game-g7`）。
3. `scripts/app-registry.mjs` 的 `gradeApps` 加一条 `{ id, workspace, dir, base, dist }`。
4. `shared/grades/index.ts` 加一条 `GradeInfo`（`id/base/label/title/accent/features` 等）。
5. Cloudflare 面板**无需改动**（构建命令/输出目录不变），推送即部署。

### 5.2 改子路径（如 /g1/ → /grade1/）

1. `scripts/app-registry.mjs`：`base: '/grade1/'`，`dist: '.output/public'`。
2. `scripts/site-build.mjs` 生成的 `_redirects` 无需加规则（页面全量预渲染直接命中）；如需要旧路径迁移可加 `301` 规则。
3. `portal/pages/index.vue`：卡片 `<a href="/grade1/">`。
4. 推送重新构建。**旧链接 /g1/* 会失效**，介意的话在 `_redirects` 加一条
   `/g1/*  /grade1/:splat  301`。

### 5.3 构建超时（免费额度 20 分钟）

- 首选：Cloudflare 面板开启 **Build cache**。当前脚本已经只在根 workspace 执行一次 `npm ci`，不再为每个应用重复安装。
- 或：临时降低并发，设置环境变量 `SITE_BUILD_CONCURRENCY=1`，牺牲速度换更低内存峰值。
- 不建议恢复各应用独立 `package-lock.json`；依赖版本应由根 `package-lock.json` 统一锁定。
- 或：把各年级应用拆到多个 Pages 项目（放弃单项目，需同时改部署方案）。

### 5.4 自定义域名

1. Cloudflare 项目 → **Custom domains → Add**，输入域名（如 `math.example.com`）。
2. DNS 记录自动创建（CNAME 到 pages.dev）。
3. 无需改任何代码：门户在根域，`/g1/`、`/g2/`、`/g3/`、`/g4/`、`/g5/`、`/g6/` 自动可用（卡片用原生 `<a href>` 绝对路径）。

### 5.5 只想本地生成一个年级

- 使用根脚本，例如 `npm run generate:g4`；脚本会按注册表传入对应 workspace、子路径和本地 Nuxt 环境。
- 线上部署仍建议保持完整聚合，不要临时删注册表；注册表是构建、门户和真实点击验收共用的源头。

---

## 6. 本地完整演练（改参数后先本地验证）

```bash
# 1) 聚合构建（跳过根 workspace 依赖安装；Cloudflare 上会自动 npm ci）
npm run build:site:local

# 2) 本地静态预览
cd deploy && python3 -m http.server 4100
# 或 npx serve deploy（端口 3000）

# 3) 验证
#    http://localhost:4100/          门户
#    http://localhost:4100/g1/       一年级
#    http://localhost:4100/g2/       二年级
#    http://localhost:4100/g3/       三年级
#    http://localhost:4100/g4/       四年级
#    http://localhost:4100/g5/       五年级
#    http://localhost:4100/g6/       六年级
#    http://localhost:4100/g5/labs/g5-c3-area-parallelogram/   深层页
#    http://localhost:4100/g1/play/c1-count-01/                深层页
#    http://localhost:4100/g6/labs/g6-c1-mul-decimal/          深层页
#    http://localhost:4100/g2/labs/g2-c6-abacus/               深层页
#    http://localhost:4100/g3/labs/g3-c3-mul-pen/              深层页
#    http://localhost:4100/g4/labs/g4-c1-div-pen/              深层页
```

> 注意：`python3 -m http.server` 对无尾斜杠路径会 301 到带斜杠目录；
> Cloudflare Pages 原生支持 clean URL（无斜杠也能命中 `index.html`），这是本地工具的差异，不是问题。

---

## 7. 部署后核对清单（每次部署都查一遍）

| 检查项 | 期望 | 命令/路径 |
| --- | --- | --- |
| 构建日志汇总 | `共 397 个 HTML` | 面板 Deployments → 最新一次 → 日志尾部 |
| 门户 | 六张年级卡片 | `GET /` |
| 一年级首页 | 标题"一年级数学例题游戏" | `GET /g1/` |
| 二年级首页 | 标题"二年级数学例题可视化" | `GET /g2/` |
| 三年级首页 | 标题"三年级数学例题可视化" | `GET /g3/` |
| 四年级首页 | 标题"四年级数学例题可视化" | `GET /g4/` |
| 五年级首页 | 标题"五年级数学例题可视化" | `GET /g5/` |
| 六年级首页 | 标题"六年级数学例题可视化" | `GET /g6/` |
| 一年级深层页 | 200 + 内容 | `GET /g1/play/c1-count-01/` |
| 二年级深层页 | 200 + 内容 | `GET /g2/labs/g2-c6-abacus/` |
| 三年级深层页 | 200 + 内容 | `GET /g3/labs/g3-c3-mul-pen/` |
| 四年级深层页 | 200 + 内容 | `GET /g4/labs/g4-c1-div-pen/` |
| 五年级深层页 | 200 + 内容 | `GET /g5/labs/g5-c3-area-parallelogram/` |
| 六年级深层页 | 200 + 内容 | `GET /g6/labs/g6-c1-mul-decimal/` |
| 静态资源 | 200 | `GET /g1/_nuxt/…`、`GET /g2/_nuxt/…`、`GET /g3/_nuxt/…`、`GET /g4/_nuxt/…`、`GET /g5/_nuxt/…`、`GET /g6/_nuxt/…` |
| 客户端渲染 | 无 JS 错误 | 浏览器 DevTools Console / 或 playwright 冒烟 |
| 目录入口 | /g1/ /g2/ /g3/ /g4/ /g5/ /g6/ 不 308 循环 | `GET /g1/` 应 200 且返回一年级首页 |

---

## 8. 排错对照

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 部署后只有门户，/g1/ /g2/ /g3/ /g4/ /g5/ /g6/ 404 | 构建输出目录没指对，或聚合失败 | 检查面板输出目录=`deploy`；看构建日志是否有"聚合完成" |
| /g1/ 资源 404（_nuxt 打不开） | baseURL 没生效 | 确认 nuxt.config 是 `process.env.BASE_URL ?? '/'`，且脚本传了 `BASE_URL=/g1/` |
| 只有 2 个 HTML | crawlLinks 没开 | `nitro.prerender.crawlLinks: true` |
| 改 base 后跳转/资源全坏 | `scripts/app-registry.mjs` 与 `shared/grades` 的 base 没同步 | 见 §5.2（构建注册表 base + 年级注册表 base） |
| 构建超时 | npm ci 冷缓存慢，或并发构建内存峰值过高 | 见 §5.3（开 Build cache / 降低 `SITE_BUILD_CONCURRENCY`） |
| 本地 e2e 连错站点 | 3000/3100 端口被旧服务占用 | `lsof -i :3000 -i :3100` 清掉再跑 |
| 门户/顶栏点卡片进到 404（Nuxt 404 页） | 跨应用链接用了 NuxtLink/UButton（客户端路由/被 baseURL 改写） | 改原生 `<a href="/g5/">`，见 DEVELOPMENT.md §3.5/§4.5/§5.5/§6.5 四坑 |
| 点击后 URL 变成 /g5/200 | 旧 `_redirects` 的 SPA 200 重写残留（已删）；或浏览器缓存旧 308 | 硬刷新/清缓存/Cloudflare Purge Everything |
| nuxt generate 中断（crawler 404） | 页面跨年级链接被 crawler 爬 | 年级应用保持 `prerender.failOnError:false`；门户保持 `crawlLinks:false + routes:['/']` |
| 门户卡片用 NuxtLink 显示门户 404 | 门户没有 /g1/ /g2/ /g3/ /g4/ /g5/ /g6/ 路由 | 门户卡片用原生 `<a href="/g1/">`（已在 portal/pages/index.vue） |
