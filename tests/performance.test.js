import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';
import chalk from 'chalk';

// Конфигурация тестов
const CONFIG = {
  appUrl: 'http://localhost:3000',
  iterations: 5,
  outputFile: 'reports/performance-results.csv',
  tests: [
    { name: 'cold-start', selector: '.btn.cold', reset: true },
    { name: 'warm-start', selector: '.btn.warm', reset: false },
    { name: 'sign-transaction', selector: '.btn.sign', reset: false }
  ],
  implementations: [
    { name: 'ethers', tabText: 'Ethers.js' },
    { name: 'viem', tabText: 'Viem' }
  ]
};

async function runPerformanceTests() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Мокаем window.ethereum для автотестов
  await page.evaluateOnNewDocument(() => {
    window.ethereum = {
      isMetaMask: true,
      request: async ({ method, params }) => {
        if (method === 'eth_requestAccounts') {
          return ['0x1111111111111111111111111111111111111111'];
        }
        if (method === 'personal_sign' || method === 'eth_sign' || method === 'eth_signTypedData_v4') {
          return '0x' + 'a'.repeat(130);
        }
        if (method === 'eth_chainId') {
          return '0x1';
        }
        if (method === 'eth_accounts') {
          return ['0x1111111111111111111111111111111111111111'];
        }
        return null;
      },
      on: () => {},
      removeListener: () => {},
    };
  });
  
  // Результаты будут храниться здесь
  const results = [];
  
  console.log(chalk.blue('🚀 Запуск тестов производительности...'));
  
  await page.goto(CONFIG.appUrl);
  await page.setViewport({ width: 1200, height: 800 });
  
  for (const impl of CONFIG.implementations) {
    // Переключаемся на нужную вкладку по тексту кнопки
    await page.evaluate((tabText) => {
      const buttons = Array.from(document.querySelectorAll('button.tab'));
      const btn = buttons.find(b => b.textContent?.trim() === tabText);
      if (btn) btn.click();
    }, impl.tabText);
    await new Promise(r => setTimeout(r, 500)); // Ждём, чтобы вкладка прогрузилась

    for (const test of CONFIG.tests) {
      console.log(chalk.yellow(`\n🔍 [${impl.name}] Выполнение теста: ${test.name}`));
      
      for (let i = 0; i < CONFIG.iterations; i++) {
        if (test.reset) {
          await page.click('.reset-btn');
          await new Promise(r => setTimeout(r, 500));
        }
        
        const startTime = Date.now();
        await page.click(test.selector);
        
        // Ожидание завершения операции
        await page.waitForFunction(
          selector => !document.querySelector(selector)?.disabled,
          {},
          test.selector
        );
        
        const duration = Date.now() - startTime;
        
        // Получение метрик
        const metrics = await page.evaluate(() => {
          const memory = performance.memory;
          return {
            jsHeapSize: memory?.jsHeapSizeLimit || 0,
            usedHeap: memory?.usedJSHeapSize || 0
          };
        });
        
        // Сохранение результатов
        results.push({
          implementation: impl.name,
          test: test.name,
          iteration: i + 1,
          duration,
          jsHeapSize: metrics.jsHeapSize,
          usedHeap: metrics.usedHeap,
          timestamp: new Date().toISOString()
        });
        
        console.log(chalk.gray(`  Итерация ${i + 1}: ${duration}мс`));
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  
  await browser.close();
  
  // Сохранение в CSV
  const csvWriter = createObjectCsvWriter({
    path: CONFIG.outputFile,
    header: [
      { id: 'implementation', title: 'IMPL' },
      { id: 'test', title: 'TEST' },
      { id: 'iteration', title: 'ITERATION' },
      { id: 'duration', title: 'DURATION_MS' },
      { id: 'jsHeapSize', title: 'JS_HEAP_SIZE' },
      { id: 'usedHeap', title: 'USED_HEAP' },
      { id: 'timestamp', title: 'TIMESTAMP' }
    ]
  });
  
  await csvWriter.writeRecords(results);
  console.log(chalk.green(`\n✅ Результаты сохранены в ${CONFIG.outputFile}`));
  
  // Генерация отчета
  generateSummaryReport(results);
}

function generateSummaryReport(results) {
  // Группируем по реализации
  const byImpl = {};
  results.forEach(row => {
    if (!byImpl[row.implementation]) byImpl[row.implementation] = [];
    byImpl[row.implementation].push(row);
  });

  for (const impl in byImpl) {
    const summary = {};
    byImpl[impl].forEach(row => {
      if (!summary[row.test]) {
        summary[row.test] = {
          values: [],
          min: Infinity,
          max: -Infinity,
          sum: 0
        };
      }
      summary[row.test].values.push(row.duration);
      summary[row.test].min = Math.min(summary[row.test].min, row.duration);
      summary[row.test].max = Math.max(summary[row.test].max, row.duration);
      summary[row.test].sum += row.duration;
    });

    console.log(chalk.blue(`\n📊 Сводка результатов для реализации: ${impl}`));
    console.log(chalk.blue('========================================'));
    for (const test in summary) {
      const avg = summary[test].sum / summary[test].values.length;
      const stdDev = Math.sqrt(
        summary[test].values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        summary[test].values.length
      );
      console.log(chalk.cyan(`🧪 Тест: ${test.toUpperCase()}`));
      console.log(`  Среднее: ${chalk.bold(avg.toFixed(2))}мс`);
      console.log(`  Минимум: ${chalk.bold(summary[test].min)}мс`);
      console.log(`  Максимум: ${chalk.bold(summary[test].max)}мс`);
      console.log(`  Стандартное отклонение: ${chalk.bold(stdDev.toFixed(2))}мс`);
      console.log(chalk.blue('----------------------------------------'));
    }
  }
}

runPerformanceTests();