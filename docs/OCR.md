# OCR 方案与数据 · OCR Pipeline & Data

本项目配套一套**可复现的课本 OCR 管线**，并把识别出的**文字数据**一并开源。本文说明方案、数据产物、质量核对、复现步骤与开源/版权范围。

> 代码部分以 [MIT License](../LICENSE) 授权；OCR 文本与合订正文源自教材，受 [NOTICE](../NOTICE) 约束（非商用、不随 MIT 授权）。

## 1. 总体方案：双引擎

| 引擎 | 脚本 | 作用 | 产物 |
| --- | --- | --- | --- |
| **macOS Vision** | [`ocr/src/ocr.swift`](../ocr/src/ocr.swift) | 逐页文字识别 + 整页渲染 + 自动裁插图 | `pNNN.txt` / `pNNN.jpg` / `pNNN-N.jpg` |
| **智谱 GLM-OCR** | [`scripts/glm_ocr_math.py`](../scripts/glm_ocr_math.py) | 版面感知识别，小号/嵌图文字质量更好 | `work/glm_ocr/<grade>/pNNN.json|md`（不入库） |

在此基础上：

- [`scripts/merge_book_glm.py`](../scripts/merge_book_glm.py)：用 GLM 文字重建六本合订正文（缺失时回退 Vision 文本）。
- [`ocr/src/merge.py`](../ocr/src/merge.py)：一年级 Vision 版合订（早期版本，保留作参考）。
- [`scripts/verify_examples.py`](../scripts/verify_examples.py) / [`scripts/verify_glm_examples.py`](../scripts/verify_glm_examples.py)：例题 ↔ OCR 文字的证据核对，产出 STRONG/MEDIUM/FIG 三级结论。

## 2. 数据产物与目录

```text
gX/ocr/upper/
├── pages/
│   ├── pNNN.txt      # 每页 Vision 文字（✅ 入库，开源）
│   ├── pNNN.jpg      # 整页渲染图（⛔ 不入库，体积大）
│   └── pNNN-N.jpg    # 自动裁剪的插图片段（⛔ 不入库）
└── book/
    ├── 上册_正文.md   # 合订图文正文（✅ 入库；引用 ../pages/*.jpg）
    └── 上册_目录.md   # 目录 OCR 原文（✅ 入库）

work/glm_ocr/<grade>/  # GLM 原始响应与 md（⛔ 不入库，可用脚本重跑）
```

> ⚠️ **注意**：整页图/插图（`*.jpg`）因体积与版权未入库，因此 GitHub 上 `上册_正文.md` 内的图片链接会失效。需要图文版时，请按第 5 节用原 PDF 本地重建。

## 3. 方案一：macOS Vision（`ocr/src/ocr.swift`）

- **渲染**：PDFKit 以 2.0x 渲染每页为整页 JPEG（质量 0.85）。
- **文字**：`VNRecognizeTextRequest`，`recognitionLanguages = ["zh-Hans","en-US"]`，`.accurate`，`usesLanguageCorrection = true`，`minimumTextHeight = 0.005`。
- **插图裁剪**：页面按 **6×5 网格**分瓦片；某瓦片「非白像素占比 ≥ 10%」且「文字覆盖率 ≤ 55%」标为候选；**8-连通聚簇**成矩形；要求 ≥ 2×2 瓦片、面积 ≤ 整页 75%，否则视为整页图而不重复输出。

构建与运行（仅 macOS）：

```bash
swiftc -O ocr/src/ocr.swift -o ocr/src/ocr_bin
./ocr/src/ocr_bin "path/to/book.pdf" <startPage> <endPage> "gX/ocr/upper/pages"
python3 ocr/src/merge.py gX/ocr/upper/pages gX/ocr/upper/book   # 一年级 Vision 版合订
```

## 4. 方案二：智谱 GLM-OCR 版面解析（可选增强）

- 接口：`https://open.bigmodel.cn/api/paas/v4/layout_parsing`，模型 `glm-ocr`。
- 输入：各年级 `pages/pNNN.jpg`（需先由 Vision 步骤渲染整页图）。
- 密钥：从环境变量 `ZHIPU_API_KEY` 读取，**不落盘**。
- 特性：断点续跑（已存在 `pNNN.json` 跳过）、失败清单、`summary.json`；遇欠费/401 即停。

```bash
export ZHIPU_API_KEY="你的 key"
python3 scripts/glm_ocr_math.py                 # 六本全量批处理
python3 scripts/merge_book_glm.py g1 g2 g3 g4 g5 g6   # 重建合订正文
python3 scripts/verify_glm_examples.py          # 重新生成 docs/example-audit-glm.md
```

## 5. 页面映射与偏移

书页页码 = PDF 页码 + 偏移；各年级偏移与页数如下（已按实际 OCR 产物核对）：

| 年级 | 教材 | PDF 页数 | 书页偏移 | OCR 文本页 |
| --- | --- | --- | --- | --- |
| 一年级 | 苏教版 · 上册 | 105 | −7 | 105 |
| 二年级 | 苏教版 · 上册 · 2025 新编 | 120 | −8 | 120 |
| 三年级 | 苏教版 · 上册 | 132 | −8 | 132 |
| 四年级 | 苏教版 · 上册 | 121 | −3 | 121 |
| 五年级 | 苏教版 · 上册 | 131 | −2 | 131 |
| 六年级 | 苏教版 · 上册 | 120 | −2 | 120 |
| **合计** | | **729** | | **729** |

> 空白页（无文字，属正常）：g1 `p005/p007/p105`、g2 `p002/p006/p008/p116/p119`、g3 `p002/p006/p008/p128/p131`、g5 `p130`；g4、g6 无空白页。

## 6. 质量核对（235 条例题）

`scripts/verify_glm_examples.py` 对六册 **235 条例题**在对应书页 GLM 文字中查找印刷证据，三级结论：

- **STRONG**：算式/不等式/关键数与课本印刷一致；
- **MEDIUM**：文字题可在该页印证；
- **FIG**：内容仅在图中（教材本身未印为文字，需人工看图）。

全量结果：**STRONG 200 / MEDIUM 27 / FIG 8 / NA 0**；逐条表格、FIG 人工复核结论与数据修正记录见 [`docs/example-audit-glm.md`](example-audit-glm.md)。

核对过程发现并已修正的数据问题（示例）：`g4-c3-peri-area-change` 页码 42→43、`g3-c10-segment-more` 篮球 25→50，以及 4 处可视化默认值/单位修正。

## 7. 数据现状统计（2026-11 核查）

| 年级 | `pNNN.txt` | 空页 | 合订正文行数 | 例题 / Lab 数 |
| --- | --- | --- | --- | --- |
| g1 | 105 | 3 | 2463 | 78 道例题 |
| g2 | 120 | 5 | 3574 | 22 Lab |
| g3 | 132 | 5 | 3492 | 41 Lab |
| g4 | 121 | 0 | 3126 | 28 Lab |
| g5 | 131 | 1 | 2957 | 33 Lab |
| g6 | 120 | 0 | 3051 | 33 Lab（+14 练习题） |

文本合计约 **505 KB（UTF-8，约 21.5 万字）**；本地另有 1274 张整页/插图 JPEG（未入库）。

## 8. 已知限制

- OCR 文字存在个别错字、符号与图内文字漏读，适合"正文阅读/检索"，不保证逐字精确。
- **FIG 类**例题的关键信息只在图中，纯文字无法核对，需人工看图。
- 合订正文引用的整页图/插图未随仓库分发，GitHub 上图片不显示，需要本地重建。
- Vision 方案仅支持 **macOS**；GLM 方案需要网络与 `ZHIPU_API_KEY`（可能产生费用）。

## 9. 开源与版权范围

- **代码**（`ocr/src/*.swift|py`、`scripts/glm_ocr_math.py`、`scripts/merge_book_glm.py`、`scripts/verify_*.py`）：MIT。
- **OCR 文本与合订正文**（`gX/ocr/**/*.txt|md`）：由教材扫描件识别而来，著作权归原出版方，**不属于 MIT 授权**，仅供教学研究，不得商用或再分发，详见 [NOTICE](../NOTICE)。
- **教材 PDF、整页图/插图、GLM 原始响应**：不入库，由使用者自备 PDF 并通过上述脚本自行生成。
- 预编译二进制 `ocr/src/ocr_bin` 仅适用于 arm64 macOS，**不再纳入版本库**；请按第 3 节自行编译。
