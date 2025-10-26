import React, { useState, useEffect } from 'react';
import { ChartBarIcon, CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface Report {
  _id: string;
  property: string;
  date: string;
  detections: number;
  deterrents: number;
  accuracy: number;
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      // Mock data for now - replace with actual API call
      setReports([
        { _id: '1', property: 'Property A', date: '2024-01-15', detections: 45, deterrents: 38, accuracy: 84.4 },
        { _id: '2', property: 'Property B', date: '2024-01-14', detections: 32, deterrents: 28, accuracy: 87.5 },
        { _id: '3', property: 'Property C', date: '2024-01-13', detections: 58, deterrents: 52, accuracy: 89.7 },
        { _id: '4', property: 'Property A', date: '2024-01-12', detections: 41, deterrents: 35, accuracy: 85.4 },
        { _id: '5', property: 'Property B', date: '2024-01-11', detections: 29, deterrents: 25, accuracy: 86.2 },
      ]);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Convert reports to a flat array for xlsx
    const rows = reports.map(r => ({
      Property: r.property,
      Date: r.date,
      Detections: r.detections,
      Deterrents: r.deterrents,
      Accuracy: r.accuracy / 100 // store as fraction for Excel percentage format
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    // Set column formats: percentage for Accuracy
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    // Assuming headers in first row; Accuracy is column E (0-indexed: 4)
    for (let R = 1; R <= range.e.r; R++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: 4 });
      const cell = worksheet[cellRef];
      if (cell && typeof cell.v === 'number') {
        cell.t = 'n';
        cell.z = '0.0%';
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'Deterrent Reports');
    XLSX.writeFile(wb, `deterrent_report_${dateRange.start}_to_${dateRange.end}.xlsx`);
  };

  const totalDetections = reports.reduce((sum, r) => sum + r.detections, 0);
  const totalDeterrents = reports.reduce((sum, r) => sum + r.deterrents, 0);
  const avgAccuracy = reports.length > 0 ? reports.reduce((sum, r) => sum + r.accuracy, 0) / reports.length : 0;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Deterrent Reports</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Detections</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDetections}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Deterrents Activated</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDeterrents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Accuracy</p>
              <p className="text-2xl font-semibold text-gray-900">{avgAccuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deterrents</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.property}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.detections}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.deterrents}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    report.accuracy >= 85 ? 'bg-green-100 text-green-800' :
                    report.accuracy >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.accuracy}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;

