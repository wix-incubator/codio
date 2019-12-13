package com.wix.codio.fileSystem

import org.junit.Test
import java.nio.file.Paths
import kotlin.test.assertEquals

class PathsHelperTest {

    private fun getAbsolute(basePath: String, relativePath: String): String =
        Paths.get(basePath, relativePath).toString()

    private fun getRelative(basePath: String, absolutePath: String): String =
        Paths.get(basePath).relativize(Paths.get(absolutePath)).toString()

    @Test
    fun testHelloWorld() {
        val basePath = "/Users/eladbo/Documents/PluginWithJavaFX"
        val absolutePath = "/Users/eladbo/Documents/PluginWithJavaFX/src/main/java/HelloWorld.java"
        val relativePath = "src/main/java/HelloWorld.java"
        assertEquals(getRelative(basePath, absolutePath), relativePath)
        assertEquals(getAbsolute(basePath, relativePath), absolutePath)
    }

    @Test
    fun testRelativeToAbsolute() {
        assertEquals(getRelative("/tmp", "/tmp/a"), "a")
        assertEquals(getRelative("/tmp", "/tmp/a/b"), "a/b")
        assertEquals(getRelative("/tmp/a", "/tmp/a/b"), "b")
    }

    @Test
    fun testRelativeToRelative() {
        assertEquals(getRelative("tmp", "tmp/a"), "a")
        assertEquals(getRelative("tmp", "tmp/a/b"), "a/b")
        assertEquals(getRelative("tmp/a", "tmp/a/b"), "b")
    }

    @Test
    fun testAbsolute() {
        assertEquals(getAbsolute("/tmp", "a"), "/tmp/a")
        assertEquals(getAbsolute("/tmp", "a/b"), "/tmp/a/b")
        assertEquals(getAbsolute("/tmp/a", "b"), "/tmp/a/b")
    }
}