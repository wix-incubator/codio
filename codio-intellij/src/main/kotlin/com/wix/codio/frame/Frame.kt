package frame

import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.OpenFileDescriptor
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.LocalFileSystem
import com.wix.codio.Utils
import com.wix.codio.codioEvents.*
import com.wix.codio.frame.InteracterContentHandler

class CodioFrame {
    val DEFAULT_COLUMN = 1
    var codioFrameDocuments = arrayListOf<CodioFrameDocument>()
    var interacterContent = arrayListOf<InteracterContentData>()
    var isInitial = false

    constructor(timeline: ArrayList<CodioEvent>, documents: ArrayList<CodioFrameDocument>, isInitial: Boolean) {
        this.isInitial = isInitial
        var lastActionCount = 0
        documents.mapTo(codioFrameDocuments) { it.copy() }
        interacterContent = InteracterContentHandler.getFrameInteracterContent(documents)
        timeline.forEach { event ->
            lastActionCount++
            if (event is CodioTextChangedEvent) {
                val frameDocument = getCodioFrameDocumentWith(event.path)
                if (frameDocument == null) {
                    println("probably a refactor, still not supported")
                } else {
                    val startOffset = Utils.findOffsetFromPosition(event.range[CodioRangeStartIndex], frameDocument.text)
                    val endOffset = Utils.findOffsetFromPosition(event.range[CodioRangeEndIndex], frameDocument.text)
                    frameDocument.text = frameDocument.text.replaceRange(startOffset, endOffset, event.value)
                    frameDocument.lastActionCount = lastActionCount
                }
            } else if (event is CodioEditorChangedEvent) {
               val frameDocument =  codioFrameDocuments.find { document -> document.path == event.path }
                frameDocument?.lastActionCount = lastActionCount
            }
        }
        InteracterContentHandler.addInteracaterContentToFrame(codioFrameDocuments, interacterContent)
        if (!isInitial) {
            codioFrameDocuments.sortBy { codioFrameDocument ->  codioFrameDocument.lastActionCount}
        }
    }

    fun apply(project: Project) {
        val documentsCount = codioFrameDocuments.count()
        codioFrameDocuments.forEachIndexed { index, codioFrameDocument ->
            println("**** frame path: ${codioFrameDocument.path}, text: ${codioFrameDocument.text}")
            val file = LocalFileSystem.getInstance().findFileByPath(codioFrameDocument.path)
            val fileDescriptor = OpenFileDescriptor(project, file!!)
            val shouldFocus =  index + 1 === documentsCount
            if (isInitial) {
                if (shouldFocus) {
                    val fileDescriptor = OpenFileDescriptor(project, file!!)
                    val codioAction = Runnable { FileEditorManager.getInstance(project!!).openEditor(fileDescriptor, true) }
                    WriteCommandAction.runWriteCommandAction(project, codioAction)
                }
            } else {
                val codioAction = Runnable { FileEditorManager.getInstance(project!!).openEditor(fileDescriptor, shouldFocus) }
                WriteCommandAction.runWriteCommandAction(project, codioAction)
            }
            Utils.overrideEditorText(project, file, codioFrameDocument.text)
        }
    }

    fun getCodioFrameDocumentWith(path: String) : CodioFrameDocument? {
        val frameDocument = codioFrameDocuments.find { codioFrameDocument: CodioFrameDocument ->
            println("frame path is: ${codioFrameDocument.path } actual path is: $path")
            codioFrameDocument.path == path }
        return frameDocument
    }
}

data class InteracterContentData(val text: String, val path: String)
data class CodioFrameDocument(var text: String, val path: String, var column: Int, var lastActionCount: Int)