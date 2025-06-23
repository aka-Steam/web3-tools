import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PerformanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/metrics/results');
        const csvText = await response.text();
        
        const data = csvText.split('\n')
          .slice(1)
          .filter(row => row.trim())
          .map(row => {
            const [test, iteration, duration, jsHeapSize, usedHeap, timestamp] = row.split(',');
            return {
              test,
              iteration: parseInt(iteration),
              duration: parseInt(duration),
              jsHeapSize: parseInt(jsHeapSize),
              usedHeap: parseInt(usedHeap),
              timestamp
            };
          });
        
        setReportData(data);
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) return <div>Загрузка отчета...</div>;
  
  // Группировка данных для графика
  const chartData = Object.entries(
    reportData.reduce((acc, item) => {
      if (!acc[item.test]) acc[item.test] = { test: item.test, values: [] };
      acc[item.test].values.push(item.duration);
      return acc;
    }, {})
  ).map(([test, data]) => {
    const values = data.values;
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return { test, avg, min: Math.min(...values), max: Math.max(...values) };
  });

  return (
    <div className="performance-report">
      <h2>Отчет о производительности</h2>
      
      <BarChart width={600} height={400} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="test" />
        <YAxis label={{ value: 'Время (мс)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="avg" name="Среднее время" fill="#8884d8" />
        <Bar dataKey="min" name="Минимальное время" fill="#82ca9d" />
        <Bar dataKey="max" name="Максимальное время" fill="#ff8042" />
      </BarChart>
      
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

export default PerformanceReport;