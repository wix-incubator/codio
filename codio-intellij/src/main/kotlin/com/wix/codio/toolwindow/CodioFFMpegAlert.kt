package com.wix.codio.toolwindow

import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.ui.components.JBLabel
import com.wix.codio.userInterface.Messages
import javax.swing.JComponent

class CodioFFMpegAlert(project: Project?) : DialogWrapper(project) {

    init {
        title = Messages.ffmpegIsNeededTitle
        init()
    }

    override fun createCenterPanel(): JComponent {
        return JBLabel(Messages.ffmpegIsNeededMessage)
    }
}