// src/api/metrics.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const router = express.Router();
const resultsPath = path.join(__dirname, 'performance-results.csv');

// Получение результатов тестов
router.get('/results', (req, res) => {
  if (!fs.existsSync(resultsPath)) {
    return res.status(404).json({ error: 'Results not found' });
  }
  
  const csvData = fs.readFileSync(resultsPath, 'utf-8');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=performance-results.csv');
  res.send(csvData);
});

// Сохранение результатов
router.post('/results', (req, res) => {
  const newData = req.body;
  
  try {
    let csvContent = '';
    
    if (!fs.existsSync(resultsPath)) {
      csvContent = 'TEST,ITERATION,DURATION_MS,JS_HEAP_SIZE,USED_HEAP,TIMESTAMP\n';
    }
    
    csvContent += Object.values(newData).join(',') + '\n';
    fs.appendFileSync(resultsPath, csvContent);
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save results' });
  }
});

// Новый эндпоинт для запуска тестов
router.post('/run-tests', (req, res) => {
  exec('node tests/performance.test.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

export default router;