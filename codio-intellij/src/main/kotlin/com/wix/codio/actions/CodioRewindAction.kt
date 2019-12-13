package com.wix.codio.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.wix.codio.Player


open class CodioRewindAction : AnAction() {

    override fun actionPerformed(e: AnActionEvent) {

        CodioNotifier(e.project).showTempBaloon("Back 10 sec", 2000)
        Player.instance.rewind()
    }
}