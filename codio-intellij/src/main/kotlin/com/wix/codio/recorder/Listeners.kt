package com.wix.codio.recorder

import com.intellij.openapi.editor.event.CaretListener
import com.intellij.openapi.editor.event.DocumentListener
import com.intellij.openapi.editor.event.SelectionListener
import com.intellij.openapi.editor.event.VisibleAreaListener

data class Listeners(var docListener: DocumentListener? = null,
                     var caretListener: CaretListener? = null,
                     var selectionListener: SelectionListener? = null,
                     var visibleAreaListener: VisibleAreaListener? = null) {

    fun clear() {
        docListener = null
        caretListener = null
        selectionListener = null
        visibleAreaListener = null

    }
}