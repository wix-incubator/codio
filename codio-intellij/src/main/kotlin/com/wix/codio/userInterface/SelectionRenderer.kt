package userInterface

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.ex.EditorEx
import com.intellij.openapi.editor.markup.CustomHighlighterRenderer
import com.intellij.openapi.editor.markup.HighlighterTargetArea
import com.intellij.openapi.editor.markup.RangeHighlighter
import com.intellij.openapi.editor.markup.TextAttributes
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.TextRange
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.ui.JBColor
import com.wix.codio.Utils
import com.wix.codio.exceptions.CodioEventDispatchException
import frame.CodioFrame
import frame.CodioFrameDocument
import org.w3c.dom.ranges.Range
import java.awt.Color

class SelectionRenderer constructor( internal var ranges: List<TextRange>) {
    internal fun renderCursor(editor: EditorEx) {
        val textAttributes = TextAttributes()
        textAttributes.backgroundColor = Color(230,230,250)
        val model = editor.markupModel
        model.removeAllHighlighters()
        ranges.forEach { textRange ->
            textRange.startOffset
            textRange.endOffset

            val rangeHighlighter = model.addRangeHighlighter(
                textRange.startOffset,
                textRange.endOffset,
                123432355,
                textAttributes,
                HighlighterTargetArea.EXACT_RANGE
            )
            val renderer = CustomHighlighterRenderer { editorToRender, highlighter, g ->
                g.color = JBColor.BLUE;
                val point = editorToRender.logicalPositionToXY(editorToRender.offsetToLogicalPosition(highlighter.startOffset))
                val pointEnd = editorToRender.logicalPositionToXY(editorToRender.offsetToLogicalPosition(highlighter.endOffset))
                g.drawRect(point.x, point.y, pointEnd.x - point.x, editorToRender.lineHeight + 1)
            }
            rangeHighlighter.customRenderer = renderer
        }
    }

    companion object{
      fun removeAllCursorRenderings(project: Project, frame: ArrayList<CodioFrameDocument>) {
        frame.forEach { frameDocument ->
            var currentDoc: Document? = null
            val file = LocalFileSystem.getInstance().findFileByPath(frameDocument.path) ?: throw CodioEventDispatchException("Could not find file: ${frameDocument.path}")
            ApplicationManager.getApplication()
                .runReadAction { currentDoc = FileDocumentManager.getInstance().getDocument(file) }
            currentDoc?.let { doc ->
                val currentEditor = Utils.getCurrentEditor(project, frameDocument.path)
                currentEditor?.let {
                    val codioAction = Runnable { it.markupModel.removeAllHighlighters() }
                    WriteCommandAction.runWriteCommandAction(project, codioAction)
                }
            }

        }
      }
    }
}
