package com.wix.codio.codioEvents

import com.intellij.execution.ExecutorRegistry
import com.intellij.execution.ProgramRunnerUtil
import com.intellij.execution.RunManager
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.LogicalPosition
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.OpenFileDescriptor
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.TextRange
import com.intellij.openapi.vfs.LocalFileSystem
import com.wix.codio.Utils
import userInterface.SelectionRenderer

class CodioEventsDispatcher(val project: Project) {

    fun dispatch(event: CodioEvent) {
        when (event) {
            is CodioTextChangedEvent -> dispatchTextChangedEvent(event)
            is CodioSelectionChangedEvent -> dispatchSelectionChangedEvent(event)
            is CodioVisibleRangeChangedEvent -> dispatchVisibleRangeChangedEvent(event)
            is CodioEditorChangedEvent -> dispatchEditorChangedEvent(event)
            is CodioExecutionEvent -> dispatchCodioExecutionEvent(event)
        }
    }

    private fun getPositionOffset(position: CodioPosition, document: Document) : Int {
        val lineOffset = document.getLineStartOffset(position.line)
        return lineOffset + position.character
    }

    private fun getOffsets(range: CodioRange, document: Document?) : TextRange? {
            document ?: null;
            val (startPosition, endPosition) = range
            val startOffset = getPositionOffset(startPosition, document!!)
            val endOffset = getPositionOffset(endPosition, document!!)
            return TextRange(startOffset, endOffset)
    }

    fun dispatchCodioExecutionEvent(codioEvent: CodioExecutionEvent) {
        try {
            val runConfigurations = RunManager.getInstance(project!!).allSettings;
            val matchingConfig = runConfigurations.find { config -> config.uniqueID == codioEvent.configurationId}
            val executor = ExecutorRegistry.getInstance().getExecutorById(codioEvent.executorId)
            val codioAction = Runnable {
                ProgramRunnerUtil.executeConfiguration(matchingConfig!!, executor);
            }
            WriteCommandAction.runWriteCommandAction(project, codioAction)
        } catch (e: Error) {
            println(e)
        }
    }

    fun dispatchTextChangedEvent(codioEvent: CodioTextChangedEvent) {
        try {
            var currentDoc: Document? = null
            val file = LocalFileSystem.getInstance().findFileByPath(codioEvent.path)
            ApplicationManager.getApplication()
                .runReadAction { currentDoc = FileDocumentManager.getInstance().getDocument(file!!) }
            val textRange: TextRange = getOffsets(codioEvent.range, currentDoc) ?: return
            val codioAction: Runnable
            codioAction = Runnable {
                currentDoc!!.replaceString(
                    textRange.startOffset,
                    textRange.endOffset,
                    codioEvent.value
                )
            }
            WriteCommandAction.runWriteCommandAction(project, codioAction)
        } catch (ex: Exception) {
            ex.printStackTrace()
        }

    }

    fun dispatchSelectionChangedEvent(codioEvent: CodioSelectionChangedEvent) {
        var currentDoc: Document? = null
        val file = LocalFileSystem.getInstance().findFileByPath(codioEvent.path)
        ApplicationManager.getApplication()
            .runReadAction { currentDoc = FileDocumentManager.getInstance().getDocument(file!!) }
        val selections: List<TextRange> = codioEvent.selection.map { getOffsets(it, currentDoc) ?: return }
        val cursorRenderer = SelectionRenderer(selections)
        val currentEditor = Utils.getCurrentEditor(project, codioEvent)

        val codioAction = Runnable { cursorRenderer.renderCursor(currentEditor!!) }
        if (currentEditor != null)
            WriteCommandAction.runWriteCommandAction(project, codioAction)
    }

    fun dispatchVisibleRangeChangedEvent(codioEvent: CodioVisibleRangeChangedEvent) {
        val currentEditor = Utils.getCurrentEditor(project, codioEvent) ?: return

        val codioAction = Runnable {
            val point = currentEditor.logicalPositionToXY(LogicalPosition(codioEvent.visibleRange[CodioRangeStartIndex].line, codioEvent.visibleRange[CodioRangeStartIndex].character))
            currentEditor.scrollingModel.scroll(point.x, point.y)
        }
        WriteCommandAction.runWriteCommandAction(project, codioAction)

    }

    fun dispatchEditorChangedEvent(codioEvent: CodioEditorChangedEvent) {
        val codioAction: Runnable
        val path = codioEvent.path
        val file = LocalFileSystem.getInstance().findFileByPath(path)
        val fileDescriptor = OpenFileDescriptor(project!!, file!!)
        codioAction = Runnable { FileEditorManager.getInstance(project!!).openEditor(fileDescriptor, true) }
        WriteCommandAction.runWriteCommandAction(project, codioAction)
    }
}