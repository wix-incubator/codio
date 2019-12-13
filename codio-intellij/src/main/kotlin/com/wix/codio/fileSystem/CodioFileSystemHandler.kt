package com.wix.codio.fileSystem

import com.beust.klaxon.Klaxon
import com.intellij.openapi.project.Project
import com.wix.codio.CodioTimeline
import com.wix.codio.CodioTimelineData
import com.wix.codio.codioEvents.CodioEvent
import frame.CodioFrameDocument
import java.io.File


interface CodioFileSystemListener {
    fun run(codioDescriptor: CodioDescriptor) {

    }
}

class CodioFileSystemHandler {
    private var project: Project
    private var projectHash: String
    private var projectWorkHomeFolder: File

    companion object {
        private var listeners = ArrayList<CodioFileSystemListener>()
        fun addNewCodioListener(listener: CodioFileSystemListener) {
            listeners.add(listener)
        }
        private fun runThroughNewCodioListeners(codioDescriptor: CodioDescriptor) {
            listeners.forEach { it.run(codioDescriptor)}
        }
    }
    constructor (project: Project) {
        this.project = project
        this.projectHash = project.locationHash
        this.projectWorkHomeFolder = File(codioHomeProjectsFolder, projectHash)

    }

    private fun isMac(os: String) : Boolean {
        return os.indexOf("Mac") >= 0
    }
    private fun getHomeFolder() : String? {
        println("os : ${this.os}")
        println("homeDir : $DEFAULT_MACOS_HOME_FOLDER")
        if (isMac(os)) {
            return File(DEFAULT_MACOS_HOME_FOLDER).resolve("library").resolve("codio").absolutePath
        } else {
            println("Codio is currently not supported outside mac os")
        }
        return null
    }

    private val DEFAULT_MACOS_HOME_FOLDER = System.getProperty("user.home")
    private val os = System.getProperty("os.name")
    private var codioParentHomeFolder = getHomeFolder()
    private var codioHomeProjectsFolder = File(codioParentHomeFolder).resolve("projects")


    fun createCodioProjectFolderInHomeDirIfNeeded(codioId: String) {
        projectWorkHomeFolder.resolve(codioId).mkdirs()
    }

    fun getCodioInHomeProjectFolder(codioId: String) : File {
        return projectWorkHomeFolder.resolve(codioId)
    }


    fun getCodioAudioPath(codioId: String) : String {
        return projectWorkHomeFolder.resolve(codioId).resolve("audio.mp3").absolutePath
    }

    fun getCodiosProjectFolder() : String? {
        val projectBasePath = project?.basePath ?: return null
        val codioFolder = File(projectBasePath).resolve("codio")
        codioFolder.mkdirs()
        return codioFolder.absolutePath
    }

    fun getCodioInHomeFolderPath(codioId: String) : String {
        val codioFolder = projectWorkHomeFolder.resolve(codioId)
        codioFolder.mkdirs()
        return codioFolder.absolutePath
    }

    fun loadCodioTimeline(codioId: String, projectPath: String) : CodioTimeline? {
        val json = projectWorkHomeFolder.resolve(codioId).resolve("codio.json").readText()
        val timelineData = CodioTimelineKlaxon().fromJson(json)
        val timelineDataWithAbsolutePath = CodioTimeline.transformTimelineToAbsolutePath(projectPath, timelineData)
        CodioTimeline.instance.eventTimeline = ArrayList(timelineDataWithAbsolutePath.eventTimeline)
        CodioTimeline.instance.initialFrame = ArrayList(timelineDataWithAbsolutePath.initialFrame)
        CodioTimeline.instance.recordingLength = timelineDataWithAbsolutePath.recordingLength
        return CodioTimeline.instance
    }

    fun saveCodioJson(codioId: String, json: String) {
        val file = getCodioInHomeProjectFolder(codioId)
        file.resolve("codio.json").writeText(json)
    }

    fun saveTimeline(codioId: String, codioTimelineData: CodioTimelineData) {
        val json = CodioTimelineKlaxon().toJson(codioTimelineData)
        saveCodioJson(codioId, json)
    }

    fun saveCodioMeta(codioId: String, meta: CodioMeta) {
        val json = Klaxon().toJsonString(meta)
        getCodioInHomeProjectFolder(codioId).resolve("meta.json").writeText(json)

    }

    fun saveCodio(codioId: String, codioTimelineData: CodioTimelineData, name: String ) {
        saveTimeline(codioId, codioTimelineData)
        saveCodioMeta(codioId!!, CodioMeta(name))
        zipCodioAndSaveInProject(codioId!!)
        CodioFileSystemHandler.runThroughNewCodioListeners(CodioDescriptor(codioId, name, CodioOriginDir(projectWorkHomeFolder), 128)) //TODO: set actual duration
    }

    fun zipCodioAndSaveInProject(codioId: String) {
        val codioHomeFolder = getCodioInHomeFolderPath(codioId)
        val codiosFolder = File(getCodiosProjectFolder()).resolve(codioId).absolutePath
        Runtime.getRuntime().exec("zip -r -j ${codiosFolder}.codio ${codioHomeFolder}")
    }

    fun unzipCodioToHomeFolder(codioId: String) {
        println("unzipping $codioId")
        val codioZipPath = File(getCodiosProjectFolder()).resolve(codioId).absolutePath
        val codioHomeFolderPath = getCodioInHomeFolderPath(codioId)
        println("codioProjectzippath $codioZipPath")
        println("codioHomeFolderPath $codioHomeFolderPath")
        Runtime.getRuntime().exec("unzip ${codioZipPath}.codio -d ${codioHomeFolderPath}")
    }

    fun unzipAllCodios() {
        val codioFolder = File(getCodiosProjectFolder())
        if (codioFolder.exists()) {
            codioFolder.listFiles().filter { it.extension == "codio" }.forEach { unzipCodioToHomeFolder((it.nameWithoutExtension)) }
        }
    }

    fun listCodios() : List<CodioDescriptor> {
        return CodioReader(projectWorkHomeFolder).listCodios()
    }
}
