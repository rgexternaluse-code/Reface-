# REFACE — Architecture Documentation

## Core Architectural Principle
**100% On-Device Processing**: No media, extracted video frame, facial embedding, or temporary intermediate buffer is ever transmitted over any network.

```
       SOURCE FACE IMAGE
               +
          TARGET VIDEO
               ↓
    [ 1. Media Inspection ]
   (Validate codec, FPS, size)
               ↓
  [ 2. Source Face Detection ]
 (Local landmarks, affine normal)
               ↓
  [ 3. Target Face Detection ]
  (Scan keyframes for targets)
               ↓
  [ 4. Multi-Face Selection ]
  (User chooses target face ID)
               ↓
   [ 5. Sequential Pipeline ]
   (Decode 1 Frame -> Swap -> Encode 1 Frame)
               ↓
 [ 6. Audio Stream Remuxing ]
 (Preserves original soundtrack)
               ↓
    [ 7. Gallery Export ]
 (MediaStore API without broad perms)
```

## Memory Management Strategy (Section 23)
Mobile devices have strict heap limits. Storing uncompressed 1080p frames in memory causes `OutOfMemoryError`.
- **Streaming Pipeline**: Decodes a single video frame via hardware `MediaCodec`, runs alignment and blending in native memory, pushes to the hardware video encoder, and immediately releases the buffer.
- **Tracking Optimization (Section 14)**: Full detection runs once every 10–15 frames; inter-frame motion is tracked via smoothed Kalman/EMA bounding box interpolation.

## Native C++ NDK Engine
Critical math operations (affine transformation matrix, color temperature matching, and seamless Gaussian/alpha boundary blending) are implemented in C++17 (`/native/native-lib.cpp`) with SIMD compiler flags (`-O3 -ffast-math`).
