package com.wix.codio.fileSystem

import com.beust.klaxon.Klaxon
import java.io.File

data class CodioMeta(val name: String)

class CodioReader(val homeDir: File) {

    private fun createCodioDescriptor(codioDir: File): CodioDescriptor {
        val maybeMeta = Klaxon().parse<CodioMeta>(File(codioDir, "meta.json"))
        return CodioDescriptor(
            codioDir.name,
            maybeMeta!!.name,
            CodioOriginDir(codioDir),
            128 //TODO: get actual duration
        )
    }

    fun listCodios(): List<CodioDescriptor> {
        return (homeDir.listFiles()?.filter { file -> file.isDirectory } ?: emptyList())
            .map { dir -> createCodioDescriptor(dir) }
            .sortedBy { it.name }
    }
}