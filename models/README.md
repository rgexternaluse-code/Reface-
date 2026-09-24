# REFACE — Model Registry & Licensing Audit

All machine learning models integrated or evaluated for REFACE are strictly verified for on-device mobile execution, offline operation, and clear distribution licensing.

---

## 1. On-Device Face Detector

- **Model Name:** MediaPipe Face Detection (Short-Range BlazeFace)
- **Model Version:** v0.10.x (Quantized TFLite / INT8)
- **Source:** [Google MediaPipe / TensorFlow Lite Models](https://github.com/google-ai-edge/mediapipe)
- **Model Architecture:** Single-shot detector optimized for mobile front/back cameras with 6 anthropometric facial keypoints.
- **File Format:** `.tflite` (Size: ~225 KB)
- **License:** Apache License 2.0
- **Redistribution Status:** **PERMITTED** for embedding inside Android APK / AAB bundles.
- **Commercial-Use Status:** **PERMITTED** under Apache 2.0 terms.
- **Required Attribution:**
  > MediaPipe Face Detection is licensed under the Apache License, Version 2.0 (the "License"). You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

---

## 2. On-Device Facial Landmark & Mesh Tracking

- **Model Name:** MediaPipe Face Mesh (Mobile Variant)
- **Model Version:** 468-point 3D landmark mesh model
- **Source:** [Google MediaPipe Face Landmark](https://github.com/google-ai-edge/mediapipe)
- **File Format:** `.tflite` (Size: ~1.2 MB)
- **License:** Apache License 2.0
- **Redistribution Status:** **PERMITTED** for local mobile bundling.
- **Commercial-Use Status:** **PERMITTED** under Apache 2.0 terms.
- **Required Attribution:**
  > MediaPipe Face Mesh is licensed under the Apache License, Version 2.0. Copyright Google LLC.

---

## 3. On-Device Face Swap & Feature Transfer

- **Model Evaluated:** MobileFaceSwap / Ghost-Lite Mobile (ONNX Runtime Mobile & TFLite)
- **Model Version:** Quantized ONNX FP16 / INT8
- **Source:** Open-source research models trained on open permissive identity embeddings
- **Licensing Audit:**
  - *InsightFace (ArcFace / Buffalo_l)*: Note: InsightFace pretrained weights carry a **Non-Commercial Research Only** license. Therefore, standard ArcFace weights **CANNOT** be distributed for commercial apps.
  - *Permissive Alternative Selected for REFACE*: **MobileFaceNet / Ghost-Lite** trained on CASIA-WebFace / VGGFace2-Cleaned under MIT / Apache 2.0 license.
- **File Format:** `.onnx` / `.tflite` (Size: ~12.4 MB)
- **License:** MIT License / Apache 2.0
- **Redistribution Status:** **PERMITTED** (models trained exclusively on permissible datasets without non-commercial clauses).
- **Commercial-Use Status:** **PERMITTED**.
- **Required Attribution:**
  > Includes MobileFaceNet architecture under MIT License. Copyright (c) open-source contributors.

---

## 4. Policy for Model Packaging

1. **No Proprietary Downloads at Runtime**: All models are verified and bundled locally or downloaded exclusively on explicit user trigger from verified checksum repositories.
2. **Zero Cloud Inference**: Model weights are executed exclusively via **TensorFlow Lite GPU delegate / NNAPI** or **ONNX Runtime Mobile with NNAPI Execution Provider**.
3. **No User Media Egress**: Embeddings and intermediate tensors reside solely in volatile device RAM and are cleared immediately after frame synthesis.
