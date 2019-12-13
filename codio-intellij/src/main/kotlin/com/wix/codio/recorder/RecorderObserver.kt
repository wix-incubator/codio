package com.wix.codio.recorder

import com.intellij.openapi.editor.event.CaretListener
import com.intellij.openapi.editor.event.DocumentListener
import com.intellij.openapi.editor.event.EditorEventMulticaster
import com.intellij.openapi.fileEditor.FileEditorManagerEvent
import com.intellij.openapi.fileEditor.FileEditorManagerListener
import com.intellij.util.messages.MessageBusConnection
import com.wix.codio.CodioTimeline
import com.wix.codio.codioEvents.CodioEventsCreator
import frame.CodioFrameDocument

class RecorderObserver(
    val listeners: Listeners,
    var eventMulticaster: EditorEventMulticaster?,
    var messageBusConnection: MessageBusConnection?,
    val codioEventsCreator: CodioEventsCreator?,
    val codioTimeline: CodioTimeline,
    val initialFrame: ArrayList<CodioFrameDocument>
) {

    fun attach() {
        try {
            eventMulticaster!!.addDocumentListener(listeners.docListener as DocumentListener)
            eventMulticaster!!.addCaretListener(listeners.caretListener as CaretListener)
            eventMulticaster!!.addVisibleAreaListener(listeners.visibleAreaListener!!)
            eventMulticaster!!.addSelectionListener(listeners.selectionListener!!)
        }
        catch (ex: Throwable) {
            throw RecorderException(ex.message!!)
        }
    }

        fun detach() {
            messageBusConnection!!.disconnect()
            eventMulticaster!!.removeDocumentListener(listeners.docListener!!)
            eventMulticaster!!.removeCaretListener(listeners.caretListener!!)
            eventMulticaster!!.removeVisibleAreaListener(listeners.visibleAreaListener!!)
            eventMulticaster!!.removeSelectionListener(listeners.selectionListener!!)
        }
    }