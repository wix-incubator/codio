package com.wix.codio.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.wix.codio.recorder.Recorder
import org.jetbrains.annotations.NotNull

open class CodioSaveAction : AnAction() {

    override fun actionPerformed(@NotNull e: AnActionEvent) {
        if (Recorder.instance.isRecording) {
            CodioNotifier(e.project).hideRecording()
            Recorder.instance.finishRecordingAndSave()
        }
    }
}