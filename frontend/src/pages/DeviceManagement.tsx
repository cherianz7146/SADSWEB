import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import ManagerLayout from '../components/ManagerLayout';
import AdminLayout from '../components/AdminLayout';
import DeviceStatusBadge from '../components/DeviceStatusBadge';
import { Plus, RefreshCw, Server, Camera, Battery, Wifi, MapPin, Calendar } from 'lucide-react';

interface Device {
    _id: string;
    serialNumber: string;
    type: 'camera' | 'deterrent' | 'sensor';
    status: 'online' | 'offline' | 'maintenance';
    batteryLevel: number;
    signalStrength: number;
    lastPing: string;
    assignedProperty: {
        _id: string;
        name: string;
    };
    metadata?: {
        ipAddress?: string;
        streamUrl?: string;
        [key: string]: any;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface Property {
    _id: string;
    name: string;
}

const DeviceManagement = () => {
    const { user } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        serialNumber: '',
        type: 'camera',
        assignedProperty: ''
    });
    const [error, setError] = useState('');

    const Layout = user?.role === 'admin' ? AdminLayout : ManagerLayout;

    const fetchData = async () => {
        try {
            setLoading(true);

            // For admin users, use the health endpoint which returns all devices with metadata
            if (user?.role === 'admin') {
                try {
                    const healthRes = await apiFetch<{ devices: Device[] }>('/api/devices/health');
                    if (healthRes.data?.devices) {
                        setDevices(healthRes.data.devices);
                    }
                    // Still fetch properties for the add device modal
                    const propsRes = await apiFetch<Property[]>('/api/properties');
                    setProperties(propsRes.data);
                } catch (healthErr) {
                    console.warn('Health endpoint failed, falling back to property-based fetch:', healthErr);
                    // Fallback to property-based fetch
                    await fetchDevicesByProperty();
                }
            } else {
                // For managers, fetch by property
                await fetchDevicesByProperty();
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDevicesByProperty = async () => {
        // Fetch properties first
        const propsRes = await apiFetch<Property[]>('/api/properties');
        setProperties(propsRes.data);

        if (propsRes.data.length > 0) {
            // Fetch devices for all properties (parallel)
            const devicesPromises = propsRes.data.map((p: Property) =>
                apiFetch<Device[]>(`/api/devices/property/${p._id}`)
            );
            const devicesRes = await Promise.all(devicesPromises);
            const allDevices = devicesRes.flatMap(r => r.data);
            setDevices(allDevices);
        } else {
            setDevices([]);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/api/devices', {
                method: 'POST',
                body: formData
            });
            setShowAddModal(false);
            setFormData({ serialNumber: '', type: 'camera', assignedProperty: '' });
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to add device');
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
                        <p className="text-gray-500">Monitor and manage your IoT devices</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Device
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Devices</p>
                                <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Server className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Online</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {devices.filter(d => d.status === 'online').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Offline</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {devices.filter(d => d.status === 'offline').length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Device List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">All Devices</h2>
                        <button
                            onClick={fetchData}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Ping</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {devices.map((device) => (
                                    <tr key={device._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                {device.type === 'camera' && (
                                                    <Camera className="w-5 h-5 text-blue-600" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{device.serialNumber}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{device.type}</div>
                                                    {device.type === 'camera' && device.metadata?.ipAddress && (
                                                        <div className="text-xs text-gray-400 mt-1">ID: {device._id.slice(-8)}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <DeviceStatusBadge
                                                status={device.status}
                                                batteryLevel={device.batteryLevel}
                                                signalStrength={device.signalStrength}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Battery className={`w-4 h-4 ${
                                                    device.batteryLevel > 50 ? 'text-green-600' :
                                                    device.batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
                                                }`} />
                                                <span className={`text-sm font-medium ${
                                                    device.batteryLevel > 50 ? 'text-green-600' :
                                                    device.batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {device.batteryLevel ?? 'N/A'}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Wifi className={`w-4 h-4 ${
                                                    device.signalStrength > 70 ? 'text-green-600' :
                                                    device.signalStrength > 40 ? 'text-yellow-600' : 'text-red-600'
                                                }`} />
                                                <span className={`text-sm font-medium ${
                                                    device.signalStrength > 70 ? 'text-green-600' :
                                                    device.signalStrength > 40 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {device.signalStrength ?? 'N/A'}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {device.metadata?.ipAddress ? (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-900 font-mono">{device.metadata.ipAddress}</span>
                                                    {device.type === 'camera' && device.metadata?.streamUrl && (
                                                        <a
                                                            href={device.metadata.streamUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 text-xs"
                                                            title="Open stream"
                                                        >
                                                            🔗
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{device.assignedProperty?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{device.lastPing ? new Date(device.lastPing).toLocaleString() : 'Never'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900">Configure</button>
                                        </td>
                                    </tr>
                                ))}
                                {devices.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No devices found. Add one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Device Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Device</h2>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={formData.serialNumber}
                                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="camera">Camera</option>
                                    <option value="deterrent">Deterrent</option>
                                    <option value="sensor">Sensor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Property</label>
                                <select
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={formData.assignedProperty}
                                    onChange={e => setFormData({ ...formData, assignedProperty: e.target.value })}
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Add Device
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DeviceManagement;
