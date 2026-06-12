#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CASES = resolve(ROOT, "agent-backend/data/rwa-cases.json");
const DOCS = resolve(ROOT, "docs");

const COLORS = {
  ink: [15, 23, 42, 255],
  muted: [100, 116, 139, 255],
  grid: [226, 232, 240, 255],
  blue: [37, 99, 235, 255],
  green: [22, 163, 74, 255],
  orange: [234, 88, 12, 255],
  red: [220, 38, 38, 255],
  purple: [124, 58, 237, 255],
  white: [255, 255, 255, 255],
  panel: [248, 250, 252, 255],
};

const FONT = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "%": ["11001", "11010", "00100", "01000", "10110", "00110", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00100", "01000", "10000", "00000", "00000"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "11100"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
};

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
    this.fill(COLORS.white);
  }

  fill(color) {
    for (let i = 0; i < this.data.length; i += 4) {
      this.data.set(color, i);
    }
  }

  pixel(x, y, color) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
    this.data.set(color, (py * this.width + px) * 4);
  }

  rect(x, y, width, height, color) {
    for (let py = Math.max(0, Math.floor(y)); py < Math.min(this.height, Math.ceil(y + height)); py += 1) {
      for (let px = Math.max(0, Math.floor(x)); px < Math.min(this.width, Math.ceil(x + width)); px += 1) {
        this.pixel(px, py, color);
      }
    }
  }

  line(x0, y0, x1, y1, color) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      this.pixel(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, color);
    }
  }

  text(text, x, y, scale, color) {
    let cursor = x;
    for (const raw of text.toUpperCase()) {
      const glyph = FONT[raw] ?? FONT[" "];
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] === "1") {
            this.rect(cursor + col * scale, y + row * scale, scale, scale, color);
          }
        }
      }
      cursor += 6 * scale;
    }
  }

  save(path) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.width, 0);
    ihdr.writeUInt32BE(this.height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;

    const raw = Buffer.alloc((this.width * 4 + 1) * this.height);
    for (let y = 0; y < this.height; y += 1) {
      const rowStart = y * (this.width * 4 + 1);
      raw[rowStart] = 0;
      raw.set(this.data.slice(y * this.width * 4, (y + 1) * this.width * 4), rowStart + 1);
    }

    writeFileSync(path, Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(raw)),
      chunk("IEND", Buffer.alloc(0)),
    ]));
  }
}

function hashNumber(seed, min, max) {
  const digest = createHash("sha256").update(seed).digest();
  const value = digest.readUInt32BE(0) / 0xffffffff;
  return min + value * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function score(point) {
  const freshnessPenalty = point.stalenessMinutes > 60
    ? clamp((point.stalenessMinutes - 60) / 8, 0, 30)
    : 0;
  const volatilityPenalty = clamp(point.volatilityBps / 120, 0, 25);
  const range = Math.max(1, point.expectedMax - point.expectedMin);
  const distance = point.rawValue < point.expectedMin
    ? point.expectedMin - point.rawValue
    : point.rawValue > point.expectedMax
      ? point.rawValue - point.expectedMax
      : 0;
  const anomalyPenalty = distance === 0 ? 0 : clamp(25 + (distance / range) * 30, 25, 55);
  return Math.round(clamp(point.reliability * 100 - freshnessPenalty - volatilityPenalty - anomalyPenalty, 0, 100));
}

function buildCycles() {
  const cases = JSON.parse(readFileSync(CASES, "utf8"));
  return Array.from({ length: 24 }, (_, index) => {
    const base = cases[index % cases.length];
    const jitter = hashNumber(`${base.assetId}:${index}`, -0.08, 0.08);
    const volatilityShift = hashNumber(`volatility:${base.assetId}:${index}`, -80, 160);
    const stalenessShift = hashNumber(`staleness:${base.assetId}:${index}`, -8, 24);
    const point = {
      ...base,
      reliability: clamp(base.reliability + jitter, 0.35, 0.98),
      volatilityBps: Math.max(0, base.volatilityBps + volatilityShift),
      stalenessMinutes: Math.max(0, base.stalenessMinutes + stalenessShift),
    };
    const confidence = score(point);
    const x402 = confidence >= 50 && confidence <= 70;
    return {
      cycle: index + 1,
      assetType: base.sourceKind,
      confidence,
      x402,
      decision: confidence > 70 ? "publish" : x402 ? "x402" : "skip",
    };
  });
}

function chartBase(title) {
  const canvas = new Canvas(1200, 720);
  canvas.rect(0, 0, 1200, 720, COLORS.panel);
  canvas.text(title, 50, 40, 5, COLORS.ink);
  canvas.rect(90, 120, 1040, 480, COLORS.white);
  for (let i = 0; i <= 5; i += 1) {
    const y = 560 - i * 80;
    canvas.line(110, y, 1110, y, COLORS.grid);
  }
  canvas.line(110, 560, 1110, 560, COLORS.ink);
  canvas.line(110, 560, 110, 160, COLORS.ink);
  return canvas;
}

function confidenceDistribution(cycles) {
  const canvas = chartBase("CONFIDENCE DISTRIBUTION");
  const buckets = Array.from({ length: 10 }, (_, index) => ({
    label: `${index * 10}-${index * 10 + 9}`,
    count: 0,
  }));
  for (const cycle of cycles) {
    buckets[Math.min(9, Math.floor(cycle.confidence / 10))].count += 1;
  }
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);
  const barWidth = 78;
  buckets.forEach((bucket, index) => {
    const x = 145 + index * 95;
    const height = (bucket.count / max) * 340;
    canvas.rect(x, 560 - height, barWidth, height, COLORS.blue);
    canvas.text(String(bucket.count), x + 26, 535 - height, 3, COLORS.ink);
    canvas.text(String(index * 10), x + 12, 585, 2, COLORS.muted);
  });
  canvas.text("CONFIDENCE BUCKET", 430, 640, 3, COLORS.muted);
  canvas.save(resolve(DOCS, "confidence_distribution.png"));
}

function x402TriggerRate(cycles) {
  const canvas = chartBase("X402 TRIGGER RATE BY THRESHOLD");
  const points = [];
  for (let threshold = 40; threshold <= 90; threshold += 5) {
    const triggered = cycles.filter((cycle) => cycle.confidence >= 50 && cycle.confidence <= threshold).length;
    points.push({ threshold, rate: triggered / cycles.length });
  }
  points.forEach((point, index) => {
    const x = 130 + index * 90;
    const y = 560 - point.rate * 360;
    canvas.rect(x - 5, y - 5, 10, 10, COLORS.orange);
    if (index > 0) {
      const prev = points[index - 1];
      const px = 130 + (index - 1) * 90;
      const py = 560 - prev.rate * 360;
      canvas.line(px, py, x, y, COLORS.orange);
      canvas.line(px, py + 1, x, y + 1, COLORS.orange);
    }
    if (index % 2 === 0) {
      canvas.text(String(point.threshold), x - 12, 585, 2, COLORS.muted);
    }
  });
  canvas.text("THRESHOLD", 500, 640, 3, COLORS.muted);
  canvas.text("RATE", 35, 260, 3, COLORS.muted);
  canvas.save(resolve(DOCS, "x402_trigger_rate.png"));
}

function agentTimeline(cycles) {
  const canvas = chartBase("AGENT DECISION TIMELINE");
  const width = 1000 / cycles.length;
  cycles.forEach((cycle, index) => {
    const x = 112 + index * width;
    const y = 560 - cycle.confidence * 3.8;
    const color = cycle.decision === "publish"
      ? COLORS.green
      : cycle.decision === "x402"
        ? COLORS.orange
        : COLORS.red;
    canvas.rect(x, y, Math.max(12, width - 5), 560 - y, color);
  });
  canvas.line(110, 560 - 70 * 3.8, 1110, 560 - 70 * 3.8, COLORS.purple);
  canvas.line(110, 560 - 50 * 3.8, 1110, 560 - 50 * 3.8, COLORS.orange);
  canvas.text("PUBLISH", 850, 135, 3, COLORS.green);
  canvas.text("X402 BAND", 830, 315, 3, COLORS.orange);
  canvas.text("SKIP", 860, 505, 3, COLORS.red);
  canvas.text("CYCLE", 540, 640, 3, COLORS.muted);
  canvas.save(resolve(DOCS, "agent_timeline.png"));
}

const cycles = buildCycles();
confidenceDistribution(cycles);
x402TriggerRate(cycles);
agentTimeline(cycles);

console.log("Generated competition assets:");
console.log("- docs/confidence_distribution.png");
console.log("- docs/x402_trigger_rate.png");
console.log("- docs/agent_timeline.png");
