package com.wix.codio.frame

import com.wix.codio.Utils
import frame.CodioFrameDocument
import frame.InteracterContentData
import org.apache.commons.collections.ListUtils

class InteracterContentHandler {
    companion object {
        fun getFrameInteracterContent(documents: ArrayList<CodioFrameDocument>) : ArrayList<InteracterContentData>{
            val result = ArrayList<InteracterContentData>()
            documents.mapTo(result) { doc ->
                val docText = Utils.getDocFromPath(doc.path)?.text ?: ""
                InteracterContentData(getInteracterContent(docText), doc.path)
            }
            return result
        }

        fun addInteracaterContentToFrame(codioFrameDocuments: ArrayList<CodioFrameDocument>, interacterContentFrame: ArrayList<InteracterContentData>) {
            codioFrameDocuments.forEach { doc ->
                val interacterContent = interacterContentFrame.filter { doc.path == it.path }.get(0).text
                doc.text = InteracterContentHandler.addInteracterContent(doc.text,  interacterContent) }
        }

        fun getInteracterContent(text: String) : String {
            val linesArray = text.split("\n")
            var lineWithInteracterContentIdx = -1
            var interacterContent = ""
            linesArray.forEachIndexed(){ index, line ->
                if (this.isInteracterSeparator(line)) lineWithInteracterContentIdx = index}
            if (lineWithInteracterContentIdx > -1) {
                interacterContent = linesArray.subList(lineWithInteracterContentIdx + 1, linesArray.count() ).joinToString(separator = "\n")
            }
            return interacterContent
        }

        fun addInteracterContent(fileText: String, interacterContent: String) : String{
            val docContent = getDocumentContent(fileText)
            val interacterContentLines = interacterContent.split("\n")
            val interacterContent = interacterContentLines.joinToString(separator = "\n")
            return docContent + "\n" + interacterContent
        }

        fun getDocumentContent(text: String): String {
            var documentContent = text
            var lineWithInteracterContentIdx = -1
            val linesArray = text.split("\n")
            linesArray.forEachIndexed(){ index, line ->
                if (isInteracterSeparator(line)) lineWithInteracterContentIdx = index}
            if (lineWithInteracterContentIdx > -1) {
                documentContent = linesArray.subList(0, lineWithInteracterContentIdx + 1 ).joinToString(separator = "\n")
            }
            return documentContent
        }

        fun isInteracterSeparator(line: String): Boolean {
            return line.contains("your code goes here") || line.contains("Your code goes here")
        }
    }



}