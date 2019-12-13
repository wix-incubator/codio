package com.wix.codio.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.wm.ToolWindowManager
import com.wix.codio.Player
import com.wix.codio.recorder.Recorder
import com.wix.codio.toolwindow.CodioToolWindowPanel
import com.wix.codio.userInterface.Messages


class CodioPlayOrPauseAction : AnAction() {

    override fun actionPerformed(event: AnActionEvent) {

        val project = event.project ?: return

        if (Recorder.instance.isRecording) {
            CodioNotifier(project).showTempBaloon(Messages.alreadyRecording, 2000)
        } else if (Player.instance.isPlaying) {
            CodioNotifier(project).showTempBaloon(Messages.tutorialPause, 2000)
            Player.instance.pause()
        } else {
            val toolWindow = ToolWindowManager.getInstance(project).getToolWindow("codio") ?: return
            val content = toolWindow.contentManager.getContent(0) ?: return
            val codioToolWindowPanel = content.component as CodioToolWindowPanel
            val codioId = codioToolWindowPanel.codioToolWindow.selectedCodioItem?.id
            if (codioId == null) {
                if (Player.instance.codioId !== null) {

                } else {
                    //choose codio to play
                }
            } else {
                if (Player.instance.codioId === codioId) {
                    Player.instance.resume()
                } else {
                    println("*** codioId playing is : $codioId")
                    Player.instance.loadCodio(codioId, project)
                    Player.instance.playCodio()
                }
            }
        }
    }

    override fun update(e: AnActionEvent) {

        if (Player.instance.isPlaying) {
            e.presentation.setIcon(IconLoader.getIcon("/ui/pause.svg"))
        } else e.presentation.setIcon(IconLoader.getIcon("/ui/play.svg"))
    }

}
