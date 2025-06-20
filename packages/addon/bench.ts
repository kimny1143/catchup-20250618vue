import { performance } from 'node:perf_hooks';
import { checkConflict } from './index';
import fs from 'node:fs';

const ITER = 100;             // ループ回数
const N    = 1_000;           // スロット件数
const results: number[] = [];

// ランダムなスロットデータを生成
function genRandomSlots(n: number): Array<{ time: string }> {
  const baseTime = new Date('2025-06-19T10:00:00Z');
  const slots = [];
  
  for (let i = 0; i < n; i++) {
    // 8:00 ~ 20:00 の範囲でランダムな時刻を生成
    const hours = 8 + Math.floor(Math.random() * 12);
    const minutes = Math.floor(Math.random() * 60);
    const time = new Date(baseTime);
    time.setHours(hours, minutes, 0, 0);
    
    slots.push({
      time: time.toISOString().slice(0, 16).replace('T', ' ')
    });
  }
  
  // 時刻順にソート（バイナリサーチのため）
  return slots.sort((a, b) => a.time.localeCompare(b.time));
}

console.log(`Starting C++ addon benchmark (${N} slots × ${ITER} iterations)...`);

// ウォームアップ
for (let i = 0; i < 10; i++) {
  const slots = genRandomSlots(N);
  checkConflict(slots, '2025-06-19 12:30');
}

// 本計測
for (let i = 0; i < ITER; i++) {
  const slots = genRandomSlots(N);
  const testTime = '2025-06-19 12:30';
  
  const t0 = performance.now();
  const result = checkConflict(slots, testTime);
  const t1 = performance.now();
  
  const elapsed = t1 - t0;
  results.push(elapsed);
  
  if (i % 20 === 0) {
    process.stdout.write(`.`);
  }
}
console.log('\n');

// 統計計算
results.sort((a, b) => a - b);
const p50 = results[Math.floor(results.length * 0.50)];
const p90 = results[Math.floor(results.length * 0.90)];
const p95 = results[Math.floor(results.length * 0.95)];
const p99 = results[Math.floor(results.length * 0.99)];
const avg = results.reduce((a, b) => a + b, 0) / results.length;
const min = results[0];
const max = results[results.length - 1];

console.log(`=== Benchmark Results ===`);
console.log(`Slots: ${N}`);
console.log(`Iterations: ${ITER}`);
console.log(`Min: ${min.toFixed(3)} ms`);
console.log(`Max: ${max.toFixed(3)} ms`);
console.log(`Avg: ${avg.toFixed(3)} ms`);
console.log(`P50: ${p50.toFixed(3)} ms`);
console.log(`P90: ${p90.toFixed(3)} ms`);
console.log(`P95: ${p95.toFixed(3)} ms`);
console.log(`P99: ${p99.toFixed(3)} ms`);

// CSV出力
const csvHeader = 'iteration,elapsed_ms';
const csvData = results.map((val, idx) => `${idx},${val}`).join('\n');
const csvStats = `\n\nStats\nP50,${p50}\nP90,${p90}\nP95,${p95}\nP99,${p99}\nAvg,${avg}\nMin,${min}\nMax,${max}`;

fs.writeFileSync('bench_result.csv', csvHeader + '\n' + csvData + csvStats);
console.log('\nResults saved to bench_result.csv');