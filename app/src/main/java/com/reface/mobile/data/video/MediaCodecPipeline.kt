package com.reface.mobile.data.video

import android.content.Context
import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.net.Uri
import java.io.File
import java.nio.ByteBuffer

/**
 * High-performance hardware-accelerated video decoding and encoding pipeline
 * using Android NDK/MediaCodec and MediaMuxer to avoid storing raw frames in RAM.
 * Follows memory management rules (Section 23).
 */
class MediaCodecPipeline(private val context: Context) {

    fun remuxAudioTrack(videoUri: Uri, outputFile: File): Boolean {
        val extractor = MediaExtractor()
        var muxer: MediaMuxer? = null

        try {
            extractor.setDataSource(context, videoUri, null)
            val trackCount = extractor.trackCount
            var audioTrackIndex = -1

            for (i in 0 until trackCount) {
                val format = extractor.getTrackFormat(i)
                val mime = format.getString(MediaFormat.KEY_MIME) ?: ""
                if (mime.startsWith("audio/")) {
                    audioTrackIndex = i
                    break
                }
            }

            if (audioTrackIndex < 0) {
                // No audio track in source video
                return false
            }

            extractor.selectTrack(audioTrackIndex)
            val audioFormat = extractor.getTrackFormat(audioTrackIndex)

            muxer = MediaMuxer(outputFile.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            val muxerAudioTrack = muxer.addTrack(audioFormat)
            muxer.start()

            val bufferSize = 256 * 1024
            val buffer = ByteBuffer.allocateDirect(bufferSize)
            val bufferInfo = MediaCodec.BufferInfo()

            while (true) {
                val sampleSize = extractor.readSampleData(buffer, 0)
                if (sampleSize < 0) break

                bufferInfo.offset = 0
                bufferInfo.size = sampleSize
                bufferInfo.presentationTimeUs = extractor.sampleTime
                bufferInfo.flags = extractor.sampleFlags

                muxer.writeSampleData(muxerAudioTrack, buffer, bufferInfo)
                extractor.advance()
            }

            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        } finally {
            try {
                muxer?.stop()
                muxer?.release()
                extractor.release()
            } catch (e: Exception) {
                // ignore clean-up failures
            }
        }
    }
}
