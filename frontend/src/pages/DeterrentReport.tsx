import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';
import BackButton from '../components/BackButton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Detection {
  _id: string;
  label: string;
  probability: number;
  location?: string;
  propertyName?: string;
  source?: string;
  detectedAt: string;
  createdAt: string;
  userId?: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

const DeterrentReport: React.FC = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDetections();
  }, [dateRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchDetections();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, dateRange]);

  const fetchDetections = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: Detection[] }>('/api/detections?limit=1000');
      const allDetections = response.data.data || [];
      
      // Filter by date range
      const filtered = allDetections.filter(d => {
        const detectionDate = new Date(d.detectedAt).toISOString().split('T')[0];
        return detectionDate >= dateRange.startDate && detectionDate <= dateRange.endDate;
      });
      
      setDetections(filtered);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      setDetections([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalDetections: detections.length,
    highConfidence: detections.filter(d => d.probability >= 0.80).length,
    criticalAnimals: detections.filter(d => ['tiger', 'elephant', 'leopard'].includes(d.label.toLowerCase())).length,
    uniqueAnimals: [...new Set(detections.map(d => d.label.toLowerCase()))].length,
  };

  // Group by animal type
  const animalCounts = detections.reduce((acc, d) => {
    const animal = d.label.toLowerCase();
    acc[animal] = (acc[animal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topAnimals = Object.entries(animalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Group by date
  const dailyCounts = detections.reduce((acc, d) => {
    const date = new Date(d.detectedAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dailyTrends = Object.entries(dailyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-10); // Last 10 days

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('Wildlife Detection Report', 14, 20);
    
    // Date Range
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(`Report Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Summary Statistics', 14, 45);
    
    const summaryData = [
      ['Total Detections', stats.totalDetections.toString()],
      ['High Confidence (>=80%)', stats.highConfidence.toString()],
      ['Critical Animals', stats.criticalAnimals.toString()],
      ['Unique Animals', stats.uniqueAnimals.toString()],
    ];
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    });
    
    // Detections by Animal Type
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Detections by Animal Type', 14, 20);
    
    const animalData = topAnimals.map(([animal, count]) => [
      animal.charAt(0).toUpperCase() + animal.slice(1),
      count.toString(),
      `${((count / stats.totalDetections) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: 25,
      head: [['Animal', 'Count', 'Percentage']],
      body: animalData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    // Detailed Detections Table - ALL DETECTIONS
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text('Detailed Detections Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Total: ${detections.length} detection(s) in selected period`, 14, 27);
    
    // Map ALL detections with clear date/time separation
    const detectionData = detections.map(d => {
      const detectedDate = new Date(d.detectedAt);
      return [
        d.userId?.userId || 'N/A',
        d.label.charAt(0).toUpperCase() + d.label.slice(1),
        `${(d.probability * 100).toFixed(1)}%`,
        detectedDate.toLocaleDateString(),
        detectedDate.toLocaleTimeString(),
        d.propertyName || 'N/A',
        d.source === 'browser-camera' || d.source === 'webcam' ? 'Live Camera' : 'Upload'
      ];
    });
    
    autoTable(doc, {
      startY: 33,
      head: [['User ID', 'Animal Name', 'Confidence', 'Date', 'Time', 'Property', 'Source']],
      body: detectionData,
      theme: 'striped',
      headStyles: { 
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 20 }, // User ID
        1: { cellWidth: 30 }, // Animal Name
        2: { cellWidth: 22 }, // Confidence
        3: { cellWidth: 25 }, // Date
        4: { cellWidth: 25 }, // Time
        5: { cellWidth: 30 }, // Property
        6: { cellWidth: 20 }  // Source
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 33, bottom: 20 }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${i} of ${pageCount} | SADS - Smart Animal Deterrent System`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    doc.save(`Wildlife_Detection_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`);
  };

  // Export to Excel
  const exportToExcel = () => {
    // Summary Sheet
    const summaryData = [
      ['Wildlife Detection Report', ''],
      ['Report Period', `${dateRange.startDate} to ${dateRange.endDate}`],
      ['Generated', new Date().toLocaleString()],
      ['', ''],
      ['Summary Statistics', ''],
      ['Total Detections', stats.totalDetections],
      ['High Confidence (>=80%)', stats.highConfidence],
      ['Critical Animals', stats.criticalAnimals],
      ['Unique Animals', stats.uniqueAnimals],
      ['', ''],
      ['Top 5 Animals', 'Count', 'Percentage'],
      ...topAnimals.map(([animal, count]) => [
        animal.charAt(0).toUpperCase() + animal.slice(1),
        count,
        `${((count / stats.totalDetections) * 100).toFixed(1)}%`
      ])
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Detections Sheet with separate Date and Time columns
    const detectionData = detections.map(d => {
      const detectedDate = new Date(d.detectedAt);
      const createdDate = new Date(d.createdAt);
      return {
        'User ID': d.userId?.userId || 'N/A',
        'User Name': d.userId?.name || 'N/A',
        'Animal Name': d.label.charAt(0).toUpperCase() + d.label.slice(1),
        'Confidence %': (d.probability * 100).toFixed(1),
        'Detection Date': detectedDate.toLocaleDateString(),
        'Detection Time': detectedDate.toLocaleTimeString(),
        'Property': d.propertyName || 'N/A',
        'Location': d.location || 'N/A',
        'Source': d.source === 'browser-camera' || d.source === 'webcam' ? 'Live Camera' : 'Uploaded Image',
        'Created Date': createdDate.toLocaleDateString(),
        'Created Time': createdDate.toLocaleTimeString(),
      };
    });
    
    const detectionSheet = XLSX.utils.json_to_sheet(detectionData);
    
    // Daily Trends Sheet
    const trendsData = dailyTrends.map(([date, count]) => ({
      'Date': date,
      'Detections': count
    }));
    
    const trendsSheet = XLSX.utils.json_to_sheet(trendsData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(wb, detectionSheet, 'Detections');
    XLSX.utils.book_append_sheet(wb, trendsSheet, 'Daily Trends');
    
    // Save file
    XLSX.writeFile(wb, `Wildlife_Detection_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading detection report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <BackButton />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deterrent Report</h1>
            <p className="text-gray-600">Analysis of wildlife detection and deterrent effectiveness</p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
              {autoRefresh && <span className="ml-2 text-emerald-600">• Auto-refreshing every 30s</span>}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                autoRefresh
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowPathIcon className={`h-4 w-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            
            {/* Manual Refresh */}
            <button
              onClick={fetchDetections}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <ArrowPathIcon className="h-4 w-4 inline mr-2" />
              Refresh Now
            </button>
            
            {/* Export Buttons */}
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export PDF
            </button>
            
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 font-medium">Total Detections</p>
            <TableCellsIcon className="h-6 w-6 text-blue-100" />
          </div>
          <p className="text-4xl font-bold">{stats.totalDetections}</p>
          <p className="text-blue-100 text-sm mt-2">In selected period</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-100 font-medium">High Confidence</p>
            <ChartBarIcon className="h-6 w-6 text-emerald-100" />
          </div>
          <p className="text-4xl font-bold">{stats.highConfidence}</p>
          <p className="text-emerald-100 text-sm mt-2">≥80% accuracy</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-100 font-medium">Critical Animals</p>
            <ExclamationTriangleIcon className="h-6 w-6 text-red-100" />
          </div>
          <p className="text-4xl font-bold">{stats.criticalAnimals}</p>
          <p className="text-red-100 text-sm mt-2">Tigers, Elephants, Leopards</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100 font-medium">Unique Animals</p>
            <ChartBarIcon className="h-6 w-6 text-purple-100" />
          </div>
          <p className="text-4xl font-bold">{stats.uniqueAnimals}</p>
          <p className="text-purple-100 text-sm mt-2">Different species</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Animals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top 5 Animals Detected</h2>
          <div className="space-y-4">
            {topAnimals.map(([animal, count], index) => {
              const percentage = (count / stats.totalDetections) * 100;
              return (
                <div key={animal} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-indigo-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{animal}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Detection Trends</h2>
          <div className="space-y-3 max-h-80 overflow-auto">
            {dailyTrends.map(([date, count]) => (
              <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${(count / Math.max(...dailyTrends.map(([, c]) => c))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Detections Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detailed Detections</h2>
          <p className="text-sm text-gray-500 mt-1">Complete list of all wildlife detections in the selected period</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detected At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No detections found in the selected date range</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your date range or wait for new detections</p>
                  </td>
                </tr>
              ) : (
                detections.map((detection) => (
                  <tr key={detection._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center text-xs font-bold text-emerald-600 bg-emerald-100 rounded-full">
                          {detection.userId?.userId || 'N/A'}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900">{detection.userId?.userId || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {detection.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              detection.probability >= 0.9 ? 'bg-green-500' :
                              detection.probability >= 0.8 ? 'bg-blue-500' :
                              detection.probability >= 0.7 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${detection.probability * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {(detection.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detection.propertyName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detection.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        detection.source === 'browser-camera' || detection.source === 'webcam'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {detection.source === 'browser-camera' || detection.source === 'webcam' ? 'Live Camera' : 'Uploaded'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(detection.detectedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {detections.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{detections.length}</span> detection{detections.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeterrentReport;
