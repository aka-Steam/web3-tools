import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// @ts-nocheck

const PerformanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [isAddressData, setIsAddressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingIsAddress, setIsLoadingIsAddress] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/reports/performance-results.csv');
        // const response = await fetch('/api/metrics/results');
        const csvText = await response.text();
        const data = csvText.split('\n')
          .slice(1)
          .filter(row => row.trim())
          .map(row => {
            const [IMPL, TEST, ITERATION, DURATION_MS, JS_HEAP_SIZE, USED_HEAP, TIMESTAMP] = row.split(',');
            return {
              impl: IMPL,
              test: TEST,
              iteration: parseInt(ITERATION),
              duration: parseInt(DURATION_MS),
              jsHeapSize: parseInt(JS_HEAP_SIZE),
              usedHeap: parseInt(USED_HEAP),
              timestamp: TIMESTAMP
            };
          })
          .filter(row => !isNaN(row.duration) && row.impl && row.test);
        setReportData(data);
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchIsAddressData = async () => {
      try {
        const response = await fetch('/reports/isAddress-benchmark.csv');
        const csvText = await response.text();
        const data = csvText.split('\n')
          .slice(1)
          .filter(row => row.trim())
          .map(row => {
            const [mode, implementation, duration] = row.split(',');
            return {
              mode,
              implementation,
              duration: parseFloat(duration)
            };
          })
          .filter(row => !isNaN(row.duration) && row.implementation && row.mode);
        setIsAddressData(data);
      } catch (error) {
        console.error('Error loading isAddress benchmark:', error);
      } finally {
        setIsLoadingIsAddress(false);
      }
    };
    fetchIsAddressData();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setRunError(null);
    try {
      const res = await fetch('/api/metrics/run-tests', { method: 'POST' });
      if (!res.ok) throw new Error('Ошибка запуска тестов');
      await res.json();
      // После завершения тестов обновляем данные
      await fetchData();
    } catch (e) {
      setRunError(e.message);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) return <div>Загрузка отчета...</div>;
  
  // Группировка данных для графика: [{ test, ethers, viem }]
  const tests = Array.from(new Set(reportData.map(row => row.test)));
  const impls = Array.from(new Set(reportData.map(row => row.impl)));
  const chartData = tests.map(test => {
    const entry = { test };
    impls.forEach(impl => {
      const values = reportData.filter(row => row.test === test && row.impl === impl).map(row => row.duration);
      entry[impl] = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
    });
    return entry;
  });

  // График для isAddress
  let isAddressChartData = [];
  if (!isLoadingIsAddress && isAddressData.length) {
    // Группируем по mode
    const grouped = {};
    isAddressData.forEach(row => {
      if (!grouped[row.mode]) grouped[row.mode] = {};
      grouped[row.mode][row.implementation] = row.duration;
    });
    isAddressChartData = Object.entries(grouped).map(([mode, impls]) => ({ mode, ...impls }));
  }

  return (
    <div className="performance-report">
      <h2>Отчет о производительности</h2>
      {/* <button onClick={runTests} disabled={isRunning} style={{marginBottom: 16}}>
        {isRunning ? 'Тесты выполняются...' : 'Запустить тесты'}
      </button> */}
      {runError && <div style={{color: 'red'}}>Ошибка: {runError}</div>}
      <BarChart width={700} height={400} data={chartData} style={{marginBottom: 24}}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="test" />
        <YAxis label={{ value: 'Время (мс)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        {impls.map(impl => (
          <Bar key={impl} dataKey={impl} name={impl} fill={impl === 'ethers' ? '#8884d8' : '#82ca9d'} />
        ))}
      </BarChart>

      {/* Новый график для isAddress */}
      <h3>Сравнение производительности isAddress (100 000 итераций)</h3>
      {isLoadingIsAddress ? (
        <div>Загрузка данных isAddress...</div>
      ) : (
        <BarChart width={600} height={300} data={isAddressChartData} style={{marginBottom: 24}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mode" />
          <YAxis label={{ value: 'Время (мс)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="ethers" name="ethers" fill="#8884d8" />
          <Bar dataKey="viem" name="viem" fill="#82ca9d" />
        </BarChart>
      )}

      <div className="download-section">
        <a 
          href="/api/metrics/results" 
          download="performance-report.csv"
          className="download-btn"
        >
          Скачать полный отчет (CSV)
        </a>
      </div>
    </div>
  );
};

// @ts-ignore
export default PerformanceReport;