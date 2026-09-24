package com.reface.mobile.domain.model

import android.graphics.Bitmap
import android.graphics.RectF
import android.net.Uri

data class FacialLandmarks(
    val leftEye: Pair<Float, Float>,
    val rightEye: Pair<Float, Float>,
    val nose: Pair<Float, Float>,
    val mouthLeft: Pair<Float, Float>,
    val mouthRight: Pair<Float, Float>,
    val chin: Pair<Float, Float>
)

data class DetectedFace(
    val id: String,
    val label: String,
    val confidence: Float,
    val boundingBox: RectF,
    val landmarks: FacialLandmarks,
    val thumbnailBitmap: Bitmap? = null
)

data class SourceFace(
    val uri: Uri,
    val bitmap: Bitmap,
    val detectedFace: DetectedFace?,
    val isValid: Boolean,
    val message: String
)

data class TargetVideo(
    val uri: Uri,
    val durationMs: Long,
    val width: Int,
    val height: Int,
    val fps: Int,
    val hasAudio: Boolean
)

sealed class ProcessingState {
    object Idle : ProcessingState()
    data class Preparing(val message: String = "Preparing video...") : ProcessingState()
    data class Detecting(val frame: Int, val total: Int) : ProcessingState()
    data class Tracking(val frame: Int, val total: Int) : ProcessingState()
    data class Blending(val frame: Int, val total: Int, val percent: Int) : ProcessingState()
    data class Encoding(val frame: Int, val total: Int) : ProcessingState()
    data class RestoringAudio(val message: String = "Restoring original audio...") : ProcessingState()
    data class Completed(val outputUri: Uri, val durationMs: Long) : ProcessingState()
    data class Error(val message: String) : ProcessingState()
}
