import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SpeakerWaveIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { DetectionEvent } from './Detector';

interface DeterrentSimulatorProps {
	active: boolean;
	lastDetection?: DetectionEvent | null;
	isTarget: (label: string) => boolean;
}

const beepDataUri = (() => {
	// Simple 440Hz beep for ~200ms using WebAudio rendered to data URI
	const duration = 0.2;
	const sampleRate = 44100;
	const length = Math.floor(duration * sampleRate);
	const freq = 880;
	const data = new Int16Array(length);
	for (let i = 0; i < length; i++) {
		const t = i / sampleRate;
		const v = Math.sin(2 * Math.PI * freq * t) * 0.4;
		data[i] = Math.max(-1, Math.min(1, v)) * 0x7fff;
	}
	let wav = 'data:audio/wav;base64,';
	function toBytes(num: number, bytes: number) {
		let res = '';
		for (let i = 0; i < bytes; i++) res += String.fromCharCode((num >> (8 * i)) & 0xff);
		return res;
	}
	const header =
		'RIFF' + toBytes(36 + data.length * 2, 4) + 'WAVEfmt ' + toBytes(16, 4) + toBytes(1, 2) + toBytes(1, 2) +
		toBytes(sampleRate, 4) + toBytes(sampleRate * 2, 4) + toBytes(2, 2) + toBytes(16, 2) + 'data' + toBytes(data.length * 2, 4);
	let body = '';
	for (let i = 0; i < data.length; i++) {
		body += String.fromCharCode(data[i] & 0xff, (data[i] >> 8) & 0xff);
	}
	return wav + btoa(header + body);
})();

const DeterrentSimulator: React.FC<DeterrentSimulatorProps> = ({ active, lastDetection, isTarget }) => {
	const [isStrobing, setIsStrobing] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const shouldTrigger = useMemo(() => {
		if (!active || !lastDetection) return false;
		if (!isTarget(lastDetection.label)) return false;
		return lastDetection.probability >= 0.6;
	}, [active, lastDetection, isTarget]);

	useEffect(() => {
		if (!shouldTrigger) return;
		// Play sound
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch(() => {});
		}
		// Strobe for 1.2s
		setIsStrobing(true);
		const t = setTimeout(() => setIsStrobing(false), 1200);
		return () => clearTimeout(t);
	}, [shouldTrigger]);

	return (
		<div className="relative">
			<div className="grid grid-cols-3 gap-3">
				<div className={`p-3 rounded-xl border ${shouldTrigger ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}`}>
					<div className="flex items-center space-x-2 text-gray-800">
						<SpeakerWaveIcon className="h-5 w-5" />
						<span className="text-sm font-medium">Warning Sound</span>
					</div>
				</div>
				<div className={`p-3 rounded-xl border ${isStrobing ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
					<div className="flex items-center space-x-2 text-gray-800">
						<BoltIcon className="h-5 w-5" />
						<span className="text-sm font-medium">Strobe Light</span>
					</div>
				</div>
				<div className={`p-3 rounded-xl border ${shouldTrigger ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
					<div className="flex items-center space-x-2 text-gray-800">
						<ExclamationTriangleIcon className="h-5 w-5" />
						<span className="text-sm font-medium">On-screen Alert</span>
					</div>
				</div>
			</div>
			{isStrobing && (
				<div className="absolute inset-0 pointer-events-none animate-pulse" style={{ background: 'rgba(255,255,200,0.35)' }}></div>
			)}
			<audio ref={audioRef} src={beepDataUri} preload="auto" />
		</div>
	);
};

export default DeterrentSimulator;








