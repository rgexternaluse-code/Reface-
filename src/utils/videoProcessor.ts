import { DetectedFace, ProcessingProgress, ProcessingStep, RefaceOptions, RefaceResult, SourceFaceData, VideoMetadata } from '../types';
import { blendFaceOntoTarget, detectFacesOnCanvas, FaceTracker } from './faceEngine';

export interface ProcessorCallbacks {
  onProgress: (progress: ProcessingProgress) => void;
  onPreviewFrame?: (canvas: HTMLCanvasElement) => void;
}

export class VideoRefacePipeline {
  private isCancelled = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;

  public cancel() {
    this.isCancelled = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
    }
  }

  public async processVideo(
    sourceFaceData: SourceFaceData,
    videoMeta: VideoMetadata,
    targetFace: DetectedFace,
    callbacks: ProcessorCallbacks,
    options?: Partial<RefaceOptions>
  ): Promise<RefaceResult> {
    this.isCancelled = false;
    const startTime = performance.now();

    const notify = (
      step: ProcessingStep,
      statusMessage: string,
      currentFrame: number,
      totalFrames: number,
      percent: number,
      fps = 30
    ) => {
      const elapsed = performance.now() - startTime;
      const estimatedTotal = percent > 0 ? (elapsed / percent) * 100 : 0;
      const remaining = Math.max(0, estimatedTotal - elapsed);

      callbacks.onProgress({
        step,
        statusMessage,
        currentFrame,
        totalFrames,
        percent: Math.min(100, Math.max(0, Math.round(percent))),
        fps,
        elapsedMs: elapsed,
        estimatedRemainingMs: remaining,
      });
    };

    // Step 1: Preparing video
    notify('preparing', 'Preparing video...', 0, 100, 2);

    const videoEl = document.createElement('video');
    videoEl.crossOrigin = 'anonymous';
    videoEl.muted = false;
    videoEl.playsInline = true;
    videoEl.src = videoMeta.url;

    await new Promise<void>((resolve, reject) => {
      videoEl.onloadedmetadata = () => resolve();
      videoEl.onerror = () => reject(new Error('Failed to load video on device.'));
    });

    if (this.isCancelled) throw new Error('Processing cancelled by user.');

    // Calculate dimensions
    const width = videoMeta.width || videoEl.videoWidth || 640;
    const height = videoMeta.height || videoEl.videoHeight || 480;
    const duration = Math.min(videoMeta.duration || videoEl.duration || 5, 60); // Safety cap for mobile memory
    const fps = videoMeta.fps || 30;
    const totalFrames = Math.max(1, Math.round(duration * fps));

    const workCanvas = document.createElement('canvas');
    workCanvas.width = width;
    workCanvas.height = height;
    const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
    if (!workCtx) throw new Error('Canvas context initialization failed.');

    // Prepare source face image
    const sourceImg = new Image();
    sourceImg.src = sourceFaceData.dataUrl;
    await new Promise<void>((resolve) => {
      sourceImg.onload = () => resolve();
    });

    if (!sourceFaceData.detectedFace) {
      throw new Error('No usable source face detected. Please pick a clearer face photo.');
    }

    // Step 2: Extract or capture audio to preserve it
    notify('restoring_audio', 'Configuring audio stream preservation...', 0, totalFrames, 5);

    const stream = workCanvas.captureStream(fps);

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = this.audioContext.createMediaElementSource(videoEl);
      const destination = this.audioContext.createMediaStreamDestination();
      source.connect(destination);

      for (const track of destination.stream.getAudioTracks()) {
        stream.addTrack(track);
      }
    } catch {
      // If audio extraction is restricted by browser autoplay policy, video stream continues
    }

    // Select optimal encoding format
    const mimeTypes = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let selectedMime = 'video/webm';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const recordedChunks: Blob[] = [];
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 3_500_000, // Balanced crisp mobile bitrate
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    const completionPromise = new Promise<Blob>((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const finalBlob = new Blob(recordedChunks, { type: selectedMime });
        resolve(finalBlob);
      };
    });

    this.mediaRecorder.start(100);

    // Face tracker
    const tracker = new FaceTracker();
    let currentDetectedFace: DetectedFace | null = targetFace;

    // Step 3: Sequential frame-by-frame processing
    const frameInterval = 1 / fps;
    const detectionRefreshInterval = 15; // Periodic refresh

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (this.isCancelled) {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
        throw new Error('Processing cancelled by user.');
      }

      const currentTime = frameIndex * frameInterval;
      videoEl.currentTime = currentTime;

      // Fast seek with safety timeout to prevent hanging
      await new Promise<void>((r) => {
        let done = false;
        const timer = setTimeout(() => {
          if (!done) {
            done = true;
            r();
          }
        }, 120);

        videoEl.onseeked = () => {
          if (!done) {
            done = true;
            clearTimeout(timer);
            r();
          }
        };
      });

      // Draw target video frame onto canvas
      workCtx.drawImage(videoEl, 0, 0, width, height);

      // Periodic face detection refresh
      if (frameIndex % detectionRefreshInterval === 0 || !currentDetectedFace) {
        notify('detecting', 'Locking face geometry...', frameIndex + 1, totalFrames, (frameIndex / totalFrames) * 90);
        const faces = await detectFacesOnCanvas(workCanvas, 0.50);
        if (faces.length > 0) {
          // Select face closest to active target
          const refBox = currentDetectedFace ? currentDetectedFace.box : targetFace.box;
          let bestFace = faces[0];
          let minDistance = Infinity;
          for (const f of faces) {
            const dist = Math.hypot(f.box.x - refBox.x, f.box.y - refBox.y);
            if (dist < minDistance) {
              minDistance = dist;
              bestFace = f;
            }
          }
          // Accept candidate if it is near the active face (prevent jumping to background)
          if (minDistance < refBox.width * 1.5 || !currentDetectedFace) {
            currentDetectedFace = tracker.update(bestFace);
          } else {
            currentDetectedFace = tracker.update(currentDetectedFace);
          }
        } else {
          currentDetectedFace = tracker.update(currentDetectedFace);
        }
      } else {
        notify('tracking', 'Tracking face...', frameIndex + 1, totalFrames, (frameIndex / totalFrames) * 90);
        currentDetectedFace = tracker.update(currentDetectedFace);
      }

      // Step 4: Precise Eye-Aligned Face Swap and Feathered Blending
      if (currentDetectedFace) {
        notify('blending', 'Blending face seamlessly...', frameIndex + 1, totalFrames, (frameIndex / totalFrames) * 90);
        blendFaceOntoTarget(workCtx, sourceImg, sourceFaceData.detectedFace, currentDetectedFace, options);
      }

      // Watermark / on-device indicator
      workCtx.save();
      workCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      workCtx.font = '11px sans-serif';
      workCtx.fillText('REFACE • 100% ON-DEVICE', 16, height - 16);
      workCtx.restore();

      // Notify preview callback so user sees live frame
      if (callbacks.onPreviewFrame) {
        callbacks.onPreviewFrame(workCanvas);
      }

      // Yield UI loop every 2 frames for smooth browser responsiveness without lag
      if (frameIndex % 2 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // Step 5: Encoding video & finalizing
    notify('encoding', 'Encoding video...', totalFrames, totalFrames, 95);

    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    notify('saving', 'Saving result...', totalFrames, totalFrames, 99);

    const finalBlob = await completionPromise;
    const finalUrl = URL.createObjectURL(finalBlob);
    const durationSec = (performance.now() - startTime) / 1000;

    notify('saving', 'Completed', totalFrames, totalFrames, 100);

    return {
      videoBlob: finalBlob,
      videoUrl: finalUrl,
      duration: duration,
      width,
      height,
      fps,
      processingTimeSeconds: Math.round(durationSec * 10) / 10,
    };
  }
}
