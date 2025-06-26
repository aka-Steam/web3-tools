import { isAddress as ethersIsAddress } from 'ethers/address';
import { isAddress as viemIsAddress } from 'viem';
import chalk from 'chalk';
import fs from 'fs';

function randomAddress() {
  // Генерирует случайный валидный адрес Ethereum
  const hex = [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return '0x' + hex;
}

async function runIsAddressBenchmark() {
  const ITERATIONS = 100_000;
  const testAddress = '0x1111111111111111111111111111111111111111';
  const invalidAddress = '0x123';
  const results = [];

  // --- 1. Тест с одинаковыми адресами (кеширование)
  console.log(chalk.blue('\n🚀 Benchmark: isAddress (100,000 одинаковых итераций)'));

  // Ethers.js (static)
  let start = process.hrtime.bigint();
  let validCount = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    if (ethersIsAddress(testAddress)) validCount++;
    if (ethersIsAddress(invalidAddress)) validCount--;
  }
  let durationEthers = Number(process.hrtime.bigint() - start) / 1_000_000;
  results.push({ mode: 'static', implementation: 'ethers', duration: durationEthers });
  console.log(chalk.yellow(`Ethers.js (static): ${durationEthers.toFixed(3)}мс, validCount: ${validCount}`));

  // Viem (static)
  start = process.hrtime.bigint();
  validCount = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    if (viemIsAddress(testAddress)) validCount++;
    if (viemIsAddress(invalidAddress)) validCount--;
  }
  let durationViem = Number(process.hrtime.bigint() - start) / 1_000_000;
  results.push({ mode: 'static', implementation: 'viem', duration: durationViem });
  console.log(chalk.yellow(`Viem (static): ${durationViem.toFixed(3)}мс, validCount: ${validCount}`));

  // --- 2. Тест со случайными адресами (без кеша)
  console.log(chalk.blue('\n🚀 Benchmark: isAddress (100,000 случайных адресов)'));
  // Подготовим массив случайных адресов
  const randomValid = Array.from({length: ITERATIONS}, () => randomAddress());
  const randomInvalid = Array.from({length: ITERATIONS}, () => '0x' + Math.random().toString(16).slice(2, 10));

  // Ethers.js (random)
  start = process.hrtime.bigint();
  validCount = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    if (ethersIsAddress(randomValid[i])) validCount++;
    if (ethersIsAddress(randomInvalid[i])) validCount--;
  }
  durationEthers = Number(process.hrtime.bigint() - start) / 1_000_000;
  results.push({ mode: 'random', implementation: 'ethers', duration: durationEthers });
  console.log(chalk.yellow(`Ethers.js (random): ${durationEthers.toFixed(3)}мс, validCount: ${validCount}`));

  // Viem (random)
  start = process.hrtime.bigint();
  validCount = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    if (viemIsAddress(randomValid[i])) validCount++;
    if (viemIsAddress(randomInvalid[i])) validCount--;
  }
  durationViem = Number(process.hrtime.bigint() - start) / 1_000_000;
  results.push({ mode: 'random', implementation: 'viem', duration: durationViem });
  console.log(chalk.yellow(`Viem (random): ${durationViem.toFixed(3)}мс, validCount: ${validCount}`));

  // Save to CSV
  const csv = 'mode,implementation,duration_ms\n' + results.map(r => `${r.mode},${r.implementation},${r.duration}`).join('\n');
  fs.writeFileSync('reports/isAddress-benchmark.csv', csv);
  console.log(chalk.green('Результаты isAddress-бенчмарка сохранены в reports/isAddress-benchmark.csv'));
}

runIsAddressBenchmark();
