package com.wix.codio.codioEvents


import com.wix.codio.fileSystem.KlaxonRectangle
import com.wix.codio.fileSystem.KlaxonTextRanges
import com.intellij.openapi.util.TextRange
import java.awt.Rectangle

abstract class CodioEvent {
    abstract val time: Long
    abstract val path: String
    abstract fun copyEventWithModifiedTime(time: Long) : CodioEvent
    abstract fun copyEventWithModifiedPath(path: String) : CodioEvent
}

    data class CodioEditorChangedEvent(override val time: Long,
                                       override val path: String,
                                       val isInitial: Boolean,
                                       val initialContent: String): CodioEvent() {
    override fun copyEventWithModifiedTime(time: Long) : CodioEditorChangedEvent {
        return this.copy(time = time)
    }
    override fun copyEventWithModifiedPath(path: String) : CodioEditorChangedEvent {
        return this.copy(path = path)
    }
}

data class CodioSelectionChangedEvent(override val time: Long, override val path: String,  val selection: List<CodioRange>) : CodioEvent() {
    override fun copyEventWithModifiedTime(time: Long): CodioSelectionChangedEvent {
        return this.copy(time = time)
    }
    override fun copyEventWithModifiedPath(path: String): CodioSelectionChangedEvent {
        return this.copy(path = path)
    }
}

data class CodioVisibleRangeChangedEvent(override val time: Long, override val path: String, val visibleRange: CodioRange): CodioEvent() {
    override fun copyEventWithModifiedTime(time: Long): CodioVisibleRangeChangedEvent {
        return this.copy(time = time)
    }
    override fun copyEventWithModifiedPath(path: String): CodioVisibleRangeChangedEvent {
        return this.copy(path = path)
    }
}

data class CodioTextChangedEvent(override val time: Long,
                                 override val path: String,
                                 val range: CodioRange,
                                 val value: String ): CodioEvent() {
    override fun copyEventWithModifiedTime(time: Long): CodioTextChangedEvent{
        return this.copy(time = time)
    }
    override fun copyEventWithModifiedPath(path: String): CodioTextChangedEvent{
        return this.copy(path = path)
    }
}

data class CodioTextChange(val range: CodioRange, val value: String)
data class CodioSerializedTextEvent(override val time: Long,
                                    override val path: String,
                                    val changes: List<CodioTextChange>) : CodioEvent() {
    override fun copyEventWithModifiedTime(time: Long): CodioSerializedTextEvent {
        return this.copy(time = time)
    }
    override fun copyEventWithModifiedPath(path: String): CodioSerializedTextEvent {
        return this.copy(path = path)
    }
}

data class CodioCaretChangedEvent(override val time: Long,
                                  override val path: String,
                                  val startOffset: Int,
                                  val endOffset: Int) : CodioEvent() {
    override fun copyEventWithModifiedTime(time: Long) : CodioCaretChangedEvent {
        return this.copy(time = time)
    }
    override fun copyEventWithModifiedPath(path: String) : CodioCaretChangedEvent {
        return this.copy(path = path)
    }
}