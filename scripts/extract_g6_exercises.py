#!/usr/bin/env python3
"""从六年级上册 GLM 合订正文中抽取"练习题"候选（练一练 / 练习一~十四 / 练习与应用 / 探索与实践）。

用途：为"练习题可视化"提供机器可读的候选清单（供 DeepSeek 判定适配度）。
输入：g6/ocr/upper/book/上册_正文.md
输出：
  - g6/data/upper/exercises/candidates.json   结构化候选
      * blocks：一次"练一练/练习N"小节 = 一个候选块（含跨页全文，最可靠的分析单元）
      * items： 块内按题号切分的最佳努力片段（OCR 会把正文续行误判为小题号，仅作参考）
  - g6/docs/练习题候选清单.md                  人读汇总（按单元分组，逐块）

书页 = PDF页 - 2（六年级约定），章节页区间见 g6/data/upper/chapters/meta.ts 与 g6/docs。
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'g6/ocr/upper/book/上册_正文.md'
OUT_JSON = ROOT / 'g6/data/upper/exercises/candidates.json'
OUT_MD = ROOT / 'g6/docs/练习题候选清单.md'
OUT_BRIEF_DIR = ROOT / 'g6/data/upper/exercises/briefs'

# 各单元已有 Lab（id -> (title, kind, page)），由 chapters/*.ts 维护；简报里同步一份便于判定查重。
# 为避免与数据源双写失真，简报只引用文件路径，不复制 Lab 明细。

# (unit id, 单元标题, 书页起, 书页止)
UNITS = [
    ('c1', '一 小数乘法和除法（二）', 1, 13),
    ('c2', '二 混合运算与数量关系（三）', 14, 25),
    ('c2', '生活中的分段计费', 26, 29),
    ('c3', '三 数与运算的再认识', 30, 41),
    ('c3', '二进制的秘密', 42, 43),
    ('c4', '四 比和比例', 44, 63),
    ('c4', '神奇的黄金比', 64, 67),
    ('c5', '五 圆', 68, 87),
    ('c5', '体育中的数学', 88, 91),
    ('c6', '六 放大与缩小', 92, 102),
    ('c7', '七 确定位置', 103, 111),
    ('review', '期末复习', 112, 118),
]

PAGE_RE = re.compile(r'^## 书页\s*(\d+)')
SECTION_RE = re.compile(r'^##\s*(练\s*一\s*练|练\s*习\s*[一二三四五六七八九十]+|练习与应用|探索与实践|评价与反思)\s*$')
ITEM_RE = re.compile(r'^(\d+)\.\s*(.*)$')
NOISE_PREFIX = ('> 插图片段', '![')


def unit_of(page: int) -> str:
    for uid, _title, start, end in UNITS:
        if start <= page <= end:
            return uid
    return 'other'


def unit_title_of(page: int) -> str:
    for _u, title, start, end in UNITS:
        if start <= page <= end:
            return title
    return '?'


def clean(text: str) -> str:
    t = text
    t = re.sub(r'<table[^>]*>', ' [表格] ', t)
    t = re.sub(r'</?tr[^>]*>', ' ', t)
    t = re.sub(r'</?td[^>]*>', ' | ', t)
    t = re.sub(r'</?table[^>]*>', ' ', t)
    t = t.replace('\\', '')
    t = t.replace('$$', ' ')
    t = t.replace('$', ' ')
    t = re.sub(r'\s+', ' ', t)
    return t.strip()


def main() -> None:
    lines = BOOK.read_text(encoding='utf-8').split('\n')

    page = 0
    in_math = False
    blocks: list[dict] = []
    items: list[dict] = []
    cur_block: dict | None = None
    cur_item: dict | None = None
    seq = 0

    def flush_item() -> None:
        nonlocal cur_item
        if cur_item is not None:
            cur_item['text'] = clean(' '.join(cur_item.pop('_parts')))
            cur_item['pages'] = sorted(set(cur_item.pop('_pages')))
            if cur_item['text']:
                items.append(cur_item)
        cur_item = None

    def flush_block() -> None:
        nonlocal cur_block
        flush_item()
        if cur_block is not None:
            cur_block['text'] = clean(' '.join(cur_block.pop('_parts')))
            cur_block['pages'] = sorted(set(cur_block.pop('_pages')))
            if cur_block['text']:
                blocks.append(cur_block)
        cur_block = None

    for raw in lines:
        line = raw.rstrip()

        m_page = PAGE_RE.match(line)
        if m_page:
            page = int(m_page.group(1))
            if cur_block is not None:
                cur_block['_pages'].append(page)
            if cur_item is not None:
                cur_item['_pages'].append(page)
            continue

        m_sec = SECTION_RE.match(line)
        if m_sec:
            flush_block()
            name = re.sub(r'\s+', '', m_sec.group(1))
            seq += 1
            cur_block = {
                'id': f'g6-block-{seq}',
                'unit': unit_of(page),
                'unitTitle': unit_title_of(page),
                'section': name,
                'sectionSeq': seq,
                'page': page,
                'text': '',
                '_parts': [],
                '_pages': [page],
            }
            in_math = False
            continue

        if line.startswith('## '):
            flush_block()
            in_math = False
            continue

        if cur_block is None:
            continue

        if line.strip() == '$$':
            in_math = not in_math
            continue

        if any(line.startswith(p) for p in NOISE_PREFIX):
            continue

        if not in_math:
            m_item = ITEM_RE.match(line)
            if m_item:
                flush_item()
                cur_item = {
                    'block': cur_block['id'],
                    'unit': cur_block['unit'],
                    'section': cur_block['section'],
                    'page': page,
                    'no': int(m_item.group(1)),
                    'text': '',
                    '_parts': [],
                    '_pages': [page],
                }
                rest = m_item.group(2).strip()
                if rest:
                    cur_item['_parts'].append(rest)
                cur_block['_parts'].append(line.strip())
                continue

        stripped = line.strip()
        if stripped:
            cur_block['_parts'].append(stripped)
            cur_block['_pages'].append(page)
            if cur_item is not None:
                cur_item['_parts'].append(stripped)
                cur_item['_pages'].append(page)

    flush_block()

    for i, it in enumerate(items, 1):
        it['id'] = f'g6-ex-{i:03d}'

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        'source': 'g6/ocr/upper/book/上册_正文.md',
        'note': '苏教版六年级上册 练习题候选（书页 = PDF页 - 2）。blocks 即一次「练一练/练习N」小节全文（分析单元）。',
        'blockCount': len(blocks),
        'blocks': blocks,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')

    md: list[str] = [
        '# 六年级上册 练习题候选清单',
        '',
        '> 由 `scripts/extract_g6_exercises.py` 从 GLM 合订正文自动抽取（书页 = PDF页 - 2）。',
        f'> 共 {len(blocks)} 个练习小节（blocks），用于 DeepSeek 可视化适配度判定。',
        '',
    ]
    for uid, title, _s, _e in UNITS:
        bucket = [b for b in blocks if b['unit'] == uid and b['unitTitle'] == title]
        if not bucket:
            continue
        md.append(f'## {title}（`{uid}`）· {len(bucket)} 个练习小节')
        md.append('')
        for b in bucket:
            md.append(f"### [{b['id']}] {b['section']} · 书页 {','.join(map(str, b['pages']))}")
            md.append('')
            md.append(b['text'])
            md.append('')
    OUT_MD.write_text('\n'.join(md), encoding='utf-8')

    # 每单元一份简报（按 uid 聚合，含该单元全部标题下的 block，剔除评价与反思）
    OUT_BRIEF_DIR.mkdir(parents=True, exist_ok=True)
    seen_units: list[str] = []
    for uid, _t, _s, _e in UNITS:
        if uid not in seen_units:
            seen_units.append(uid)
    for uid in seen_units:
        bucket = [b for b in blocks if b['unit'] == uid and b['section'] != '评价与反思']
        if not bucket:
            continue
        titles: list[str] = []
        for b in bucket:
            if b['unitTitle'] not in titles:
                titles.append(b['unitTitle'])
        brief = [
            f'# 六年级练习题候选简报 · {"/".join(titles)}（{uid}）',
            '',
            '> 由 `scripts/extract_g6_exercises.py` 抽取（书页 = PDF页 - 2）。',
            f'> 共 {len(bucket)} 个练习小节（已剔除“评价与反思”）。',
            '> 判定时请同时阅读：`g6/data/upper/chapters/cN.ts`（已有 Lab）、',
            '> `g6/game/src/lib/labs/compute.ts`（已有 33 种 kind 与分步文案）、',
            '> `g6/game/src/components/labs/*.vue`（已有可视化组件）。',
            '> 需要看图时读 `g6/ocr/upper/pages/p{书页+2:03d}.jpg`（书页 = PDF页 - 2）。',
            '',
        ]
        for b in bucket:
            brief.append(f"## [{b['id']}] {b['section']} · 书页 {','.join(map(str, b['pages']))}")
            brief.append('')
            brief.append(b['text'])
            brief.append('')
        (OUT_BRIEF_DIR / f'{uid}.md').write_text('\n'.join(brief), encoding='utf-8')

    print(f'extracted {len(blocks)} blocks -> {OUT_JSON.relative_to(ROOT)}')
    by_unit: dict[str, int] = {}
    for b in blocks:
        by_unit[b['unit']] = by_unit.get(b['unit'], 0) + 1
    print('blocks by unit:', by_unit)


if __name__ == '__main__':
    main()
