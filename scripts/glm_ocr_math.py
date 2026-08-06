#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Batch OCR all six math textbook page images through Zhipu GLM-OCR.

Reads ZHIPU_API_KEY from the environment. Writes raw JSON and md_results under
work/glm_ocr/<grade>. The API key is never written to disk.
"""

from __future__ import annotations

import base64
import json
import os
import sys
import time
from pathlib import Path
from urllib import error, request


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "work" / "glm_ocr"
API_URL = "https://open.bigmodel.cn/api/paas/v4/layout_parsing"

# (年级, 页面图片目录, 页码区间) —— 页码 = PDF 页码，与 gX/ocr/upper/pages/pNNN.jpg 一致
TASKS = [
    ("g1", ROOT / "g1" / "ocr" / "upper" / "pages", range(1, 106)),
    ("g2", ROOT / "g2" / "ocr" / "upper" / "pages", range(1, 121)),
    ("g3", ROOT / "g3" / "ocr" / "upper" / "pages", range(1, 133)),
    ("g4", ROOT / "g4" / "ocr" / "upper" / "pages", range(1, 122)),
    ("g5", ROOT / "g5" / "ocr" / "upper" / "pages", range(1, 132)),
    ("g6", ROOT / "g6" / "ocr" / "upper" / "pages", range(1, 121)),
]


def image_data_url(path: Path) -> str:
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def call_glm_ocr(api_key: str, image_path: Path) -> dict:
    payload = json.dumps(
        {"model": "glm-ocr", "file": image_data_url(image_path)}, ensure_ascii=False
    ).encode("utf-8")
    req = request.Request(
        API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=120) as response:
            status_code = response.status
            raw = response.read().decode("utf-8", errors="replace")
    except error.HTTPError as exc:
        status_code = exc.code
        raw = exc.read().decode("utf-8", errors="replace")
    try:
        data = json.loads(raw)
    except Exception:
        data = {"raw_text": raw[:2000]}
    if status_code >= 400 or "error" in data:
        raise RuntimeError(f"HTTP {status_code}: {data}")
    return data


def write_outputs(grade: str, page: int, data: dict) -> None:
    grade_dir = OUT / grade
    grade_dir.mkdir(parents=True, exist_ok=True)
    (grade_dir / f"p{page:03d}.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (grade_dir / f"p{page:03d}.md").write_text(
        data.get("md_results", ""), encoding="utf-8"
    )


def main() -> int:
    api_key = os.environ.get("ZHIPU_API_KEY")
    if not api_key:
        print("ZHIPU_API_KEY is required", file=sys.stderr)
        return 2
    OUT.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []
    processed = 0
    skipped = 0
    for grade, image_dir, pages in TASKS:
        for page in pages:
            image_path = image_dir / f"p{page:03d}.jpg"
            out_json = OUT / grade / f"p{page:03d}.json"
            if not image_path.exists():
                failures.append(f"missing image: {grade} p{page:03d}")
                continue
            if out_json.exists():
                skipped += 1
                print(f"skip {grade} p{page:03d}", flush=True)
                continue
            try:
                data = call_glm_ocr(api_key, image_path)
                write_outputs(grade, page, data)
                processed += 1
                count = len(data.get("layout_details") or [])
                print(f"ok {grade} p{page:03d}: {count} page groups", flush=True)
                time.sleep(0.2)
            except Exception as exc:
                msg = f"{grade} p{page:03d}: {exc}"
                failures.append(msg)
                print(f"fail {msg}", file=sys.stderr, flush=True)
                if "欠费" in str(exc) or "401" in str(exc):
                    summary = {"processed": processed, "skipped": skipped, "failures": failures}
                    (OUT / "summary.json").write_text(
                        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
                    )
                    return 1
    summary = {"processed": processed, "skipped": skipped, "failures": failures}
    (OUT / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
