package userInterface

import com.intellij.openapi.editor.ex.EditorEx
import com.intellij.openapi.editor.markup.CustomHighlighterRenderer
import com.intellij.openapi.editor.markup.HighlighterTargetArea
import com.intellij.openapi.editor.markup.TextAttributes
import com.intellij.openapi.util.TextRange
import com.intellij.ui.JBColor
import java.awt.Color


class SelectionRenderer constructor( internal var ranges: List<TextRange>) {

    internal fun renderCursor(editor: EditorEx) {
        val textAttributes = TextAttributes()
        textAttributes.backgroundColor = Color(0, 255, 0)
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
                g.color = JBColor.GREEN;
                val point = editorToRender.logicalPositionToXY(editorToRender.offsetToLogicalPosition(highlighter.startOffset))
                val pointEnd = editorToRender.logicalPositionToXY(editorToRender.offsetToLogicalPosition(highlighter.endOffset))
                g.drawRect(point.x, point.y, pointEnd.x - point.x, editorToRender.lineHeight + 1)
            }
            rangeHighlighter.setCustomRenderer(renderer)
        }


    }
}
