package com.wix.codio.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.PlatformDataKeys
import com.intellij.openapi.editor.Document
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.IconLoader
import com.wix.codio.Player
import com.wix.codio.Utils
import com.wix.codio.fileSystem.FileSystemManager
import com.wix.codio.recorder.Recorder
import com.wix.codio.recorder.RecorderException
import com.wix.codio.toolwindow.CodioNameDialog
import com.wix.codio.userInterface.Messages
import java.util.*


class CodioRecordOrSaveAction : AnAction() {

    override fun actionPerformed(e: AnActionEvent) {

        val project = e.project ?: return

        if (Recorder.instance.isRecording) {
            CodioNotifier(e.project).hideRecording()
            Recorder.instance.endRecording()
            Recorder.instance.saveRecording()
            CodioNotifier(project).showTempBaloon(Messages.recordingSaved, 2000)
        } else if (!Recorder.instance.isRecording) {
            try {
                Utils.checkFFMPEGAvailability(project, Runnable {
                    val doc = getOpenDoc(e, project)
                    val codioName = CodioNameDialog(project).selectCodioName() ?: return@Runnable

                    if (Player.instance.isPlaying) {
                        CodioNotifier(project).showTempBaloon(Messages.cantRecordWhilePlaying, 2000)
                        return@Runnable
                    }
                    val codioId = UUID.randomUUID().toString()
                    val fileSystemHandler = FileSystemManager.getProjectFileSystemHandler(project)
                    fileSystemHandler.createCodioProjectFolderInHomeDirIfNeeded(codioId)
                    Recorder.instance.record(e, fileSystemHandler, codioId, codioName, doc)
                    CodioNotifier(project).showRecording()
                })
            } catch (ex: Exception) {
                CodioNotifier(project).showTempBaloon("Failure: ${ex.message}", 2000)
                return
            }
        }
    }

    override fun update(e: AnActionEvent) {

        e.presentation.isEnabled = !Player.instance.isPlaying

        if (Recorder.instance.isRecording) {
            e.presentation.icon = IconLoader.getIcon("/ui/save.svg")
            e.presentation.text = "Save Current Recording"
        } else {
            e.presentation.icon = IconLoader.getIcon("/ui/record.svg")
            e.presentation.text = "Record Codio"
        }
    }

    private fun getOpenDoc(e: AnActionEvent, project: Project): Document {
        return try {
            val doc = e.getData(PlatformDataKeys.EDITOR)?.document
            val editor = FileEditorManager.getInstance(project).selectedTextEditor
            when {
                doc != null -> doc
                else -> editor!!.document
            }
        } catch (ex: Exception) {
            throw RecorderException("No open files found!\nClick record after you open a file")
        }
    }
}
