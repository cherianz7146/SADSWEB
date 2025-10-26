import React, { useEffect, useRef, useState } from 'react';

export type DetectionEvent = {
	label: string;
	probability: number;
	at: number;
	source: 'video' | 'image';
};

interface DetectorProps {
	enabled: boolean;
	onDetection: (event: DetectionEvent) => void;
	classMap?: Record<string, 'target' | 'non_target'>;
	videoConstraints?: MediaStreamConstraints['video'];
}

const DEFAULT_MAP: Record<string, 'target' | 'non_target'> = {
	person: 'non_target',
	dog: 'non_target',
	cat: 'non_target',
	squirrel: 'target',
	raccoon: 'target',
	deer: 'target'
};

const Detector: React.FC<DetectorProps> = ({
	enabled,
	onDetection,
	classMap = DEFAULT_MAP,
	videoConstraints
}) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [model, setModel] = useState<any>(null);
	const [streamError, setStreamError] = useState<string | null>(null);
	const [status, setStatus] = useState<string>('Initializing');

	useEffect(() => {
		let isActive = true;
		(async () => {
			try {
				setStatus('Loading model');
				const tf = await import('@tensorflow/tfjs');
				await tf.ready();
				const mobilenet = await import('@tensorflow-models/mobilenet');
				const loaded = await mobilenet.load({ version: 2, alpha: 0.5 });
				if (!isActive) return;
				setModel(loaded);
				setStatus('Model loaded');
			} catch (e) {
				setStatus('Failed to load model');
			}
		})();
		return () => {
			isActive = false;
		};
	}, []);

	useEffect(() => {
		if (!enabled) return;
		if (!videoRef.current) return;
		let stream: MediaStream | null = null;
		let cancelled = false;
		(async () => {
			try {
				setStatus('Requesting camera');
				stream = await navigator.mediaDevices.getUserMedia({
					video: videoConstraints ?? { facingMode: 'environment' },
					audio: false
				});
				if (cancelled) return;
				videoRef.current!.srcObject = stream;
				await videoRef.current!.play();
				setStatus('Camera ready');
			} catch (err: any) {
				setStreamError(err?.message ?? 'Unable to access camera');
				setStatus('Camera error');
			}
		})();
		return () => {
			cancelled = true;
			if (stream) {
				stream.getTracks().forEach(t => t.stop());
			}
		};
	}, [enabled, videoConstraints]);

	useEffect(() => {
		let raf = 0;
		if (!enabled || !model || !videoRef.current) return;
		const video = videoRef.current;
		setStatus('Detecting');
		const detect = async () => {
			if (!video || video.readyState < 2) {
				raf = requestAnimationFrame(detect);
				return;
			}
			try {
				const predictions = await model.classify(video);
				const top = predictions[0];
				if (top) {
					const label = top.className.split(',')[0].toLowerCase();
					const probability = top.probability;
					const mapped = Object.keys(classMap).find(k => label.includes(k));
					if (mapped) {
						onDetection({ label: mapped, probability, at: Date.now(), source: 'video' });
					}
				}
			} catch {}
			raf = requestAnimationFrame(detect);
		};
		raf = requestAnimationFrame(detect);
		return () => cancelAnimationFrame(raf);
	}, [enabled, model, classMap, onDetection]);

	return (
		<div className="space-y-3">
			<div className="relative bg-black rounded-xl overflow-hidden">
				<video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
				<div className="absolute top-2 left-2 bg-white/80 text-gray-800 text-xs px-2 py-1 rounded">
					{status}
				</div>
			</div>
			{streamError && (
				<div className="text-red-600 text-sm">{streamError}</div>
			)}
		</div>
	);
};

export default Detector;
