import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  Code2,
  Terminal,
  Zap,
  ShieldCheck,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface BuildApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildApkModal: React.FC<BuildApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'capacitor' | 'native'>('pwa');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const capacitorCommands = `# 1. Install Capacitor in this project directory
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor project
npx cap init Reface com.reface.faceswap --web-dir dist

# 3. Build optimized web assets
npm run build

# 4. Generate Android Studio native project
npx cap add android

# 5. Sync web build to Android project
npx cap sync android

# 6. Build the Standalone APK directly via Gradle
cd android && ./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  const capacitorConfig = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reface.faceswap',
  appName: 'Reface',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    backgroundColor: '#090d16'
  }
};

export default config;`;

  const kotlinArchitecture = `// Reface Native Android Pipeline Architecture
// 1. CameraX -> ImageAnalysis (YUV_420_888)
// 2. MediaPipe FaceMesh / BlazeFace -> 468 3D Landmarks
// 3. ONNX Runtime Android -> SimSwap / InsightFace (512-dim embedding)
// 4. OpenGL ES 3.0 Fragment Shader -> Seamless Poisson Skin Blending
// 5. MediaCodec -> Hardware Accelerated H.264/HEVC MP4 Encoder

dependencies {
    implementation("androidx.camera:camera-camera2:1.4.1")
    implementation("androidx.camera:camera-lifecycle:1.4.1")
    implementation("com.google.mediapipe:tasks-vision:0.10.14")
    implementation("com.microsoft.onnxruntime:onnxruntime-android:1.19.0")
}`;

  const downloadCapacitorConfig = () => {
    const blob = new Blob([capacitorConfig], { type: 'application/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capacitor.config.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white shadow-lg shadow-indigo-600/25">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-mono tracking-tight">BUILD REFACE APK</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  Android Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400">Step-by-step roadmap to run or compile the APK on Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'pwa'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Instant Android Install (WebAPK)</span>
          </button>

          <button
            onClick={() => setActiveTab('capacitor')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'capacitor'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Build Standalone .APK (Capacitor)</span>
          </button>

          <button
            onClick={() => setActiveTab('native')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'native'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. Native Kotlin Architecture</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-300">
          {/* TAB 1: INSTANT INSTALL (WebAPK) */}
          {activeTab === 'pwa' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>The Fastest Path: Direct Android WebAPK</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Android Chrome natively mints a signed <strong>WebAPK</strong> directly from our Web App Manifest.
                  Once installed, it acts as a standalone Android app with its own launcher icon, full camera hardware access,
                  and 100% offline local processing without requiring an app store download.
                </p>

                {isInstalled ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>REFACE is already installed on this device!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Reface App to Home Screen</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs space-y-2">
                    <div className="font-semibold text-zinc-200">How to install on your Android device:</div>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                      <li>Open this URL in Google Chrome or Brave on your Android phone.</li>
                      <li>Tap the <strong>Three Dots (⋮)</strong> menu in the top right.</li>
                      <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                      <li>The Reface app icon will appear in your Android app drawer.</li>
                    </ol>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hardware Acceleration</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Leverages Android GPU WebGL and MediaRecorder for 60fps face swapping.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero Data Tracking</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    No accounts, no cloud database uploads, and no analytics SDKs required.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPILE STANDALONE APK (Capacitor) */}
          {activeTab === 'capacitor' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="text-xs text-zinc-400 leading-relaxed">
                  Want an actual <code>.apk</code> file to sideload via USB, share on Telegram, or upload to Google Play?
                  You can package this exact codebase using <strong>Capacitor</strong> in under 5 minutes:
                </div>
              </div>

              {/* Commands Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-zinc-300">Terminal Build Commands</span>
                  <button
                    onClick={() => copyToClipboard(capacitorCommands, 'cap_cmds')}
                    className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {copiedSection === 'cap_cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'cap_cmds' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
                  <pre>{capacitorCommands}</pre>
                </div>
              </div>

              {/* Config file */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-zinc-300">capacitor.config.ts</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={downloadCapacitorConfig}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Config</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(capacitorConfig, 'cap_config')}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      {copiedSection === 'cap_config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'cap_config' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-[11px] text-indigo-200 overflow-x-auto">
                  <pre>{capacitorConfig}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NATIVE KOTLIN ARCHITECTURE */}
          {activeTab === 'native' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  If you want to build the exact commercial <strong>Reface Android APK</strong> in native Android Studio from scratch,
                  here is the real-world engineering architecture used by high-performance mobile face-swap applications:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Camera & Video Decode (CameraX + MediaCodec)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] pl-7">
                    Uses Android CameraX with <code>ImageAnalysis.OUTPUT_IMAGE_FORMAT_YUV_420_888</code> for 60fps raw frame streams.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Biometric Face Alignment (MediaPipe / RetinaFace)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] pl-7">
                    Extracts 5 or 68 landmark points (pupils, nose tip, mouth corners) to compute the 2D affine transformation matrix.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Neural Face Swapper (ONNX Runtime Mobile + NNAPI)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] pl-7">
                    Runs quantized <strong>InsightFace (inswapper_128.onnx)</strong> or <strong>SimSwap</strong> models accelerated by Qualcomm Hexagon / Mali NPU hardware.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">4</span>
                    <span>Seamless Blending & Encoding</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] pl-7">
                    OpenGL ES 3.0 Poisson seamless blending shader matches lighting and skin color before encoding directly to MP4.
                  </p>
                </div>
              </div>

              {/* Kotlin build.gradle snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-zinc-300">app/build.gradle.kts (Native Dependencies)</span>
                  <button
                    onClick={() => copyToClipboard(kotlinArchitecture, 'kotlin_deps')}
                    className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {copiedSection === 'kotlin_deps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'kotlin_deps' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                  <pre>{kotlinArchitecture}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Powered by On-Device Privacy Architecture
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
