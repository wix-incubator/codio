package com.wix.codio

import com.intellij.openapi.project.Project
import com.sun.org.apache.xpath.internal.operations.Bool
import com.wix.codio.CodioProgressTimer
import com.wix.codio.CodioProgressTimerOnFinishObserver
import com.wix.codio.CodioTimeline
import com.wix.codio.actions.CodioNotifier
import com.wix.codio.codioEvents.CodioEvent
import com.wix.codio.codioEvents.CodioEventsDispatcher
import com.wix.codio.fileSystem.CodioProjectFileSystemHandler
import com.wix.codio.fileSystem.FileSystemManager
import com.wix.codio.userInterface.Messages
import frame.CodioFrame
import frame.CodioFrameDocument
import java.time.Instant
import java.util.*

open class Player {
    var project: Project? = null
    var isPlaying = false;

    companion object {
        val instance = Player()
    }

    private var codioTimeline: CodioTimeline? = null
    var codioId: String? = null
    private var codioEventDispatcher: CodioEventsDispatcher? = null
    private var codioFileSystemHandler: CodioProjectFileSystemHandler? = null
    private var audioPath: String? = null
    private var initialFrame: ArrayList<CodioFrameDocument>? = null
    internal var absoluteStartTime: Long = 0
    private var codioRelativeActiveTime: Long = 0
    private val timer = Timer()
    private var recordingLength: Long = 0
    private var progressTimer: CodioProgressTimer? = null

    private var currentTimerTask: TimerTask? = null;

    fun loadCodio(codioId: String, project: Project) {
        codioFileSystemHandler = FileSystemManager.getProjectFileSystemHandler(project)
        this.codioId = codioId
        this.codioTimeline = codioFileSystemHandler!!.loadCodioTimeline(codioId, project.basePath!!)
        this.initialFrame = codioTimeline!!.initialFrame
        this.recordingLength = codioTimeline!!.recordingLength
        this.audioPath = codioFileSystemHandler!!.getCodioAudioPath(codioId)
        this.project = project
        this.codioEventDispatcher = CodioEventsDispatcher(project!!)

        this.absoluteStartTime = 0
        this.isPlaying = false
        this.progressTimer = CodioProgressTimer(this.recordingLength);
        CodioProgressTimer.onFinish(object : CodioProgressTimerOnFinishObserver() {
            override fun run() {
                pause()
            }
        })
    }

    fun playCodio() {
        this.playFrom(0)
    }

    private fun timeInSeconds(milis: Long): Long {
        if (milis == 0L) return milis
        return milis / 1000
    }

    fun checkIfFfmpegExist() : Boolean{
        try {
            Runtime.getRuntime().exec("/usr/local/bin/ffmpeg -version")
            return true;
        } catch(ex: Exception) {
            return false;
        }
    }

    private fun play(timeline: ArrayList<CodioEvent>, relativeTimeToStart: Long) {
        val isFfmpegExist = checkIfFfmpegExist();
        if (isFfmpegExist) {
            isPlaying = true
            absoluteStartTime = Instant.now().toEpochMilli()
            val timeline = CodioTimeline.createTimelineWithAbsoluteTime(timeline, absoluteStartTime)
            this.runThroughCodioEvents(timeline)
            val timeInSeconds = timeInSeconds(relativeTimeToStart).toInt()
            Audio.instance.play(audioPath!!, timeInSeconds)
            progressTimer?.run(timeInSeconds)
        } else CodioNotifier(project).showTempBaloon(Messages.ffmpegNotInstalled, 8000)
    }

    fun pause() {
        if (isPlaying) {
            isPlaying = false
            println("pausing current codio")
            val lastStoppedTime = Instant.now().toEpochMilli()
            Audio.instance.pause()
            currentTimerTask?.cancel()
            codioRelativeActiveTime += (lastStoppedTime - absoluteStartTime);
            // remove selection
            progressTimer?.stop()
        }
    }

    fun rewind() {
        if (isPlaying) {
            pause()
        }
        var timeToRewind = codioRelativeActiveTime - 10 * 1000
        if (timeToRewind < 0) {
            timeToRewind = 0L
        }
        playFrom(timeToRewind)
    }

    fun forward() {
        if (isPlaying) {
            pause()
        }

        val timeToForward = codioRelativeActiveTime + 10 * 1000
        if (timeToForward > recordingLength) {
            //TODO: set upper limit (if time is behind total time, don't do anything.)
            playFrom(recordingLength)
        } else {
            playFrom(timeToForward)
        }
    }

    fun resume() {
        if (codioRelativeActiveTime > recordingLength) {
            playFrom(0)
        } else {
            playFrom(codioRelativeActiveTime)
        }
    }

    fun playFrom(relativeTimeToStart: Long) {
        if (isPlaying) {
            Audio.instance.pause()
            currentTimerTask?.cancel()
            progressTimer?.stop()
        }
        moveToframe(relativeTimeToStart)
        codioRelativeActiveTime = relativeTimeToStart
        val relevantRelativeTimeline = codioTimeline!!.getTimelineFrom(relativeTimeToStart)
        play(relevantRelativeTimeline, relativeTimeToStart)
    }

    fun moveToframe(milis: Long) {
        val isInitial = milis == 0L
        val timelineBefore = CodioTimeline.instance.getTimelineUntil(milis)
        val frame = CodioFrame(timelineBefore, initialFrame!!, isInitial)
        println(frame.codioFrameDocuments.toString())
        frame.apply(project!!)
    }

    internal fun runThroughCodioEvents(codioEvents: ArrayList<CodioEvent>) {
        if (codioEvents.isEmpty()) {
            return
        } else {
            val codioEvent = codioEvents[0]
            val now = Instant.now().toEpochMilli()
            currentTimerTask = object : TimerTask() {
                override fun run() {
                    codioEventDispatcher!!.dispatch(codioEvent)
                    codioEvents.removeAt(0)
                    runThroughCodioEvents(codioEvents)
                }
            }
            if (codioEvent.time - now > 0) {
                timer.schedule(currentTimerTask, codioEvent.time - now)
            } else {
                timer.schedule(currentTimerTask, 1)
            }
        }
    }
}