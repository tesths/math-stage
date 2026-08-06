"""生成上册合订图文版 markdown，标注书页码，并嵌入整页图与自动识别的插图。"""
import glob
import os
import sys

PAGES_DIR = sys.argv[1] if len(sys.argv) > 1 else "g1/ocr/upper/pages"
BOOK_DIR = sys.argv[2] if len(sys.argv) > 2 else "g1/ocr/upper/book"

FRONT = {
    1: "封面",
    2: "书名页",
    3: "版权页",
    4: "致同学",
    5: "空白页",
    6: "目录（页一）",
    7: "目录（页二）",
}
BACK = {
    102: "附页（卡片）",
    103: "附页（卡片）",
    104: "后记",
    105: "空白页",
}

def book_page_label(pdf_pg: int) -> str:
    if pdf_pg in FRONT:
        return f"前页·{FRONT[pdf_pg]}"
    if pdf_pg > 101:
        return f"后页·{BACK.get(pdf_pg, str(pdf_pg))}"
    return f"书页 {pdf_pg - 7}"

def page_figures(pdf_pg: int) -> list[str]:
    """返回该页所有插图裁剪图（相对 book 输出目录的路径，按编号排序）。"""
    files = glob.glob(os.path.join(PAGES_DIR, f"p{pdf_pg:03d}-*.jpg"))
    files.sort(key=lambda f: int(f.split("-")[-1].split(".")[0]))
    return [os.path.join("../pages", os.path.basename(f)) for f in files]

def main():
    out = []
    out.append("# 义务教育教科书·数学一年级上册 （根据2022年版课程标准修订）")
    out.append("")
    out.append("> 由扫描版 PDF 经 macOS Vision OCR 识别生成。")
    out.append("> 每页标注为：书页页码（书页码 = PDF页码 - 7，自\"数学游戏分享\"=书页1起始）。")
    out.append("> 每页附带整版原图与自动识别的插图片段（白色版面内非文字区域）。")
    out.append("> OCR 原始行按识别顺序保留，个别符号/图内文字可能不准，正文阅读可用。")
    out.append("")

    pages = sorted(glob.glob(os.path.join(PAGES_DIR, "p*.txt")))
    total_figs = 0
    for f in pages:
        pdf_p = int(f.split("/")[-1].replace("p", "").replace(".txt", ""))
        lines = [l.strip() for l in open(f, encoding="utf-8") if l.strip()]
        figs = page_figures(pdf_p)
        full_img = f"../pages/p{pdf_p:03d}.jpg"

        out.append("")
        out.append(f"## {book_page_label(pdf_p)}  （PDF p{pdf_p:03d}）")
        out.append("")
        out.append(f"![整页 {book_page_label(pdf_p)}]({full_img})")
        out.append("")
        if not lines:
            out.append("_（本页无文字）_")
        else:
            out.extend(lines)
            out.append("")
        if figs:
            total_figs += len(figs)
            out.append("> 插图片段：")
            for i, fig in enumerate(figs):
                out.append(f"![插图{pdf_p:03d}-{i+1}]({fig})")
            out.append("")
    out.append("")
    out.append("--- 完 ---")
    os.makedirs(BOOK_DIR, exist_ok=True)
    body_path = os.path.join(BOOK_DIR, "上册_正文.md")
    with open(body_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))
    print(f"written {body_path} (pages={len(pages)}, figures={total_figs})")

    toc = [l.strip() for l in open(os.path.join(PAGES_DIR, "p006.txt"), encoding="utf-8") if l.strip()]
    t = ["# 目录（OCR 原文，PDF p006）", "", "```", *toc, "```", ""]
    toc_path = os.path.join(BOOK_DIR, "上册_目录.md")
    with open(toc_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(t))
    print(f"written {toc_path}")

main()
