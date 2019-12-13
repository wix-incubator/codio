package com.wix.codio.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.wix.codio.Player
import org.jetbrains.annotations.NotNull

open class CodioForwardAction : AnAction() {

    override fun actionPerformed(@NotNull e: AnActionEvent) {
        CodioNotifier(e.project).showTempBaloon("forward 10 sec", 2000)
        Player.instance.forward()
    }
}