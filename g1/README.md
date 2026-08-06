# 一年级数学内容目录

`g1/` 是一年级的长期维护目录，不再把一年级放在仓库根部的 `game/` / `data/` / `ocr/`。

## 目录约定

```text
g1/
├── data/
│   ├── upper/   # 当前已完成：一年级上册例题/章节数据
│   └── lower/   # 未来扩展：一年级下册例题/章节数据
├── game/        # 一年级 Nuxt 应用；未来可同时挂上册/下册入口
└── ocr/
    ├── upper/   # 当前已完成：一年级上册 OCR 页与合订 Markdown
    └── lower/   # 未来扩展：一年级下册 OCR 页与合订 Markdown
```

## 扩展下册时怎么放

- 下册 OCR 原始页放 `g1/ocr/lower/pages/`，合订 Markdown 放 `g1/ocr/lower/book/`。
- 下册结构化数据放 `g1/data/lower/`，目录形状对齐当前 `g1/data/upper/`。
- 不新增 `g1-lower/`、`game2/` 这类平级目录；同一年级的上下册都归在 `g1/` 内。
- 前端仍复用 `g1/game/`，到需要上线下册时再在应用内增加册别入口和路由。
