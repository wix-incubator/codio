package com.wix.codio.codioEvents

import com.intellij.execution.runners.ExecutionEnvironment
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.LogicalPosition
import com.intellij.openapi.editor.event.CaretEvent
import com.intellij.openapi.editor.event.DocumentEvent
import com.intellij.openapi.editor.event.SelectionEvent
import com.intellij.openapi.editor.event.VisibleAreaEvent
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditorManagerEvent
import com.intellij.util.Range
import frame.CodioFile
import frame.CodioFrame
import frame.CodioFrameDocument
import java.awt.Point
import java.time.Instant

data class CodioPosition(val line: Int, val character: Int);
//data class CodioRange(val start: CodioPosition, val end: CodioPosition);
typealias CodioRange = List<CodioPosition>
const val CodioRangeStartIndex = 0
const val CodioRangeEndIndex = 1
class CodioEventsCreator() {
    private fun findPosition(document: Document, offset: Int) : CodioPosition{
        val lineNumber = document.getLineNumber(offset);
        val lineStartOffset = document.getLineStartOffset(lineNumber)
        val character = offset - lineStartOffset
        return CodioPosition(lineNumber, character)
    }

    private fun findCodiRangeWithOffsetAndLength(document: Document, offset: Int, length: Int) : CodioRange {
        val startPosition = findPosition(document, offset)
        val endPosition = findPosition(document, offset+length)
        return listOf(startPosition, endPosition)
    }

    fun createTextChangedEvent (event: DocumentEvent) : CodioEvent? {
        val time = Instant.now().toEpochMilli()
        val offset = event.offset
        val newFragment = event.newFragment.toString()
        val oldLength = event.oldLength
        val document = event.document
        val range = findCodiRangeWithOffsetAndLength(document, offset, oldLength)
        val path = FileDocumentManager.getInstance().getFile(event.document)?.path
        if (path == null) {
            println("it is null with... ${event.document.text}")
            return null
        }
        if (FileDocumentManager.getInstance().getFile(event.document)!!.isInLocalFileSystem) {
            val codioEvent =
                CodioTextChangedEvent(time, path, range, newFragment)
            return codioEvent
        }
        return null
    }

    fun createSelectionChangedEvent (editor: Editor) : CodioSelectionChangedEvent?{
        val time = Instant.now().toEpochMilli()
        val path = FileDocumentManager.getInstance().getFile(editor.document)?.path ?: return null;
        try {
            val selection: List<CodioRange> = editor.caretModel.caretsAndSelections.map { caretState -> listOf(
                CodioPosition(caretState.selectionStart!!.line, caretState.selectionStart!!.column),
                CodioPosition(caretState.selectionEnd!!.line, caretState.selectionEnd!!.column)
            )}
            println("caretSelection ${editor.caretModel.caretsAndSelections}")
            val codioEvent = CodioSelectionChangedEvent(time, path, selection)
            println(codioEvent.toString())
            return codioEvent
        } catch (e: Exception) {
            return null
        }
    }

    fun createExecutionEvent (path: String, executorId: String, executionEnvironment: ExecutionEnvironment) : CodioExecutionEvent?{
        val time = Instant.now().toEpochMilli()
        try {
            val configurationId = executionEnvironment.runnerAndConfigurationSettings?.uniqueID ?: return null
            return CodioExecutionEvent(time, path, executorId, configurationId)
        } catch (e: Exception) {
            return null
        }
    }

    fun createVisibleRangeChangedEvent (e: VisibleAreaEvent) : CodioVisibleRangeChangedEvent? {
        val time = Instant.now().toEpochMilli()
        val rec = e.newRectangle
        val oldRec = e.oldRectangle

        if (!rec.equals(oldRec)) {
            val startLogicalPosition = e.editor.xyToLogicalPosition(Point(e.newRectangle.x, e.newRectangle.y))
            val endLogicalPosition = e.editor.xyToLogicalPosition(Point(e.newRectangle.x + e.newRectangle.width, e.newRectangle.y + e.newRectangle.height))
            val codioRange = listOf(
                CodioPosition(startLogicalPosition.line, startLogicalPosition.column),
                CodioPosition(endLogicalPosition.line, endLogicalPosition.column)
            )
            println("logicalPosition: ($startLogicalPosition, $endLogicalPosition")
            val path = FileDocumentManager.getInstance().getFile(e.getEditor().getDocument())?.path ?: return null
            e.editor.scrollingModel.horizontalScrollOffset
            val codioEvent = CodioVisibleRangeChangedEvent(time, path, codioRange)
            return codioEvent
        } else {
            return null
        }
        // x is horizontal scroll, y is vertical, both start at 0
    }

    fun createEditorChangedEvent (event: FileEditorManagerEvent, recordedFiles: ArrayList<CodioFrameDocument>) : CodioEditorChangedEvent {
        val time = Instant.now().toEpochMilli()
        val path = event.newFile!!.path
        var isInitial = false
        var initialContent = ""
        if (recordedFiles.find { codioFile -> codioFile.path == path } == null) {
            var document: Document? = null;
            ApplicationManager.getApplication()
                .runReadAction { document = FileDocumentManager.getInstance().getDocument(event.newFile!!) }

            if (document != null) {
                if (FileDocumentManager.getInstance().getFile(document!!)!!.isInLocalFileSystem) {

                }
                isInitial = true
                initialContent = document!!.getText()
                recordedFiles.add(CodioFrameDocument(initialContent, path, 1, 0))
            }
        }

        val codioEvent = CodioEditorChangedEvent(time, path, isInitial, initialContent)
        return codioEvent
    }

}