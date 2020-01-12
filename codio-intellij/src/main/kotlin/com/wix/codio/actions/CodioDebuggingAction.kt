package com.wix.codio.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.testFramework.TemporaryDirectory
import com.wix.codio.Player
import org.jetbrains.annotations.NotNull
import java.nio.file.FileSystem

open class CodioDebuggingAction : AnAction() {

    override fun actionPerformed(@NotNull e: AnActionEvent) {
        val tempPath = TemporaryDirectory.generateTemporaryPath("codio");
        println(tempPath)
        var file = createTempDir("tmp", null, null)

        //        CodioNotifier(e.project).showTempBaloon("forward 10 sec", 2000)
//        Player.instance.forward()
    }
}