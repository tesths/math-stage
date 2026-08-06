#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用 GLM OCR 文字重建六个年级的课本合订正文。

输入：work/glm_ocr/<grade>/pNNN.md（GLM md_results，去掉插图占位符后为纯文字）
     g<g>/ocr/upper/pages/pNNN.jpg（整页图）+ pNNN-N.jpg（插图裁剪）
输出：g<g>/ocr/upper/book/上册_正文.md、上册_目录.md
用法：python3 scripts/merge_book_glm.py [g1|g2|g3|g4|g5|g6 ...]（缺省全部）
"""
import glob
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

IMG_TOKEN = re.compile(r"!\[[^\]]*\]\(page=\d+,bbox=[^)]*\)")

BOOKS = {
    "g1": dict(title="义务教育教科书·数学一年级上册（2022课标·人教版）", offset=-7, toc=[6, 7]),
    "g2": dict(title="义务教育教科书·数学二年级上册（2022课标·苏教版2025新编）", offset=-8, toc=[7]),
    "g3": dict(title="义务教育教科书·数学三年级上册（2022课标·苏教版）", offset=-8, toc=[7]),
    "g4": dict(title="苏教版数学四年级上册（2026新编）", offset=-3, toc=[3]),
    "g5": dict(title="苏教版数学五年级上册", offset=-2, toc=[2]),
    "g6": dict(title="苏教版数学六年级上册", offset=-2, toc=[2]),
}


def book_page_label(pdf_pg: int, offset: int) -> str:
    book_pg = pdf_pg + offset
    if book_pg < 1:
        return f"前页·PDF p{pdf_pg:03d}"
    return f"书页 {book_pg}"


def page_figures(pages_dir: Path, pdf_pg: int) -> list[str]:
    files = glob.glob(str(pages_dir / f"p{pdf_pg:03d}-*.jpg"))
    files.sort(key=lambda f: int(f.split("-")[-1].split(".")[0]))
    return [os.path.join("../pages", os.path.basename(f)) for f in files]


def page_text(grade: str, pdf_pg: int, pages_dir: Path) -> list[str]:
    glm_md = ROOT / "work" / "glm_ocr" / grade / f"p{pdf_pg:03d}.md"
    src = glm_md if glm_md.exists() else pages_dir / f"p{pdf_pg:03d}.txt"
    raw = src.read_text(encoding="utf-8")
    if src.name.endswith(".md"):
        raw = IMG_TOKEN.sub("", raw)
    return [l.strip() for l in raw.splitlines() if l.strip()]


def toc_pages(grade: str, toc: list[int], pages_dir: Path) -> list[str]:
    out = []
    for p in toc:
        txt = pages_dir / f"p{p:03d}.txt"
        if txt.exists():
            out.append(f"### 目录页（PDF p{p:03d}）")
            out.append("```")
            out.extend(l.strip() for l in txt.read_text(encoding="utf-8").splitlines() if l.strip())
            out.append("```")
    return out


def build(grade: str) -> None:
    cfg = BOOKS[grade]
    pages_dir = ROOT / grade / "ocr" / "upper" / "pages"
    book_dir = ROOT / grade / "ocr" / "upper" / "book"
    pdf_pages = sorted(int(re.search(r"p(\d+)\.txt", f).group(1))
                       for f in glob.glob(str(pages_dir / "p*.txt")))
    out = [
        f"# {cfg['title']}",
        "",
        "> 由扫描版 PDF 经智谱 GLM-OCR 识别生成（图文版合订正文）。",
        f"> 书页页码 = PDF页码 {cfg['offset']:+d}。每页附带整版原图与自动识别的插图片段。",
        "> GLM OCR 原始输出按版面顺序保留，个别图内文字/符号可能不准，正文阅读可用。",
        "",
    ]
    total_figs = 0
    for pdf_p in pdf_pages:
        lines = page_text(grade, pdf_p, pages_dir)
        figs = page_figures(pages_dir, pdf_p)
        label = book_page_label(pdf_p, cfg["offset"])
        out.append("")
        out.append(f"## {label}  （PDF p{pdf_p:03d}）")
        out.append("")
        out.append(f"![整页 {label}](../pages/p{pdf_p:03d}.jpg)")
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
    book_dir.mkdir(parents=True, exist_ok=True)
    body = book_dir / "上册_正文.md"
    body.write_text("\n".join(out) + "\n", encoding="utf-8")
    toc = toc_pages(grade, cfg["toc"], pages_dir)
    if toc:
        (book_dir / "上册_目录.md").write_text(
            "# 目录（OCR 原文）\n\n" + "\n".join(toc) + "\n", encoding="utf-8"
        )
    print(f"written {body} (pages={len(pdf_pages)}, figures={total_figs})")


def main() -> int:
    grades = sys.argv[1:] or list(BOOKS)
    for g in grades:
        if g not in BOOKS:
            print(f"未知年级 {g}", file=sys.stderr)
            return 1
    for g in grades:
        build(g)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
