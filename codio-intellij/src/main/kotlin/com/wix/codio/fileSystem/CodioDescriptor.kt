package com.wix.codio.fileSystem

import java.io.File

data class CodioOriginDir(val dir: File)

data class CodioDescriptor(val id: String, val name: String, val origin: CodioOriginDir, val duration: Int): Comparable<CodioDescriptor> {
    override fun compareTo(other: CodioDescriptor): Int {
        return if(other.duration >= duration) 1 else 0
    }
}