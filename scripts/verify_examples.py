#!/usr/bin/env python3
"""例题 ↔ 课本文字 机器校验
对每条例题，在该题标注的书页 OCR 文字中查找"印刷证据"：
- addsub: 印刷算式如 3+2=5（容忍空格/换行/尾部乱码）
- compare: 印刷不等式如 5>3
- split: 印刷填空式如 8+（ ）=10
- ten:   "相加等于10" 类字样
- ordinal/position: 目标词出现
- count/write/numberline/sequence: 关键数字出现
并判定该页属于「主情景例题」还是「想想做做/练习/试一试」小节。
"""
import glob
import re

def load_pages():
    text = {}
    for f in glob.glob("ocr/pages/p*.txt"):
        pdfp = int(re.search(r"p(\d+)\.txt", f).group(1))
        raw = open(f, encoding="utf-8").read()
        text[pdfp - 7] = raw  # 书页码
    return text

def parse_chapter(path):
    src = open(path, encoding="utf-8").read()
    # 按 id: 行切块（每条例题一个对象）
    chunks = re.split(r"(?=\n\s*id:\s*')", src)
    out = []
    for b in chunks:
        mid = re.search(r"id:\s*'([^']+)'", b)
        if not mid:
            continue
        page = re.search(r"page:\s*(\d+)", b)
        typ = re.search(r"type:\s*'([^']+)'", b)
        prompt = re.search(r"prompt:\s*'([^']*)'", b)
        title = re.search(r"title:\s*'([^']*)'", b)
        cfg = {}
        for key in ("answer", "a", "b", "op", "total", "given", "value", "from", "to",
                    "shape", "position", "target", "cards", "emoji", "number", "hint", "items"):
            pat = r"\b" + key + r":\s*(\[[^\]]*\]|'[^']*'|\d+)"
            m = re.search(pat, b)
            if m:
                cfg[key] = m.group(1).strip().strip("'\"")
        out.append(dict(id=mid.group(1), page=int(page.group(1)), type=typ.group(1),
                        prompt=prompt.group(1) if prompt else "", title=title.group(1) if title else "",
                        cfg=cfg))
    return out

def norm(s: str) -> str:
    return re.sub(r"[\s\uFE0F\uFE0E]", "", s)

def find_formula(page_text, a, op, b):
    t = norm(page_text)
    pats = [
        f"{a}{op}{b}",
        f"{a}{op}{b}=",
        f"={a}{op}{b}",
        f"{a} {op} {b}",
        f"{a}{op}{b}=",
    ]
    hits = [p for p in pats if p in t]
    # OCR 尾缀乱码容忍：3+2=5 之后可能跟数字/符号
    return any(h in t for h in {f"{a}{op}{b}", f"{a}{op}{b}="})

def section_classify(page_text):
    t = page_text
    has_example = any(k in t for k in ("读作", "从3接着数", "接着数", "合起来是", "添上", "说一说"))
    has_practice = any(k in t for k in ("想想做做", "练习", "试一试", "猜灯谜", "口算"))
    if has_example and has_practice:
        return "例题+习题页"
    if has_example:
        return "主情景例题页"
    if has_practice:
        return "练习/想想做做页"
    return "不确定"

def check(q, page_text):
    t = norm(page_text)
    typ = q["type"]
    cfg = q["cfg"]
    if typ == "addsub":
        a, b, op = cfg.get("a"), cfg.get("b"), cfg.get("op")
        if a and b and op:
            # STRONG：印刷算式（容忍 OCR 断行/尾缀）
            if find_formula(page_text, a, op, b):
                return "STRONG", f"印刷算式 {a}{op}{b} 出现"
            # MEDIUM：故事题，两个关键数都出现在该页
            if str(a) in t and str(b) in t:
                return "MEDIUM", f"算式未印刷，但 {a} 与 {b} 两数均在该页（故事题）"
            return "FIG", f"算式与两数都未在文字中出现（可能仅在图内）"
        return None, "缺 a/b/op"
    if typ == "compare":
        a, b = cfg.get("a"), cfg.get("b")
        ans = cfg.get("answer", "").strip("[]'\"")
        if a and b and ans in (">", "<", "="):
            t2 = page_text.replace(" ", "")
            strong = (f"{a}{ans}{b}" in t or f"{a} {ans} {b}".replace(" ", "") in t
                      or f"{a}{ans}{b}".replace(" ", "") in t2
                      or f"{a}○{b}" in t2 or f"{a}〇{b}" in t2)
            if strong:
                return "STRONG", f"印刷 {a}{ans}{b}（或 ○ 填空）出现"
            # MEDIUM：句子表述 大于/小于/等于，或两数同时出现
            med = (f"{a}比{b}大" in page_text or f"{a}比{b}小" in page_text
                   or f"{a}等于{b}" in page_text
                   or f"读作：{a}大于{b}" in page_text or f"读作：{a}小于{b}" in page_text
                   or "看数画珠" in page_text
                   or (str(a) in t and str(b) in t))
            if med:
                return "MEDIUM", f"未见直接印刷，但页面有'{a}比{b}大/小'或两数/看数画珠"
            return "FIG", f"比较关系只能从图中读（{a} 与 {b} 均不在页）"
        return None, "缺 a/b/answer"
    if typ == "split":
        total, given = cfg.get("total"), cfg.get("given")
        if total and given:
            strong = ((f"{given}+（" in page_text or f"{given}+(" in t or f"{given}+" in t)
                      and f"={total}" in t)
            if strong:
                return "STRONG", f"印刷 {given}+（ ）={total} 出现"
            # 课本风格："把6颗糖分给2人" / "再放几个是10个"
            med = ((f"把{total}颗" in page_text or f"{given}人" in page_text
                    or f"再放{total}" in page_text or f"再放{given}" in page_text)
                   and (str(given) in t and str(total) in t))
            if med:
                return "MEDIUM", f"课本以文字题出现（含 {given} 与 {total}）"
            return "FIG", f"分裂填空均未见（见于图？）"
        return None, "缺 total/given"
    if typ == "ten":
        target = cfg.get("target")
        cards = re.findall(r"\d+", cfg.get("cards", "") or "")
        found = ("相加" in page_text or "得数" in page_text) and str(target) in t
        if found and cards:
            return "STRONG", f"页含'相加…{target}'字样，卡片{cards}在页: {any(c in t for c in cards)}"
        if found:
            return "STRONG", f"页含'相加'与目标数{target}"
        return "FIG", "未在页文字中找到'相加'字样"
    if typ == "ordinal":
        target = cfg.get("target")
        has_seq = any(k in page_text for k in ("第几个", "第（）", "第（", "排在第", "几和第几", "从左数"))
        if has_seq:
            return "STRONG", f"页含序数题标记（目标词可属 emoji，顺序需看图）"
        return "MEDIUM", "未找到序数标记"
    if typ == "position":
        items = re.findall(r"'([^']+)'", cfg.get("items", "") or "")
        target = cfg.get("target")
        hits = [it for it in items if it in page_text]
        had_dir = any(k in page_text for k in ("上面", "下面", "左边", "右边", "前面", "后面"))
        if had_dir and len(hits) >= 2 and target and target in page_text:
            return "STRONG", f"方位词页含场景词 {hits}（目标 '{target}' 在页）"
        if had_dir or len(hits) >= 1:
            return "MED", f"方位词页，场景词命中 {len(hits)}/{len(items)}"
        return "FIG", f"场景词命中 {len(hits)}/{len(items)}，未见方位标记"
    if typ == "shape3d":
        shape = cfg.get("shape", "").strip("[]'\"")
        found = "形状" in page_text or "形状是" in page_text or "长方" in page_text or "圆" in page_text
        if shape in page_text:
            return "STRONG", f"形状名 '{shape}' 出现在该页"
        return "FIG", f"未找到 '{shape}' 字样"
    if typ in ("count", "write", "numberline"):
        num = cfg.get("answer") or cfg.get("number") or cfg.get("value")
        found = num is not None and str(num) in t
        # MEDIUM：年龄 page 上确实在教这个数（如"认识8"）
        med = found or (f"认识" in page_text and num is not None and str(num) in t)
        if found:
            return "STRONG", f"关键数 {num} 出现在该页文字"
        return "FIG", f"关键数 {num} 未出现在该页（数量在图内）"
    if typ == "sequence":
        frm, to = cfg.get("from"), cfg.get("to")
        found = frm is not None and str(frm) in t and str(to) in t
        return ("STRONG", f"{frm} 与 {to} 都出现在该页") if found else ("FIG", "起始与末尾数未都出现在页")

def main():
    pages = load_pages()
    qs = []
    for f in sorted(glob.glob("data/chapters/c*.ts")):
        qs.extend(parse_chapter(f))
    rows = []
    for q in qs:
        pt = pages.get(q["page"], "")
        sec = section_classify(pt)
        ok, why = check(q, pt)
        rows.append((q, sec, ok, why))
    n_ok = sum(1 for _, _, ok, _ in rows if ok == "STRONG")
    n_med = sum(1 for _, _, ok, _ in rows if ok == "MEDIUM")
    n_fig = sum(1 for _, _, ok, _ in rows if ok == "FIG")
    n_na = sum(1 for _, _, ok, _ in rows if ok is None)
    print(f"共 {len(rows)} 条：STRONG(印刷原文) {n_ok} / MEDIUM(同页可证内容) {n_med} / FIG(仅图内) {n_fig} / NA {n_na}\n")
    for q, sec, ok, why in rows:
        mark = ok if ok else "NA"
        print(f"{mark:6s} {q['id']:16s} 书页{q['page']:>3d} {q['type']:10s} [{sec}] {why}")
    print("\nFIG 说明：内容只能从插图确认（数量/次序未印刷在文字中），需人工看图复核；")
    print("MEDIUM 说明：该页确实存在该内容，但具体数值/表述以文字题或故事题呈现。")

main()