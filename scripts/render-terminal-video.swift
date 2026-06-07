#!/usr/bin/env swift

import AppKit
import Foundation

struct RendererConfig {
    let width = 1280
    let height = 720
    let fps = 5
    let minDurationSeconds = 140.0
    let maxDurationSeconds = 170.0
    let endHoldSeconds = 6.0
    let margin = 46.0
    let titleHeight = 46.0
    let lineHeight = 23.0
    let fontSize = 17.0
}

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write(Data("Usage: render-terminal-video.swift TRANSCRIPT FRAMES_DIR\n".utf8))
    exit(2)
}

let transcriptURL = URL(fileURLWithPath: args[1])
let framesURL = URL(fileURLWithPath: args[2])
let config = RendererConfig()

try FileManager.default.createDirectory(at: framesURL, withIntermediateDirectories: true)

let raw = try String(contentsOf: transcriptURL, encoding: .utf8)
let ansiPattern = "\u{001B}\\[[0-9;]*[A-Za-z]"
let ansiRegex = try NSRegularExpression(pattern: ansiPattern)
let noAnsi = ansiRegex.stringByReplacingMatches(
    in: raw,
    range: NSRange(raw.startIndex..., in: raw),
    withTemplate: ""
)

func wrap(_ line: String, columns: Int) -> [String] {
    if line.count <= columns {
        return [line]
    }
    var result: [String] = []
    var current = ""
    for word in line.split(separator: " ", omittingEmptySubsequences: false) {
        let token = String(word)
        if current.count + token.count + 1 > columns {
            if !current.isEmpty {
                result.append(current)
                current = token
            } else {
                result.append(String(token.prefix(columns)))
                current = String(token.dropFirst(columns))
            }
        } else {
            current += current.isEmpty ? token : " \(token)"
        }
    }
    if !current.isEmpty {
        result.append(current)
    }
    return result
}

let columns = 104
let transcriptLines = noAnsi
    .replacingOccurrences(of: "\r", with: "")
    .split(separator: "\n", omittingEmptySubsequences: false)
    .flatMap { wrap(String($0), columns: columns) }
    .filter { !$0.contains("warning:") || $0.contains("tests") }

let lineCount = max(transcriptLines.count, 1)
let targetDuration = min(config.maxDurationSeconds, max(config.minDurationSeconds, Double(lineCount) * 0.72))
let revealInterval = max(0.18, (targetDuration - config.endHoldSeconds) / Double(lineCount))
let totalFrames = Int(ceil((targetDuration + config.endHoldSeconds) * Double(config.fps)))

let font = NSFont.monospacedSystemFont(ofSize: config.fontSize, weight: .regular)
let boldFont = NSFont.monospacedSystemFont(ofSize: config.fontSize, weight: .semibold)
let titleFont = NSFont.monospacedSystemFont(ofSize: 18, weight: .semibold)

func color(_ hex: UInt32) -> NSColor {
    NSColor(
        calibratedRed: CGFloat((hex >> 16) & 0xff) / 255.0,
        green: CGFloat((hex >> 8) & 0xff) / 255.0,
        blue: CGFloat(hex & 0xff) / 255.0,
        alpha: 1.0
    )
}

let bg = color(0x08111f)
let panel = color(0x101c2e)
let titleBar = color(0x18253a)
let cyan = color(0x5eead4)
let green = color(0x7ddc83)
let yellow = color(0xfacc15)
let white = color(0xe5edf7)
let muted = color(0x93a4b8)
let red = color(0xfb7185)

func attributes(for line: String) -> [NSAttributedString.Key: Any] {
    var textColor = white
    var selectedFont = font
    if line.contains("━━") || line.hasPrefix("  🏗") || line.hasPrefix("  📜") || line.hasPrefix("  🤖") || line.hasPrefix("  💰") || line.hasPrefix("  ⛓") || line.hasPrefix("  🧰") || line.contains("Demo Complete") {
        textColor = cyan
        selectedFont = boldFont
    } else if line.trimmingCharacters(in: .whitespaces).hasPrefix("$") || line.contains("Built for:") || line.contains("Track:") {
        textColor = yellow
    } else if line.contains("✅") || line.contains("passed") || line.contains("COMPLETE") || line.contains("PUBLISH") {
        textColor = green
    } else if line.contains("PAYMENT_REQUIRED") || line.contains("PAYMENT_SIGNED") || line.contains("DATA_RECEIVED") {
        textColor = yellow
    } else if line.contains("SKIP") || line.contains("failed") || line.contains("unavailable") {
        textColor = red
    } else if line.trimmingCharacters(in: .whitespaces).isEmpty {
        textColor = muted
    }
    return [
        .font: selectedFont,
        .foregroundColor: textColor,
        .paragraphStyle: {
            let style = NSMutableParagraphStyle()
            style.lineBreakMode = .byClipping
            return style
        }()
    ]
}

func drawRoundedRect(_ rect: NSRect, radius: CGFloat, fill: NSColor) {
    fill.setFill()
    NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius).fill()
}

func writeFrame(index: Int, visibleCount: Int) throws {
    autoreleasepool {
        let image = NSImage(size: NSSize(width: config.width, height: config.height))
        image.lockFocus()

        bg.setFill()
        NSRect(x: 0, y: 0, width: config.width, height: config.height).fill()

        let panelRect = NSRect(
            x: config.margin,
            y: config.margin,
            width: Double(config.width) - config.margin * 2,
            height: Double(config.height) - config.margin * 2
        )
        drawRoundedRect(panelRect, radius: 16, fill: panel)

        let titleRect = NSRect(
            x: panelRect.minX,
            y: panelRect.maxY - config.titleHeight,
            width: panelRect.width,
            height: config.titleHeight
        )
        titleBar.setFill()
        NSBezierPath(roundedRect: titleRect, xRadius: 16, yRadius: 16).fill()
        titleBar.setFill()
        NSRect(x: titleRect.minX, y: titleRect.minY, width: titleRect.width, height: 18).fill()

        let dots: [(Double, UInt32)] = [(0, 0xff5f57), (22, 0xffbd2e), (44, 0x28c840)]
        for (offset, dotColor) in dots {
            color(dotColor).setFill()
            NSBezierPath(ovalIn: NSRect(x: panelRect.minX + 20 + offset, y: titleRect.midY - 6, width: 12, height: 12)).fill()
        }

        let title = "Casper RWA Oracle Agent — automated demo"
        title.draw(
            at: NSPoint(x: panelRect.minX + 94, y: titleRect.midY - 11),
            withAttributes: [.font: titleFont, .foregroundColor: white]
        )

        let contentTop = titleRect.minY - 22
        let contentBottom = panelRect.minY + 54
        let maxVisible = Int((contentTop - contentBottom) / config.lineHeight)
        let start = max(0, visibleCount - maxVisible)
        let visible = Array(transcriptLines[start..<min(visibleCount, transcriptLines.count)])

        for (row, line) in visible.enumerated() {
            let y = contentTop - Double(row + 1) * config.lineHeight
            let point = NSPoint(x: panelRect.minX + 28, y: y)
            line.draw(at: point, withAttributes: attributes(for: line))
        }

        let progress = min(1.0, Double(index) / Double(max(totalFrames - 1, 1)))
        let progressRect = NSRect(x: panelRect.minX + 28, y: panelRect.minY + 24, width: panelRect.width - 56, height: 8)
        drawRoundedRect(progressRect, radius: 4, fill: color(0x26354c))
        drawRoundedRect(NSRect(x: progressRect.minX, y: progressRect.minY, width: progressRect.width * progress, height: progressRect.height), radius: 4, fill: cyan)

        let footer = String(format: "Frame %04d • %.0fs • Testnet proof included", index, Double(index) / Double(config.fps))
        footer.draw(
            at: NSPoint(x: panelRect.minX + 28, y: panelRect.minY + 35),
            withAttributes: [.font: NSFont.monospacedSystemFont(ofSize: 12, weight: .regular), .foregroundColor: muted]
        )

        image.unlockFocus()

        guard
            let tiff = image.tiffRepresentation,
            let bitmap = NSBitmapImageRep(data: tiff),
            let png = bitmap.representation(using: .png, properties: [:])
        else {
            fatalError("Could not render frame")
        }

        let frameName = String(format: "frame_%05d.png", index)
        try! png.write(to: framesURL.appendingPathComponent(frameName))
    }
}

for frame in 0..<totalFrames {
    let seconds = Double(frame) / Double(config.fps)
    let visible = min(transcriptLines.count, max(1, Int(floor(seconds / revealInterval)) + 1))
    try writeFrame(index: frame, visibleCount: visible)
    if frame % 50 == 0 {
        print("rendered frame \(frame)/\(totalFrames)")
    }
}

print("Rendered \(totalFrames) frames from \(transcriptLines.count) transcript lines.")
