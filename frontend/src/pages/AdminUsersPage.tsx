import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

interface UserRow {
	_id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
}

const AdminUsersPage: React.FC = () => {
	const [users, setUsers] = useState<UserRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const resp = await apiFetch<UserRow[]>('/api/users');
				setUsers(resp.data);
			} catch (e: any) {
				setError(e.message || 'Failed to load users');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <div className="p-6">Loading...</div>;
	if (error) return <div className="p-6 text-red-600">{error}</div>;

	return (
		<div className="max-w-5xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Users</h1>
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Name</th>
							<th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Email</th>
							<th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Role</th>
							<th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Joined</th>
						</tr>
					</thead>
					<tbody>
						{users.map(u => (
							<tr key={u._id} className="border-t">
								<td className="px-4 py-3">{u.name}</td>
								<td className="px-4 py-3">{u.email}</td>
								<td className="px-4 py-3 capitalize">{u.role}</td>
								<td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AdminUsersPage;


