import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FeaturesPage: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			
			{/* Hero banner - Same background as Landing Page */}
			<section className="relative min-h-[500px] w-full flex items-center justify-center pt-16">
				{/* Background Image - Same as Landing Page */}
				<div className="absolute inset-0 w-full h-full">
					<img
						src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
						alt="Agricultural landscape"
					className="absolute inset-0 w-full h-full object-cover"
				/>
					{/* Dark Overlay - Same as Landing Page */}
					<div className="absolute inset-0 bg-black/60" />
					</div>
				
				<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						<h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
							Powerful Features for{' '}
							<span className="text-emerald-400">Complete Protection</span>
						</h1>
						<p className="text-white/90 text-lg sm:text-xl max-w-3xl mx-auto">
							Our advanced SADS technology combines lightweight AI with robust deterrent simulation to provide comprehensive, humane animal deterrence.
						</p>
					</motion.div>
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
			<Footer />
		</div>
	);
};

export default FeaturesPage;
