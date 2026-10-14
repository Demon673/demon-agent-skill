#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// Original chimes from @demon673/dsh-doorbell, MIT, Copyright (c) 2026 Demon673.
const motifs = {
  done: [[659.25, 0, 0.2], [880, 0.13, 0.32]],
  "needs-input": [[659.25, 0, 0.15], [783.99, 0.21, 0.25]],
  approval: [[523.25, 0, 0.12], [659.25, 0.14, 0.12], [783.99, 0.28, 0.25]],
  blocked: [[587.33, 0, 0.22], [440, 0.27, 0.3]],
  failed: [[440, 0, 0.17], [349.23, 0.2, 0.32]],
};

function wav(reason, rate = 44100) {
  const notes = motifs[reason];
  const samples = new Float32Array(Math.ceil(Math.max(...notes.map(([, start, duration]) => start + duration)) * rate));
  for (const [frequency, start, duration] of notes) {
    for (let i = 0; i < Math.floor(duration * rate); i += 1) {
      const t = i / rate;
      const envelope = Math.min(t / 0.012, 1) * Math.exp(-7 * t / duration) * Math.min((duration - t) / 0.035, 1);
      const phase = 2 * Math.PI * frequency * t;
      samples[Math.floor(start * rate) + i] += 0.24 * envelope * (Math.sin(phase) + 0.18 * Math.sin(phase * 2) + 0.06 * Math.sin(phase * 3));
    }
  }
  const result = Buffer.alloc(44 + samples.length * 2);
  result.write("RIFF", 0);
  result.writeUInt32LE(result.length - 8, 4);
  result.write("WAVEfmt ", 8);
  result.writeUInt32LE(16, 16);
  result.writeUInt16LE(1, 20);
  result.writeUInt16LE(1, 22);
  result.writeUInt32LE(rate, 24);
  result.writeUInt32LE(rate * 2, 28);
  result.writeUInt16LE(2, 32);
  result.writeUInt16LE(16, 34);
  result.write("data", 36);
  result.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i += 1) {
    result.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  return result;
}

module.exports = { motifs, wav };

if (require.main === module) {
  const target = path.join(__dirname, "..", "assets");
  fs.mkdirSync(target, { recursive: true });
  for (const reason of Object.keys(motifs)) fs.writeFileSync(path.join(target, `${reason}.wav`), wav(reason));
  console.log(`Generated ${Object.keys(motifs).length} event chimes.`);
}
