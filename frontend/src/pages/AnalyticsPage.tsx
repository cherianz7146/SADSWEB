import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';

interface Detection {
	_id: string;
	label: string;
	probability: number;
	source: string;
	detectedAt: string;
}

const AnalyticsPage: React.FC = () => {
	const [data, setData] = useState<Detection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const resp = await apiFetch<Detection[]>('/api/detections?limit=500');
				setData(resp.data);
			} catch (e: any) {
				setError(e.message || 'Failed to load detections');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const counts = useMemo(() => {
		const m = new Map<string, number>();
		for (const d of data) m.set(d.label, (m.get(d.label) || 0) + 1);
		return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
	}, [data]);

	if (loading) return <div className="p-6">Loading...</div>;
	if (error) return <div className="p-6 text-red-600">{error}</div>;

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Analytics</h1>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl border border-gray-200 p-4">
					<h2 className="font-semibold mb-3">Detections by Label</h2>
					<ul className="space-y-2">
						{counts.map(([label, count]) => (
							<li key={label} className="flex justify-between text-sm">
								<span className="capitalize">{label}</span>
								<span className="font-medium">{count}</span>
							</li>
						))}
					</ul>
				</div>
				<div className="bg-white rounded-xl border border-gray-200 p-4">
					<h2 className="font-semibold mb-3">Recent</h2>
					<div className="space-y-2 max-h-64 overflow-auto">
						{data.slice(0, 20).map(d => (
							<div key={d._id} className="flex justify-between text-sm border-b py-1">
								<span className="capitalize">{d.label}</span>
								<span>{new Date(d.detectedAt).toLocaleString()}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsPage;

























