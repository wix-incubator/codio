package com.wix.codio

import com.wix.codio.codioEvents.CodioEvent
import frame.CodioFrameDocument
import java.nio.file.Paths
import kotlin.collections.ArrayList

class CodioTimeline {

    var codioId : String? = null
    var eventTimeline = ArrayList<CodioEvent>()
        internal set

    var initialFrame = ArrayList<CodioFrameDocument>()
    var recordingLength: Long = 0


    companion object {
        val instance = CodioTimeline()

        fun substractTimeFromTimeline(timeline: ArrayList<CodioEvent>, time: Long) : ArrayList<CodioEvent> {
            var result = ArrayList<CodioEvent>()
            timeline.mapTo(result) { codioEvent ->
                val newTime = codioEvent.time - time
                codioEvent.copyEventWithModifiedTime(newTime) }
            return result
        }

        fun addTimeToTimeline(timeline: ArrayList<CodioEvent>, time: Long) : ArrayList<CodioEvent> {
            var result = ArrayList<CodioEvent>()
            timeline.mapTo(result) { codioEvent: CodioEvent ->
                val newTime = codioEvent.time + time
                codioEvent.copyEventWithModifiedTime(newTime)
            }
            return result
        }

        fun createTimelineWithAbsoluteTime (timeline: ArrayList<CodioEvent>, time: Long) : ArrayList<CodioEvent> {
            return addTimeToTimeline(timeline, time)
        }

        private fun getAbsolute(basePath: String, relativePath: String): String =
            Paths.get(basePath, relativePath).toString()

        private fun getRelative(basePath: String, absolutePath: String): String =
            Paths.get(basePath).relativize(Paths.get(absolutePath)).toString()

        fun transformTimelineToRelativePath(basePath: String, timelineData: CodioTimelineData) : CodioTimelineData {
            var initialFrameWithRelative = ArrayList<CodioFrameDocument>()
            var eventTimelineWithRelative = ArrayList<CodioEvent>()
            timelineData.initialFrame.mapTo(initialFrameWithRelative) { it.copy(path = getRelative(basePath, it.path)) }
            timelineData.eventTimeline.mapTo(eventTimelineWithRelative) { it.copyEventWithModifiedPath(path = getRelative(basePath, it.path)) }
            return CodioTimelineData(initialFrameWithRelative, eventTimelineWithRelative, timelineData.recordingLength)
        }

        fun transformTimelineToAbsolutePath(basePath: String, timelineData: CodioTimelineData) : CodioTimelineData {
            var initialFrameWithAbsolute = ArrayList<CodioFrameDocument>()
            var eventTimelineWithAbsolute = ArrayList<CodioEvent>()
            timelineData.initialFrame.mapTo(initialFrameWithAbsolute) { it.copy(path = getAbsolute(basePath, it.path)) }
            timelineData.eventTimeline.mapTo(eventTimelineWithAbsolute) { it.copyEventWithModifiedPath(path = getAbsolute(basePath, it.path)) }
            return CodioTimelineData(initialFrameWithAbsolute, eventTimelineWithAbsolute, timelineData.recordingLength)
        }

    }

    fun getTimelineData() : CodioTimelineData{
        return CodioTimelineData(initialFrame.toList(), eventTimeline.toList(), recordingLength)
    }

    internal fun addToCodioList(event: CodioEvent) {
        eventTimeline.add(event)
    }

    internal fun clearTimeline() {
        eventTimeline.clear()
    }

    internal fun getTimelineFrom(time: Long): ArrayList<CodioEvent> {
        val result = arrayListOf<CodioEvent>()
        eventTimeline.filter { codioEvent -> codioEvent.time > time }.mapTo(result) { codioEvent -> codioEvent.copyEventWithModifiedTime(codioEvent.time - time) }
        return result
    }

    internal fun getTimelineUntil(time: Long): ArrayList<CodioEvent> {
        val result = arrayListOf<CodioEvent>()
        eventTimeline.filterTo(result) { codioEvent -> codioEvent.time < time }
        return result
    }


    internal fun changeTimesToRelative(absoluteStartTime: Long) {
        eventTimeline = substractTimeFromTimeline(eventTimeline, absoluteStartTime)
    }

}

data class CodioTimelineData(val initialFrame: List<CodioFrameDocument>, val eventTimeline: List<CodioEvent>, val recordingLength: Long)