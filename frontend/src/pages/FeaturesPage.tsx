import React from 'react';

const FeaturesPage: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero banner */}
			<section className="relative h-[360px] w-full">
				<img
					src="https://images.pexels.com/photos/1125776/pexels-photo-1125776.jpeg?auto=compress&cs=tinysrgb&w=1920&h=720&fit=crop"
					alt="SADS Features"
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/40" />
				<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-10">
					<div>
						<h1 className="text-4xl sm:text-5xl font-extrabold text-white">Powerful Features for <span className="text-emerald-400">Complete Protection</span></h1>
						<p className="text-white/90 mt-3 max-w-3xl">Our advanced SADS technology combines lightweight AI with robust deterrent simulation to provide comprehensive, humane animal deterrence.</p>
					</div>
				</div>
			</section>

			{/* Features grid */}
			<section className="relative py-16 sm:py-24 bg-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-10">Features</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
							<h3 className="font-semibold text-gray-900 mb-2">AI‑Powered Detection</h3>
							<p className="text-gray-600 text-sm">On-device MobileNetV2 real-time inference on commodity hardware.</p>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
							<h3 className="font-semibold text-gray-900 mb-2">Selective & Humane</h3>
							<p className="text-gray-600 text-sm">Target-species thresholds and non‑target exclusion for people and pets.</p>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
							<h3 className="font-semibold text-gray-900 mb-2">Deterrent Simulation</h3>
							<p className="text-gray-600 text-sm">Audio beeps, strobe overlay, and alerts to validate strategies without hardware.</p>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
							<h3 className="font-semibold text-gray-900 mb-2">Event Logging</h3>
							<p className="text-gray-600 text-sm">Persist detections for analytics and iterative model refinement.</p>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
							<h3 className="font-semibold text-gray-900 mb-2">One Tap Sign‑in</h3>
							<p className="text-gray-600 text-sm">Google Identity integration with JWT‑secured APIs and role‑based pages.</p>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
							<h3 className="font-semibold text-gray-900 mb-2">Lightweight & Portable</h3>
							<p className="text-gray-600 text-sm">Runs in the browser; ideal for research and prototyping.</p>
						</div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="relative py-16 sm:py-24 bg-gray-50 border-t border-gray-200">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-10">How SADS Works</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="bg-white border border-gray-200 rounded-2xl p-6">
							<span className="inline-block text-xs font-semibold text-gray-500 mb-2">STEP 01</span>
							<h3 className="font-semibold text-gray-900 mb-2">Camera Detection</h3>
							<p className="text-gray-600 text-sm">High‑resolution cameras monitor the scene and stream frames in real‑time.</p>
						</div>
						<div className="bg-white border border-gray-200 rounded-2xl p-6">
							<span className="inline-block text-xs font-semibold text-gray-500 mb-2">STEP 02</span>
							<h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
							<p className="text-gray-600 text-sm">MobileNetV2 classifies species and applies target mapping and thresholds.</p>
						</div>
						<div className="bg-white border border-gray-200 rounded-2xl p-6">
							<span className="inline-block text-xs font-semibold text-gray-500 mb-2">STEP 03</span>
							<h3 className="font-semibold text-gray-900 mb-2">Deterrent & Logging</h3>
							<p className="text-gray-600 text-sm">Trigger simulated deterrents and persist events for analytics and tuning.</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default FeaturesPage;
