package com.wix.codio.actions

import com.intellij.notification.*
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.wix.codio.userInterface.Messages
import java.awt.Color
import java.util.*
import javax.swing.BorderFactory


class CodioNotifier(val project: Project?) {

    companion object {

        private val notificationGroup = NotificationGroup("Codio notification group", NotificationDisplayType.BALLOON, true)

        private fun createNotification(text: String, isError: Boolean) : Notification {
            val notificationType = if (isError)  NotificationType.ERROR else NotificationType.INFORMATION
            return notificationGroup.createNotification(text, notificationType)
        }

        private val recordingNotification = createNotification(Messages.startingToRecord, false)

    }

    fun showRecording() {
        FileEditorManager.getInstance(project!!)
            .allEditors?.forEach {
            it.component.border = BorderFactory.createLineBorder(Color.RED)
        }
        showRecordingBaloon()
    }

    fun hideRecording() {
        FileEditorManager.getInstance(project!!).allEditors?.forEach {
            it.component.border = null
        }
        hideRecordingBaloon()
    }

    fun showRecordingBaloon() {
        Notifications.Bus.notify(recordingNotification)
    }

    fun showTempBaloon(message: String, duration: Long = 2000) {
        val tempNotification = createNotification(message, false)
        Notifications.Bus.notify(tempNotification)

        Timer().schedule(object : TimerTask() {
            override fun run() {
                tempNotification.balloon?.hide()
            }
        }, duration)
    }


    fun hideRecordingBaloon() {
        recordingNotification.getBalloon()?.hide()
    }
}