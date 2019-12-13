package com.wix.codio

import com.wix.codio.fileSystem.CodioDescriptor
import com.wix.codio.fileSystem.CodioOriginDir
import com.wix.codio.fileSystem.CodioReader
import org.junit.Before
import org.junit.Test
import java.io.File
import kotlin.test.assertEquals

class CodioReaderTest {

    private lateinit var codioReader: CodioReader

    private fun copyResourceDirToTemp(dirName: String, tmpDir: File) {
        val dir = File(this::class.java.getResource("/$dirName").path)
        dir.copyRecursively(File(tmpDir, dirName))
    }

    private fun givenResources(homeDir: File) {
        copyResourceDirToTemp("codio1", homeDir)
        copyResourceDirToTemp("codio2", homeDir)
    }

    @Before
    fun setup() {
        val tmpDir = createTempDir()
        tmpDir.deleteOnExit()
        codioReader = CodioReader(tmpDir)
    }

    @Test
    fun testReadDir() {
        givenResources(codioReader.homeDir)
        val codios = codioReader.listCodios()
        val expected = arrayOf(
            CodioDescriptor(
                id = "codio1",
                name = "a111",
                origin = CodioOriginDir(File(codioReader.homeDir, "codio1")),
                duration = 1000
            ),
            CodioDescriptor(
                id = "codio2",
                name = "a222",
                origin = CodioOriginDir(File(codioReader.homeDir, "codio2")),
                duration = 1000
            )
        )
        assertEquals(codios.toSet(), expected.toSet())
    }

    @Test
    fun testReadEmptyDir() {
        val codios = codioReader.listCodios()
        assertEquals(codios, emptyList())
    }
}
