import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
	CameraIcon, 
	ShieldCheckIcon, 
	BellIcon, 
	ChartBarIcon,
	Cog6ToothIcon,
	ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Detector, { type DetectionEvent } from '../components/Detector';
import DeterrentSimulator from '../components/DeterrentSimulator';
import UserSidebar from '../components/UserSidebar';
import { apiFetch } from '../utils/api';

const Dashboard: React.FC = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	const [enabled, setEnabled] = useState(false);
	const [lastDetection, setLastDetection] = useState<DetectionEvent | null>(null);
	const [log, setLog] = useState<DetectionEvent[]>([]);
	const [targets, setTargets] = useState(['squirrel', 'raccoon', 'deer']);

	const isTarget = useMemo(() => (label: string) => targets.includes(label), [targets]);

	const stats = [
		{
			label: 'Animals Detected Today',
			value: String(log.length),
			icon: CameraIcon,
			color: 'text-emerald-600 bg-emerald-100'
		},
		{
			label: 'System Status',
			value: enabled ? 'Active' : 'Idle',
			icon: ShieldCheckIcon,
			color: enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
		},
		{
			label: 'Alerts Sent',
			value: String(log.filter(e => isTarget(e.label) && e.probability >= 0.6).length),
			icon: BellIcon,
			color: 'text-blue-600 bg-blue-100'
		},
		{
			label: 'Deterrent Success Rate',
			value: '92%',
			icon: ChartBarIcon,
			color: 'text-purple-600 bg-purple-100'
		}
	];

	const handleDetection = async (event: DetectionEvent) => {
		setLastDetection(event);
		setLog(prev => [{ ...event }, ...prev].slice(0, 50));
		try {
			if (user) {
				await apiFetch('/api/detections', { method: 'POST', body: { label: event.label, probability: event.probability, source: event.source, detectedAt: event.at } });
			}
		} catch {}
	};

	return (
		<div className="flex min-h-screen bg-gray-50">
			<UserSidebar />
			
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<header className="bg-white shadow-sm border-b border-gray-200">
					<div className="px-6 py-4">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-semibold text-gray-900">Manager Dashboard</h1>
								<p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
							</div>

							<div className="flex items-center space-x-4">
								<button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
									<BellIcon className="h-6 w-6" />
								</button>
								<button 
									onClick={handleLogout}
									className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
								>
									<ArrowRightOnRectangleIcon className="h-5 w-5" />
									<span>Logout</span>
								</button>
								{user?.avatar && (
									<img 
										src={user.avatar} 
										alt={user.name} 
										className="h-8 w-8 rounded-full"
									/>
								)}
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="flex-1 p-6">
				{/* Stats Grid */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
				>
					{stats.map((stat, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
									<p className="text-2xl font-bold text-gray-900">{stat.value}</p>
								</div>
								<div className={`p-3 rounded-xl ${stat.color}`}>
									<stat.icon className="h-6 w-6" />
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>

				<div className="grid lg:grid-cols-2 gap-8">
					{/* Live Camera Feed + Detector */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-gray-900">Live Camera Feed</h2>
							<span className={`px-3 py-1 rounded-full text-sm font-medium ${enabled ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
								{enabled ? '● LIVE' : 'IDLE'}
							</span>
						</div>

						<Detector enabled={enabled} onDetection={handleDetection} />

						<div className="mt-4 flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<label className="inline-flex items-center cursor-pointer">
									<input type="checkbox" className="sr-only peer" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:ml-1 after:mt-1 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all relative"></div>
									<span className="ml-3 text-sm text-gray-700">Enable Detection</span>
								</label>
							</div>

							<div className="text-sm text-gray-600">
								{lastDetection ? (
									<span>Last: {lastDetection.label} ({(lastDetection.probability * 100).toFixed(1)}%)</span>
								) : (
									<span>No detections yet</span>
								)}
							</div>
						</div>
					</motion.div>

					{/* Recent Activity + Simulator */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
					>
						<h2 className="text-xl font-semibold text-gray-900 mb-6">Deterrent Simulator</h2>

						<DeterrentSimulator active={enabled} lastDetection={lastDetection} isTarget={isTarget} />

						<h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Recent Activity</h3>
						<div className="space-y-3 max-h-64 overflow-auto pr-2">
							{log.length === 0 && <div className="text-sm text-gray-500">No events yet</div>}
							{log.map((activity, index) => (
								<div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
									<div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${isTarget(activity.label) ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 capitalize">{activity.label}</p>
										<p className="text-xs text-gray-500">{new Date(activity.at).toLocaleTimeString()} • {(activity.probability * 100).toFixed(1)}%</p>
									</div>
								</div>
							))}
						</div>
					</motion.div>
				</div>

				{/* Detection Reports Table */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
				>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">Detection Reports</h2>
						<button 
							onClick={() => navigate('/dashboard/reports')}
							className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
						>
							View All →
						</button>
					</div>
					
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{log.slice(0, 5).map((detection, index) => (
									<tr key={index} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(detection.at).toLocaleTimeString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
											{detection.label}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
												detection.probability >= 0.8 ? 'bg-green-100 text-green-800' :
												detection.probability >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
												'bg-red-100 text-red-800'
											}`}>
												{(detection.probability * 100).toFixed(1)}%
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
											{detection.source}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{isTarget(detection.label) && detection.probability >= 0.6 ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
													Deterrent Activated
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													Monitoring
												</span>
											)}
										</td>
									</tr>
								))}
								{log.length === 0 && (
									<tr>
										<td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
											No detections yet. Enable detection to start monitoring.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</motion.div>

				{/* Quick Actions */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.8 }}
					className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
				>
					<h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<button className="flex items-center space-x-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors" onClick={() => setEnabled(true)}>
							<ShieldCheckIcon className="h-6 w-6" />
							<span className="font-medium">Activate Manual Deterrent</span>
						</button>
						<button className="flex items-center space-x-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors" onClick={() => setTargets(['squirrel', 'raccoon', 'deer'])}>
							<Cog6ToothIcon className="h-6 w-6" />
							<span className="font-medium">Reset Target Species</span>
						</button>
						<button className="flex items-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors" onClick={() => setLog([])}>
							<ChartBarIcon className="h-6 w-6" />
							<span className="font-medium">Clear Activity Log</span>
						</button>
					</div>
				</motion.div>
				</main>
			</div>
		</div>
	);
};

export default Dashboard;