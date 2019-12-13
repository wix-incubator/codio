package com.wix.codio

import com.beust.klaxon.*
import com.intellij.openapi.util.TextRange
import com.intellij.util.toArray
import com.wix.codio.fileSystem.KlaxonRectangle
import com.wix.codio.fileSystem.KlaxonTextRanges
import org.junit.Test
import java.awt.Rectangle
import kotlin.reflect.KClass
import kotlin.test.assertEquals

sealed class A {
    abstract val x: Int
    abstract fun copyX(x1: Int): A
}

data class B(val b1: Int)

data class A1(override val x: Int, val s1: String, val bs: ArrayList<B>) : A() {
    override fun copyX(x1: Int): A {
        return this.copy(x = x1)
    }
}

data class A2(override val x: Int, val s2: String) : A() {
    override fun copyX(x1: Int): A {
        return this.copy(x = x1)
    }
}

// ------------------------------------------------------------------------------------------------------------------

class ATypeAdapter : TypeAdapter<A> {
    override fun classFor(type: Any): KClass<out A> = when (type as Int) {
        1 -> A1::class
        2 -> A2::class
        else -> throw IllegalArgumentException("Unknown type: $type")
    }
}

class Data(
    @TypeFor(field = "a", adapter = ATypeAdapter::class)
    val type: Int,
    val a: A
)

// ------------------------------------------------------------------------------------------------------------------

@Target(AnnotationTarget.FIELD)
annotation class KlaxonRectangle

val rectangleConverter = object : Converter {

    override fun canConvert(cls: Class<*>) = cls == Rectangle::class.java

    override fun fromJson(jv: JsonValue): Rectangle {
        return Rectangle(jv.objInt("x"), jv.objInt("y"), jv.objInt("width"), jv.objInt("height"))
    }

    override fun toJson(value: Any): String {
        val rec = value as Rectangle
        return """
            { "x" : ${rec.x}, "y" : ${rec.y}, "width" : ${rec.width}, "height" : ${rec.height} }
        """.trimIndent()
    }
}

data class DataRectangle(val s: String, @KlaxonRectangle val rec: Rectangle)

// ------------------------------------------------------------------------------------------------------------------

@Target(AnnotationTarget.FIELD)
annotation class KlaxonTextRanges

val textRangesConverter = object : Converter {

    override fun canConvert(cls: Class<*>) = cls == Array<TextRange>::class.java

    override fun fromJson(jv: JsonValue): Array<TextRange> {
        val trs = jv.array!!.mapChildren { TextRange(it.int("startOffset")!!, it.int("endOffset")!!) }
            .toArray(arrayOf())

        return trs.map { it!! }.toArray(arrayOf())
    }

    private fun textRangeToJson(tr: TextRange): String {
        return """
            { "startOffset" : ${tr.startOffset}, "endOffset" : ${tr.endOffset} }
        """.trimIndent()
    }

    override fun toJson(value: Any): String {
        val trs = value as Array<TextRange>
        val joined = trs.joinToString { textRangeToJson(it) }
        return "[ $joined ]"
    }
}

data class DataTextRanges(val x: Int, val y: Int, @KlaxonTextRanges val textRanges: Array<TextRange>)

// ------------------------------------------------------------------------------------------------------------------


class CodioJsonTest {

    @Test
    fun testTextRange() {
        val tdr = DataTextRanges(0, 0, arrayOf(TextRange(1, 2)))
        val klaxon = Klaxon().fieldConverter(KlaxonTextRanges::class, textRangesConverter)
        val json = klaxon.toJsonString(tdr)
        val actual = klaxon.parse<DataTextRanges>(json)

        assertEquals(actual!!.x, tdr.x)
        assertEquals(actual.y, tdr.y)
        actual.textRanges contentEquals tdr.textRanges


    }

    @Test
    fun testRectangle() {
        val dr = DataRectangle("abc", Rectangle(1, 1, 100, 10))
        val klaxon = Klaxon().fieldConverter(KlaxonRectangle::class, rectangleConverter)
        val json = klaxon.toJsonString(dr)
        val actual = klaxon.parse<DataRectangle>(json)
        assertEquals(actual!!, dr)
    }

    @Test
    fun testCopy() {
        val json = """
            [
                { "type" : 1, "a" : { "x" : 0, "s1" : "abc", "bs" : [ {"b1" : 0}, {"b1" : 1} ] } },
                { "type" : 2, "a" : { "x" : 1, "s2" : "xyz"} }
            ]
        """.trimIndent()
        val actual = Klaxon().parseArray<Data>(json)
        val expected = listOf(A1(0, "abc", arrayListOf(B(0), B(1))), A2(1, "xyz"))
        assertEquals(actual!!.map { d -> d.a }, expected)
    }

}