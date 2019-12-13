package com.wix.codio.recorder

import com.intellij.openapi.editor.event.*
import com.wix.codio.CodioTimeline
import com.wix.codio.codioEvents.CodioEventsCreator

class CreateRecorderListeners(var listeners: Listeners,
                              var codioEventsCreator: CodioEventsCreator,
                              var codioTimeline: CodioTimeline) {

    fun initListeners() {
        listeners.docListener = object : DocumentListener {
//            override fun documentChanged(event: DocumentEvent) {
//                val codioEvent = codioEventsCreator!!.createTextChangedEvent(event)
//                if (codioEvent != null) {
//                    codioTimeline.addToCodioList(codioEvent)
//                }
//            }

            override fun beforeDocumentChange(event: DocumentEvent) {
                super.beforeDocumentChange(event)
                val codioEvent = codioEventsCreator!!.createTextChangedEvent(event)
                if (codioEvent != null) {
                    codioTimeline.addToCodioList(codioEvent)
                }
            }
        }

        listeners.caretListener = object : CaretListener {
            override fun caretPositionChanged(event: CaretEvent) {
                val codioEvent = codioEventsCreator!!.createSelectionChangedEvent(event.editor)
                if (codioEvent != null) {
                    codioTimeline.addToCodioList(codioEvent)
                }
            }

            override fun caretAdded(event: CaretEvent) {
                val codioEvent = codioEventsCreator!!.createSelectionChangedEvent(event.editor)
                if (codioEvent != null) {
                    codioTimeline.addToCodioList(codioEvent)
                }
            }

            override fun caretRemoved(event: CaretEvent) {
                //@TODO: What should we do here? maybe nothing
            }
        }

        listeners.selectionListener = object: SelectionListener {
            override fun selectionChanged(event: SelectionEvent) {
                val codioEvent = codioEventsCreator!!.createSelectionChangedEvent(event.editor) ?: return
                println(codioEvent.toString())
                codioTimeline.addToCodioList(codioEvent)
            }
        }

        listeners.visibleAreaListener = VisibleAreaListener { e: VisibleAreaEvent ->
            val codioEvent = codioEventsCreator!!.createVisibleRangeChangedEvent(e)
            if (codioEvent != null) {
                codioTimeline.addToCodioList((codioEvent))
            } else {
                println("visible range event is null?")
            }
        }
    }
}
