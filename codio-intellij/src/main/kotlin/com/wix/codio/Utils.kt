package com.wix.codio

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.ex.EditorEx
import com.intellij.openapi.editor.ex.util.EditorUtil
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VirtualFile
import com.wix.codio.codioEvents.CodioEvent
import com.wix.codio.codioEvents.CodioPosition
import com.wix.codio.toolwindow.CodioFFMpegAlert

class Utils {
    companion object {
        fun getDocFromPath(path: String): Document? {
            val file = LocalFileSystem.getInstance().findFileByPath(path)
            var doc: Document? = null
            ApplicationManager.getApplication()
                .invokeAndWait { doc = FileDocumentManager.getInstance().getDocument(file!!) }
            return doc
        }

        fun overrideEditorText(project: Project, file: VirtualFile, documentText: String) {
            var doc: Document? = null
            ApplicationManager.getApplication()
                .invokeAndWait { doc = FileDocumentManager.getInstance().getDocument(file!!) }
            val overrideEditorText = Runnable { doc!!.setText(documentText) }
            WriteCommandAction.runWriteCommandAction(project, overrideEditorText)
        }

        fun getCurrentEditor(project: Project, path: String): EditorEx? {
            var currentEditor: EditorEx? = null
            ApplicationManager.getApplication()
                .invokeAndWait {
                    val fileEditor = FileEditorManager.getInstance(project)
                        .selectedEditors.find { it.file!!.path == path }
                    currentEditor = EditorUtil.getEditorEx(fileEditor)

                }
           return currentEditor
        }

        fun findOffsetFromPosition(position: CodioPosition, text: String) :Int {
            val lines = text.lines()
            val contentTillLine = lines.subList(0, position.line).joinToString("\n")
            var lineOffset = contentTillLine.length
            if (position.line > 0) lineOffset++
            return lineOffset + position.character

        }

        fun checkFFMPEG(project: Project?): Boolean {
            val exist = "ffmpeg -version".runAsCommand()
            if (exist == null) {
                val isOk = CodioFFMpegAlert(project).showAndGet()
                if (isOk) {
                    //                        should progress appear
                    "brew install ffmpeg".runAsCommand()
                    //                        progress Should disappears
                } else return true
            }
            return false
        }
    }
}