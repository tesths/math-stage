import Foundation
import Vision
import PDFKit

// 用法: ocr <pdfPath> <startPage> <endPage> [outputDir]
// 输出:
//   <outputDir>/pNNN.txt   每页 OCR 文字
//   <outputDir>/pNNN.png   每页渲染整版图片（图文对照）
//   <outputDir>/pNNN-*.png 自动识别出的插图/图片区域（白底小图之外）
// outputDir 缺省为 ocr/pages（相对当前目录）
let args = CommandLine.arguments
guard args.count >= 4,
      let pageStart = Int(args[2]),
      let pageEnd = Int(args[3]) else {
    print("usage: ocr <pdfPath> <startPage> <endPage> [outputDir]")
    exit(1)
}
let pdfPath = args[1]

let pagesDir: URL
if args.count >= 5 {
    pagesDir = URL(fileURLWithPath: args[4])
} else {
    pagesDir = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        .appendingPathComponent("ocr/pages")
}

guard let doc = PDFDocument(url: URL(fileURLWithPath: pdfPath)) else {
    print("cannot open pdf: \(pdfPath)")
    exit(1)
}

let total = doc.pageCount
print("total pages: \(total), output: \(pagesDir.path)")
try? FileManager.default.createDirectory(at: pagesDir, withIntermediateDirectories: true)

let languages = ["zh-Hans", "en-US"]
let scale: CGFloat = 2.0
let jpegQuality: Double = 0.85

/// 将 CGImage 转为灰色字节数组，用于判断插图区域
func grayPixels(_ cg: CGImage) -> (bytes: [UInt8], w: Int, h: Int)? {
    let w = cg.width, h = cg.height
    var bytes = [UInt8](repeating: 0, count: w * h)
    let ptr = bytes.withUnsafeMutableBytes { $0.bindMemory(to: UInt8.self).baseAddress! }
    guard let ctx = CGContext(
        data: ptr, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w,
        space: CGColorSpaceCreateDeviceGray(),
        bitmapInfo: CGImageAlphaInfo.none.rawValue
    ) else { return nil }
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
    ctx.flush()
    return (bytes, w, h)
}

/// 基于「非文本 + 非纯白」的网格瓦片聚簇，找出插图区域
func detectFigureRects(textBoxes: [CGRect], gray: [UInt8], w: Int, h: Int) -> [CGRect] {
    let cols = 6, rows = 5
    let tw = CGFloat(w) / CGFloat(cols)
    let th = CGFloat(h) / CGFloat(rows)
    var tiled = [[Bool]](repeating: [Bool](repeating: false, count: cols), count: rows)

    for r in 0..<rows {
        for c in 0..<cols {
            let x0 = Int(Double(c) * tw)
            let y0 = Int(Double(r) * th)
            let x1 = min(Int(Double(c + 1) * tw), w)
            let y1 = min(Int(Double(r + 1) * th), h)
            let tileW = x1 - x0
            let tileH = y1 - y0

            // 非白占比
            var nonWhite = 0
            var total = 0
            let sy = max(1, tileH / 8)
            let sx = max(1, tileW / 8)
            for yy in stride(from: y0, to: y1, by: sy) {
                let rowOff = yy * w
                for xx in stride(from: x0, to: x1, by: sx) {
                    if gray[rowOff + xx] < 245 { nonWhite += 1 }
                    total += 1
                }
            }
            guard total > 0, Double(nonWhite) / Double(total) >= 0.10 else { continue }

            // 被文字覆盖的比例（内部留白多的文字区会被排除）
            let tileRect = CGRect(x: CGFloat(c) * tw, y: CGFloat(r) * th, width: tw, height: th)
            let textArea = textBoxes.reduce(0.0) { acc, box in
                let inter = tileRect.intersection(box)
                return acc + (inter.isEmpty ? 0 : inter.width * inter.height)
            }
            if textArea / (tw * th) > 0.55 { continue }

            tiled[r][c] = true
        }
    }

    // 8-连通聚簇
    let dirs = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)]
    var seen = [[Bool]](repeating: [Bool](repeating: false, count: cols), count: rows)
    var rects: [CGRect] = []
    let pageArea = Double(w) * Double(h)
    for r in 0..<rows where tiled[r].contains(true) {
        for c in 0..<cols where tiled[r][c] {
            if seen[r][c] { continue }
            var stack: [(Int, Int)] = [(r, c)]
            seen[r][c] = true
            var minR = r, maxR = r, minC = c, maxC = c
            while !stack.isEmpty {
                let (cr, cc) = stack.removeLast()
                for (dr, dc) in dirs {
                    let nr = cr + dr, nc = cc + dc
                    if nr < 0 || nr >= rows || nc < 0 || nc >= cols { continue }
                    if !tiled[nr][nc] || seen[nr][nc] { continue }
                    seen[nr][nc] = true
                    minR = min(minR, nr); maxR = max(maxR, nr)
                    minC = min(minC, nc); maxC = max(maxC, nc)
                    stack.append((nr, nc))
                }
            }
            let rect = CGRect(
                x: CGFloat(minC) * tw, y: CGFloat(minR) * th,
                width: CGFloat(maxC + 1) * tw - CGFloat(minC) * tw,
                height: CGFloat(maxR + 1) * th - CGFloat(minR) * th
            )
            // 至少 2x2 瓦片、且面积不超过整页 75% 才算独立插图（否则与整页图重复）
            let tileCount = (maxR - minR + 1) * (maxC - minC + 1)
            let areaRat = Double(rect.width * rect.height) / pageArea
            if tileCount < 4 { continue }
            if areaRat > 0.75 { continue }
            rects.append(rect)
        }
    }
    return rects
}

func cgFromPage(_ page: PDFPage) -> CGImage? {
    let bounds = page.bounds(for: .mediaBox)
    let size = CGSize(width: bounds.width * scale, height: bounds.height * scale)
    let image = NSImage(size: size, flipped: false) { rect in
        NSColor.white.setFill()
        rect.fill()
        let ctx = NSGraphicsContext.current!.cgContext
        ctx.saveGState()
        ctx.scaleBy(x: scale, y: scale)
        page.draw(with: .mediaBox, to: ctx)
        ctx.restoreGState()
        return true
    }
    return image.cgImage(forProposedRect: nil, context: nil, hints: nil)
}

func jpegData(_ cg: CGImage) -> Data? {
    let rep = NSBitmapImageRep(cgImage: cg)
    return rep.representation(using: .jpeg, properties: [.compressionFactor: jpegQuality])
}

for p in pageStart...pageEnd {
    guard p <= total else { break }
    guard let page = doc.page(at: p - 1) else { continue }
    guard let cg = cgFromPage(page) else {
        print("p\(p): render failed")
        continue
    }

    let w = cg.width, h = cg.height
    // 整版 JPEG
    if let d = jpegData(cg) {
        try? d.write(to: pagesDir.appendingPathComponent(String(format: "p%03d.jpg", p)))
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = languages
    request.usesLanguageCorrection = true
    request.minimumTextHeight = 0.005

    var textLines: [String] = []
    var textBoxes: [CGRect] = []
    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    do {
        try handler.perform([request])
        for obs in request.results ?? [] {
            if let cand = obs.topCandidates(1).first {
                textLines.append(cand.string)
                let b = obs.boundingBox
                // Vision 归一化：原点左下 → 像素坐标（y 翻转为从上而下）
                textBoxes.append(CGRect(
                    x: b.origin.x * Double(w),
                    y: (1 - b.origin.y - b.height) * Double(h),
                    width: b.width * Double(w),
                    height: b.height * Double(h)))
            }
        }
    } catch {
        print("p\(p): ocr failed \(error)")
    }

    let txtURL = pagesDir.appendingPathComponent(String(format: "p%03d.txt", p))
    try? textLines.joined(separator: "\n").write(to: txtURL, atomically: true, encoding: .utf8)

    // 插图区域
    if let (gray, gw, gh) = grayPixels(cg) {
        let figs = detectFigureRects(textBoxes: textBoxes, gray: gray, w: gw, h: gh)
        for (i, f) in figs.enumerated() {
            let cx = max(0, Int(round(f.origin.x)))
            let cy = max(0, Int(round(f.origin.y)))
            let cw = min(w - cx, Int(round(f.width)))
            let ch = min(h - cy, Int(round(f.height)))
            guard cw > 30, ch > 30,
                  let crop = cg.cropping(to: CGRect(x: cx, y: cy, width: cw, height: ch)) else { continue }
            let name = String(format: "p%03d-%d.jpg", p, i + 1)
            if let d = jpegData(crop) {
                try? d.write(to: pagesDir.appendingPathComponent(name))
            }
        }
        print("p\(p): \(textLines.count) lines, \(figs.count) figures")
    } else {
        print("p\(p): \(textLines.count) lines, gray failed")
    }
}
print("done")