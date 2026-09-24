/**
 * Built-in test media generators for instant 1-click on-device testing.
 */

export interface SampleFace {
  id: string;
  name: string;
  dataUrl: string;
  previewUrl: string;
}

// Generate a clean stylized portrait avatar as a high-res data URL
export function generateSamplePortrait(skinTone: string, hairColor: string, isMale: boolean): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 400, 400);
  bgGrad.addColorStop(0, '#1e1b4b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 400, 400);

  // Shoulders / Torso
  ctx.fillStyle = isMale ? '#334155' : '#475569';
  ctx.beginPath();
  ctx.ellipse(200, 410, 140, 90, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = skinTone;
  ctx.fillRect(175, 240, 50, 60);

  // Face Oval
  ctx.beginPath();
  ctx.ellipse(200, 195, 75, 95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair Back
  ctx.fillStyle = hairColor;
  if (!isMale) {
    ctx.beginPath();
    ctx.ellipse(200, 190, 95, 120, 0, 0, Math.PI * 2);
    ctx.fill();
    // Re-draw face over hair back
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(200, 195, 75, 95, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hair Front / Top
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(200, 150, 78, Math.PI * 0.85, Math.PI * 2.15);
  ctx.fill();

  // Eyes
  const eyeY = 185;
  const leftEyeX = 172;
  const rightEyeX = 228;

  // Eye whites
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(leftEyeX, eyeY, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(rightEyeX, eyeY, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Irises
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rightEyeX, eyeY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Pupils & Highlights
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, 3, 0, Math.PI * 2);
  ctx.arc(rightEyeX, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX - 2, eyeY - 2, 1.5, 0, Math.PI * 2);
  ctx.arc(rightEyeX - 2, eyeY - 2, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = hairColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(leftEyeX - 14, eyeY - 14);
  ctx.quadraticCurveTo(leftEyeX, eyeY - 18, leftEyeX + 14, eyeY - 12);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rightEyeX - 14, eyeY - 12);
  ctx.quadraticCurveTo(rightEyeX, eyeY - 18, rightEyeX + 14, eyeY - 14);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = '#c28b6d';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(200, 185);
  ctx.lineTo(200, 215);
  ctx.lineTo(208, 218);
  ctx.stroke();

  // Lips
  ctx.fillStyle = '#e17055';
  ctx.beginPath();
  ctx.ellipse(200, 245, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle cheeks blush
  ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
  ctx.beginPath();
  ctx.arc(160, 210, 16, 0, Math.PI * 2);
  ctx.arc(240, 210, 16, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

export const SAMPLE_FACES: SampleFace[] = [
  {
    id: 'sample_alex',
    name: 'Alex (Warm Tone)',
    dataUrl: generateSamplePortrait('#f3c49e', '#3b2512', true),
    previewUrl: '',
  },
  {
    id: 'sample_elena',
    name: 'Elena (Light Tone)',
    dataUrl: generateSamplePortrait('#fcd6b8', '#854d0e', false),
    previewUrl: '',
  },
  {
    id: 'sample_marcus',
    name: 'Marcus (Deep Tone)',
    dataUrl: generateSamplePortrait('#8d5524', '#1e293b', true),
    previewUrl: '',
  },
];

/**
 * Creates a valid, playable sample video entirely on-device
 * with moving target face and synth audio track using MediaRecorder & Web Audio.
 */
export async function createSampleVideoBlob(): Promise<{ blob: Blob; url: string; duration: number }> {
  const width = 640;
  const height = 480;
  const durationSec = 3.5;
  const fps = 30;
  const totalFrames = Math.round(durationSec * fps);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(fps);

  // Synthesize an audio track
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + durationSec);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + durationSec);

  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  // Combine audio track into stream
  for (const track of dest.stream.getAudioTracks()) {
    stream.addTrack(track);
  }

  const mimeTypes = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  let selectedMime = 'video/webm';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<{ blob: Blob; url: string; duration: number }>((resolve) => {
    recorder.onstop = () => {
      osc.stop();
      audioCtx.close();
      const blob = new Blob(chunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      resolve({ blob, url, duration: durationSec });
    };
  });

  recorder.start();

  // Render video frames with a person moving head naturally
  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / totalFrames;
    const angle = Math.sin(t * Math.PI * 3) * 0.12; // head tilt
    const swayX = Math.sin(t * Math.PI * 2) * 35; // gentle sway
    const mouthOpen = Math.abs(Math.sin(t * Math.PI * 8)) * 8; // talking mouth

    // Background studio gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#111827');
    bgGrad.addColorStop(1, '#1f2937');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid backdrop
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(width / 2 + swayX, height / 2 + 30);
    ctx.rotate(angle);

    // Torso
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.ellipse(0, 200, 180, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e0a98b';
    ctx.fillRect(-35, 40, 70, 70);

    // Head Oval
    ctx.fillStyle = '#e0a98b';
    ctx.beginPath();
    ctx.ellipse(0, -20, 95, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -70, 98, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();

    // Eyes
    const eY = -30;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-38, eY, 15, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(38, eY, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-38, eY, 6, 0, Math.PI * 2);
    ctx.arc(38, eY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.strokeStyle = '#b97a5a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 10);
    ctx.lineTo(10, 14);
    ctx.stroke();

    // Mouth (animated speaking)
    ctx.fillStyle = '#9f1239';
    ctx.beginPath();
    ctx.ellipse(0, 48, 22, 6 + mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Frame counter stamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px monospace';
    ctx.fillText(`TARGET VIDEO CLIP • FRAME ${frame + 1}/${totalFrames} • 100% LOCAL`, 18, 28);

    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  recorder.stop();
  return recordingPromise;
}
