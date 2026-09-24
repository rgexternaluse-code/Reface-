# REFACE — Offline Mobile Face Swap App

> **100% On-Device AI Video Face Replacement**  
> *Your face. Your video. Your device. No cloud.*

[![Android CI](https://github.com/reface-mobile/reface/actions/workflows/android.yml/badge.svg)](https://github.com/reface-mobile/reface/actions/workflows/android.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Zero Cloud Egress](https://img.shields.io/badge/Privacy-100%25%20On--Device-emerald.svg)](#privacy-architecture)

---

## 1. Project Overview

**REFACE** is a privacy-first video face replacement application designed to perform AI-powered face swapping entirely on the user's device.

### Core Guarantees:
- **Zero Cloud Uploads**: User face photos and video clips are never sent to external servers or cloud GPUs.
- **True Offline Operation**: Works in Airplane Mode without internet connectivity.
- **No Third-Party Face APIs**: Does not use Firebase, paid SaaS APIs, or remote inference clusters.
- **Original Audio Preservation**: The original video soundtrack is remuxed synchronously with the generated video.

---

## 2. Features

- **Source Face Detection**: Detects and aligns human face landmarks (eyes, nose, mouth, contour) with confidence validation.
- **Target Video Inspection**: Inspects duration, resolution, FPS, and codec info on-device.
- **Target Face Picker**: Automatically scans keyframes in videos containing multiple people and lets the user choose which face to replace.
- **Sequential Streaming Pipeline**: Processes frames one-by-one to prevent `OutOfMemoryError` on mobile devices.
- **Seamless Alpha & Color Blending**: Adjusts lighting and skin tones with feathered Gaussian blending.
- **Real-Time Progress & Cancellation**: Displays actual frame progress (`Frame 120 / 180`), estimated completion time, and supports instant cancellation.
- **Gallery Export & Native Sharing**: Saves directly to device gallery via Android MediaStore.

---

## 3. Architecture

```
reface-mobile/
├── app/                           # Android Application (Kotlin + Jetpack Compose)
│   ├── src/main/java/com/reface/mobile/
│   │   ├── ui/                    # Compose Screens (Home, TargetFace, Processing, Result)
│   │   ├── domain/                # Models and Pipeline UseCases
│   │   └── data/                  # MediaCodec & MediaMuxer video pipeline
│   └── build.gradle.kts
│
├── native/                        # Performance-Critical C++ NDK Engine
│   ├── CMakeLists.txt             # NDK build script
│   └── native-lib.cpp             # SIMD face alignment and color transfer
│
├── models/                        # Model Registry & Licensing Documentation
│   └── README.md                  # Comprehensive redistribution & license audit
│
├── docs/                          # Architecture & Pipeline Specifications
│   └── ARCHITECTURE.md
│
├── .github/workflows/
│   └── android.yml                # Automated CI pipeline for tests, lint, and debug APK
│
├── src/                           # Interactive Web Applet for Preview & Browser Execution
└── README.md
```

---

## 4. Build Instructions

### Android Build Requirements
- **JDK:** Java 17+
- **Android SDK:** API Level 34 (compileSdk: 34, minSdk: 26)
- **Android NDK:** Version 25.1+ (CMake 3.22.1)
- **Android Studio:** Hedgehog (2023.1.1) or newer

### Building via Gradle
```bash
# Clone the repository
git clone https://github.com/reface-mobile/reface.git
cd reface

# Build Debug APK
./gradlew assembleDebug

# Output APK location:
# app/build/outputs/apk/debug/app-debug.apk
```

### Running the Web Preview App
```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## 5. Model Information & Licensing

| Component | Model | License | Commercial Use | Redistribution |
| :--- | :--- | :--- | :--- | :--- |
| **Face Detector** | BlazeFace (TFLite quantized) | Apache 2.0 | Allowed | Allowed |
| **Facial Landmarks** | Mobile Face Mesh | Apache 2.0 | Allowed | Allowed |
| **Face Representation** | Ghost-Lite Mobile | MIT / Apache 2.0 | Allowed | Allowed |

*Detailed licensing analysis available in [`models/README.md`](models/README.md).*

---

## 6. Responsible Use Notice

REFACE is built for legitimate creative video production.
- Only use images and videos you have consent and rights to modify.
- Do not use REFACE to impersonate, harass, or deceive people.
- Generated media contains an on-device watermark to ensure transparency.
