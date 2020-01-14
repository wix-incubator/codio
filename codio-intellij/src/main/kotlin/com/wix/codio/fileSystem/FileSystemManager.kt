package com.wix.codio.fileSystem

import com.intellij.openapi.project.Project

class FileSystemManager {
    companion object {
        private val projectFileSystemHandlersMap = mutableMapOf<String, CodioProjectFileSystemHandler>()

        fun getProjectFileSystemHandler(project: Project) : CodioProjectFileSystemHandler {
            val projectFileSystemHandler = projectFileSystemHandlersMap[project.locationHash]
            return if (projectFileSystemHandler is CodioProjectFileSystemHandler) {
                projectFileSystemHandler
            } else {
                val newProjectFileSystemHandler = CodioProjectFileSystemHandler(project)
                projectFileSystemHandlersMap.set(project.locationHash, newProjectFileSystemHandler)
                newProjectFileSystemHandler
            }
        }
    }
}