package com.wix.codio.recorder

import com.intellij.execution.ExecutionListener
import com.intellij.execution.ExecutionManager
import com.intellij.execution.runners.ExecutionEnvironment
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.event.EditorEventMulticaster
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditorManagerEvent
import com.intellij.openapi.fileEditor.FileEditorManagerListener
import com.intellij.openapi.project.Project
import com.intellij.util.messages.MessageBusConnection
import com.wix.codio.Audio
import com.wix.codio.CodioTimeline
import com.wix.codio.actions.CodioNotifier
import com.wix.codio.codioEvents.CodioEventsCreator
import com.wix.codio.fileSystem.CodioProjectFileSystemHandler
import frame.CodioFrameDocument
import java.time.Instant


class Recorder {

    var isRecording = false

    companion object {
        val instance = Recorder()
    }

    var eventMulticaster: EditorEventMulticaster? = null
    var messageBusConnection: MessageBusConnection? = null
    var absoluteStartTime: Long = 0
    var codioId: String? = null
    var codioName: String? = null
    private val listeners = Listeners()
    private var project: Project? = null
    private var codioEventsCreator: CodioEventsCreator? = null
    private var initialContent: String? = null
    private var initialPath: String? = null
    private var initialFrame = ArrayList<CodioFrameDocument>()
    private var fileSystemHandler: CodioProjectFileSystemHandler? = null
    private var codioTimeline = CodioTimeline.instance
    fun record(e: AnActionEvent, fileSystemHandler: CodioProjectFileSystemHandler, codioId: String, codioName: String, doc: Document) {
         recordingErrorWrapper {
            resetState()
            this.fileSystemHandler = fileSystemHandler
            this.codioId = codioId
            this.codioName = codioName
            this.eventMulticaster = initMultiCaster(e)
            this.absoluteStartTime = Instant.now().toEpochMilli()
            codioTimeline.clearTimeline()
            project = e.project
            isRecording = true
            codioEventsCreator = CodioEventsCreator()
            connectMessageBus()
            initialContent = doc.text
            initialPath = FileDocumentManager.getInstance().getFile(doc)?.path
            initialFrame.add(CodioFrameDocument(initialContent!!, initialPath!!, 1, 0))
            CreateRecorderListeners(
                this.listeners,
                codioEventsCreator!!,
                codioTimeline,
                { recordingErrorWrapper(it) }).initListeners()
            recorderObserver = RecorderObserver(
                listeners,
                eventMulticaster,
                messageBusConnection,
                codioEventsCreator,
                codioTimeline,
                initialFrame
            )
            recorderObserver?.attach()
            Audio.instance.record(fileSystemHandler.getCodioAudioPath(codioId))
        }
    }

    fun recordingErrorWrapper(func: () -> Unit) {
        try {
            func()
        } catch (ex: Exception) {
            endRecording()
            fileSystemHandler?.getCodioInHomeProjectFolder(codioId!!)?.deleteRecursively()
            CodioNotifier(project).showTempBaloon("Recording failed with error: $ex", 5000)
        }
    }

    private var recorderObserver: RecorderObserver? = null

    fun endRecording() {
        Audio.instance.endRecording()
        recorderObserver?.detach()
        disconnectMessageBus()
        isRecording = false
    }

    fun saveRecording() {
        codioTimeline.changeTimesToRelative(absoluteStartTime)
        codioTimeline.recordingLength = Instant.now().toEpochMilli() - absoluteStartTime
        moveFirstFileToEndOfInitialFrameOrder()
        codioTimeline.initialFrame = initialFrame
        val codioTimelineDataWithRelativePath = CodioTimeline.transformTimelineToRelativePath(
            project!!.basePath!!,
            codioTimeline.getTimelineData()
        )
        fileSystemHandler?.saveCodio(codioId!!, codioTimelineDataWithRelativePath, codioName!!)
    }

    private fun initMultiCaster(e: AnActionEvent): EditorEventMulticaster {
        val emc = EditorFactory.getInstance().eventMulticaster
        if (e.project != null) {
            messageBusConnection = e.project!!.messageBus.connect()
        } else {
            throw RecorderException("No project exists")
        }
        return emc
    }

    private fun connectMessageBus() {
        messageBusConnection!!.subscribe(FileEditorManagerListener.FILE_EDITOR_MANAGER, object :
            FileEditorManagerListener {
            override fun selectionChanged(event: FileEditorManagerEvent) {
                recordingErrorWrapper {
                    val codioEvent = codioEventsCreator?.createEditorChangedEvent(event, initialFrame)
                    if (codioEvent != null) {
                        codioTimeline.addToCodioList(codioEvent)
                    }
                }

            }
        })
        messageBusConnection!!.subscribe(ExecutionManager.EXECUTION_TOPIC, object : ExecutionListener {
            override fun processStarting(executorId: String, executionEnv: ExecutionEnvironment) {
                recordingErrorWrapper {
                    val codioEvent = codioEventsCreator?.createExecutionEvent(initialPath!!, executorId, executionEnv)
                    if (codioEvent != null) {
                        codioTimeline.addToCodioList(codioEvent)
                    }
                }
            }
        })
    }

    private fun disconnectMessageBus() {
        messageBusConnection?.disconnect()
    }

    private fun moveFirstFileToEndOfInitialFrameOrder() {
        // This is done so that it will be shown first when applying the frame
        // perhaps this code should move to frame?
        initialFrame.reverse()
    }

    private fun resetState() {
        listeners.clear()
        project = null
        codioEventsCreator = null
        initialContent = null
        initialPath = null
        initialFrame = ArrayList()
        eventMulticaster = null
        messageBusConnection = null
        absoluteStartTime = 0
        codioId = null
        codioName = null
        fileSystemHandler = null
    }
}

data class RecorderException(val msg: String): RuntimeException(msg)


