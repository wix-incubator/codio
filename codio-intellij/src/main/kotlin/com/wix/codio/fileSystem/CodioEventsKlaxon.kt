package com.wix.codio.fileSystem

import com.beust.klaxon.*
import com.intellij.openapi.util.TextRange
import com.intellij.util.toArray
import com.wix.codio.CodioTimelineData
import com.wix.codio.codioEvents.*
import frame.CodioFrameDocument
import java.awt.Rectangle
import kotlin.reflect.KClass

// -------------------------------------------------------------------------------------------------------------------
// Event class wrapper
// -------------------------------------------------------------------------------------------------------------------

class CodioEventTypeAdapter : TypeAdapter<CodioEvent> {
    override fun classFor(type: Any): KClass<out CodioEvent> = when (type as String) {
        "editor" -> CodioEditorChangedEvent::class
        "selection" -> CodioSelectionChangedEvent::class
        "visibleRange" -> CodioVisibleRangeChangedEvent::class
        "text" -> CodioSerializedTextEvent::class
        "caret" -> CodioCaretChangedEvent::class
        else -> throw IllegalArgumentException("Unknown type: $type")
    }
}

data class CodioEventWithType(
    @TypeFor(field = "data", adapter = CodioEventTypeAdapter::class)
    val type: String,
    val data: CodioEvent
)

// -------------------------------------------------------------------------------------------------------------------
// Custom Converters for non-Kotlin classes
// -------------------------------------------------------------------------------------------------------------------

@Target(AnnotationTarget.FIELD)
annotation class KlaxonRectangle

val rectangleConverter = object : Converter {

    override fun canConvert(cls: Class<*>) = cls == Rectangle::class.java

    override fun fromJson(jv: JsonValue): Rectangle {
        return Rectangle(jv.objInt("x"), jv.objInt("y"), jv.objInt("width"), jv.objInt("height"))
    }

    override fun toJson(value: Any): String {
        val rec = value as Rectangle
        return """
            { "x" : ${rec.x}, "y" : ${rec.y}, "width" : ${rec.width}, "height" : ${rec.height} }
        """.trimIndent()
    }
}

// -------------------------------------------------------------------------------------------------------------------

@Target(AnnotationTarget.FIELD)
annotation class KlaxonTextRanges

val textRangesConverter = object : Converter {

    override fun canConvert(cls: Class<*>) = cls == Array<TextRange>::class.java

    // todo: refactor me
    override fun fromJson(jv: JsonValue): Array<TextRange> {
        val trs = jv.array!!.mapChildren { TextRange(it.int("startOffset")!!, it.int("endOffset")!!) }
            .toArray(arrayOf())
        return trs.map { it!! }.toArray(arrayOf())
    }

    private fun textRangeToJson(tr: TextRange): String {
        return """
            { "startOffset" : ${tr.startOffset}, "endOffset" : ${tr.endOffset} }
        """.trimIndent()
    }

    override fun toJson(value: Any): String {
        val trs = value as Array<TextRange>
        val joined = trs.joinToString { textRangeToJson(it) }
        return "[ $joined ]"
    }
}

// -------------------------------------------------------------------------------------------------------------------
// Customized Klaxon wrapper
// -------------------------------------------------------------------------------------------------------------------


class CodioTimelineKlaxon {
    private fun serializeTextEvent(event: CodioTextChangedEvent) : CodioEventWithType {
        val serializedTextEvent = CodioSerializedTextEvent(event.time, event.path, listOf(CodioTextChange(event.range, event.value)))
        return CodioEventWithType("text", serializedTextEvent)
    }

    private val klaxon = Klaxon()
        .fieldConverter(KlaxonTextRanges::class, textRangesConverter)
        .fieldConverter(KlaxonRectangle::class, rectangleConverter)

    private fun toCodioEventWithType(event: CodioEvent): CodioEventWithType? = when (event) {
        is CodioEditorChangedEvent -> CodioEventWithType("editor", event)
        is CodioSelectionChangedEvent -> CodioEventWithType(
            "selection",
            event
        )
        is CodioVisibleRangeChangedEvent -> CodioEventWithType(
            "visibleRange",
            event
        )
        is CodioTextChangedEvent -> serializeTextEvent(event)
        is CodioCaretChangedEvent -> CodioEventWithType("caret", event)
        else -> null
    }

    fun toJson(timelineData: CodioTimelineData): String {
        val serializableEvents = timelineData.eventTimeline.map { toCodioEventWithType(it)  }
        val codioTimelineSerializable = CodioTimelineSerializable(timelineData.initialFrame, serializableEvents, timelineData.recordingLength )
        return klaxon.toJsonString(codioTimelineSerializable)
    }

    fun fromJson(json: String) : CodioTimelineData {
        var initialParse = klaxon.parse<CodioTimelineSerializable>(json)
        val eventTimeline = serializedTimelineEventsToIntellijEvents(initialParse!!.events)
        val result = CodioTimelineData(initialParse!!.initialFrame, eventTimeline, initialParse!!.recordingLength)
        return result
    }

    fun serializedTimelineEventsToIntellijEvents(events: List<CodioEventWithType?>) : List<CodioEvent>{
        return events.map { it!!.data }.map { e ->
            when (e) {
                is CodioSerializedTextEvent -> CodioTextChangedEvent(e.time, e.path, e.changes[0].range, e.changes[0].value)
                else -> e
            }
        }
    }
}

data class CodioTimelineSerializable(val initialFrame: List<CodioFrameDocument>, var events: List<CodioEventWithType?>, var recordingLength: Long)
