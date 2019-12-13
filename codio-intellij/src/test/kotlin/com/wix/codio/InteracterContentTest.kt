package com.wix.codio

import com.wix.codio.frame.InteracterContentHandler
import frame.CodioFrameDocument
import frame.InteracterContentData
import org.junit.Test
import kotlin.test.assertEquals


class CodioInteracterContentTest {

    @Test
    fun testGetInteracterContent() {
        val content = "x = 5"
        val documentText = "What is x?\n // your code goes here: \n$content"
        val result = InteracterContentHandler.getInteracterContent(documentText)
        println("*** result: $result")
        assertEquals(result, content)
    }

    @Test
    fun addInteracterContent() {
        val content = "x = 5"
        val documentText = "What is x?\n // your code goes here: "
        val expected = "What is x?\n // your code goes here: \n" +
                "$content"
        assertEquals(InteracterContentHandler.addInteracterContent(documentText, content), expected)
    }

    @Test
    fun getFrameInteracterContent() {
        val someDocumentText1 = "What is x?\n "
        val someInteracterContent = "val s = 5 \n 3"
        val someDocumentText2 = "What is x?\n // your code goes here: \n" + someInteracterContent
        val documents =  arrayListOf(
            CodioFrameDocument(someDocumentText1, "a/b", 1, 1),
            CodioFrameDocument(someDocumentText2, "a/c", 1, 2)
        )
        val expected = arrayListOf(
            InteracterContentData("", "a/b"),
            InteracterContentData(someInteracterContent, "a/c")
        )

        val result = InteracterContentHandler.getFrameInteracterContent(documents)
        assertEquals(result, expected)
    }

    @Test
    fun addInteracaterContentToFrame() {
        val someDocumentText1 = "What is x?\n "
        val someInteracterContent = "val s = 5 \n 3"
        val someDocumentText2 = "What is x?\n // your code goes here:"
        val codioFrameDocuments = arrayListOf(
            CodioFrameDocument(someDocumentText1, "a/b", 1, 1),
            CodioFrameDocument(someDocumentText2, "a/c", 1, 1)
        )

        val interacterContentFrame = arrayListOf(
            InteracterContentData("", "a/b"),
            InteracterContentData(someInteracterContent, "a/c")
        )

        InteracterContentHandler.addInteracaterContentToFrame(codioFrameDocuments, interacterContentFrame)
        val expected = arrayListOf(
            CodioFrameDocument(someDocumentText1, "a/b", 1, 1),
            CodioFrameDocument(someDocumentText2 + "\n" + someInteracterContent, "a/c", 1, 1)
        )

        assertEquals(codioFrameDocuments, expected)
    }
}