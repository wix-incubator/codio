package com.wix.codio.toolwindow

import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.ui.components.JBTextField
import com.intellij.ui.layout.panel
import javax.swing.JComponent

class CodioNameDialog(project: Project) : DialogWrapper(project) {

    private val name = JBTextField(25)

    init {
        title = "codio name"
        init()
    }

    override fun createCenterPanel(): JComponent {

        val codioNameField = this.name
        return panel() {
            row { codioNameField(grow) }
        }
    }

    fun selectCodioName(): String? {
        val result = showAndGet()
        if (!result) return null
        return this.name.text.trim()
    }

}