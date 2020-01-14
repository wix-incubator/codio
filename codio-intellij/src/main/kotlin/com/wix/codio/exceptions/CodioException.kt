package com.wix.codio.exceptions

open class CodioException(val text: String) : Exception(text) {}

class CodioEventDispatchException(text: String) : CodioException(text) {}