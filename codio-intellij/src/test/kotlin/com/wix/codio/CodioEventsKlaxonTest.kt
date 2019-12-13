package com.wix.codio

import com.intellij.openapi.util.TextRange
import com.wix.codio.codioEvents.*
import com.wix.codio.fileSystem.CodioTimelineKlaxon
import frame.CodioFrameDocument
import org.junit.Test
import java.awt.Rectangle
import kotlin.test.assertEquals

class CodioEventsKlaxonTest {

    private fun aRectangle(): Rectangle = Rectangle(0, 0, 10, 10)

    private fun aTextRange(): TextRange = TextRange(0, 0)

    private fun aCodioEditorChangedEvent(): CodioEditorChangedEvent =
        CodioEditorChangedEvent(time = 0, path = "a/b/c", isInitial = true, initialContent = "myInitialContent")

    private fun aCodioSelectionChangedEvent(): CodioSelectionChangedEvent =
        CodioSelectionChangedEvent(time = 0, path = "a/b/c", ranges = arrayOf(aTextRange(), aTextRange()))

    private fun aCodioVisibleRangeChangedEvent(): CodioVisibleRangeChangedEvent =
        CodioVisibleRangeChangedEvent(time = 0, path = "a/b/c", rec = aRectangle())

    private fun aCodioTextChangedEvent(): CodioTextChangedEvent =
        CodioTextChangedEvent(
            time = 0,
            path = "a/b/c",
            offset = 0,
            newLength = 1,
            oldLength = 1,
            newFragment = "asddd"
        )

    private fun aCodioCaretChangedEvent(): CodioCaretChangedEvent =
        CodioCaretChangedEvent(time = 0, path = "a/b/c", startOffset = 1, endOffset = 2)

    @Test
    fun testTimelineJson() {
        val codioKlaxon = CodioTimelineKlaxon()
        val eventsList = ArrayList<CodioEvent>()

        eventsList.add(CodioTextChangedEvent(time=771, path="/Users/eladbo/Documents/PluginWithJavaFX/src/main/java/HelloWorld.java", offset=1300, newLength=1, oldLength=0, newFragment="a"))
        eventsList.add(aCodioEditorChangedEvent())
        eventsList.add(aCodioTextChangedEvent())
        eventsList.add(aCodioTextChangedEvent())
        eventsList.add(aCodioCaretChangedEvent())

        val events = eventsList.toList()
        val initialFrame = listOf<CodioFrameDocument>(CodioFrameDocument("some text", "some path", 1, 0))
        val codioTimelineData = CodioTimelineData(initialFrame, events, recordingLength = 1000)
        val json = codioKlaxon.toJson(codioTimelineData)
        val actual = codioKlaxon.fromJson(json)
        assertEquals(actual, codioTimelineData)
    }
}