package com.wix.codio.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.util.IconLoader
import com.wix.codio.Player
import org.jetbrains.annotations.NotNull
import javax.swing.Icon

open class CodioPauseOrResumeAction : AnAction() {

    override fun actionPerformed(@NotNull e: AnActionEvent) {
        if (Player.instance.isPlaying) {
            println("***** pausing!")
            Player.instance.pause()
        } else {
            println("***** resuming!")
            Player.instance.resume()
        }
    }


//    override fun update(e: AnActionEvent, showPuase: Boolean) {
//        super.update(e)
//        e.presentation.icon = IconLoader.getIcon("/org/intellij/images/icons/ZoomOut.png"
//    }
}