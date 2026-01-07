import React from 'react';

interface DeviceStatusBadgeProps {
    status: 'online' | 'offline' | 'maintenance';
    batteryLevel?: number;
    signalStrength?: number;
}

const DeviceStatusBadge: React.FC<DeviceStatusBadgeProps> = ({ status, batteryLevel, signalStrength }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-100 text-green-800';
            case 'offline': return 'bg-red-100 text-red-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getBatteryColor = (level: number) => {
        if (level > 50) return 'text-green-600';
        if (level > 20) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="flex items-center space-x-3">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            {status === 'online' && (
                <div className="flex space-x-2 text-xs text-gray-500">
                    {batteryLevel !== undefined && (
                        <span className="flex items-center" title="Battery Level">
                            <span className={`mr-1 ${getBatteryColor(batteryLevel)}`}>⚡</span>
                            {batteryLevel}%
                        </span>
                    )}
                    {signalStrength !== undefined && (
                        <span className="flex items-center" title="Signal Strength">
                            <span className="mr-1 text-blue-500">📶</span>
                            {signalStrength}%
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeviceStatusBadge;
