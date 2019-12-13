package com.wix.codio

import com.wix.codio.fileSystem.CodioFileSystemHandler

open class Audio {
    private var playingProcess : Process? = null
    private var recordingProcess : Process? = null

    companion object {
        val instance = Audio()
    }

    fun play(audioPath: String, time: Int) {
        try {
            println("Executing music")

            playingProcess = Runtime.getRuntime()
                .exec("/usr/local/bin/ffplay -nodisp -ss $time $audioPath")
            println("music should now play.")

        } catch (ex: Exception) {
            ex.printStackTrace()
            println("exception.")
        }
    }

    fun pause() {
        playingProcess!!.destroy()
    }

    fun record(path: String) {
        println("recording for path $path")
        try {
            println("recording music");
            recordingProcess = Runtime.getRuntime().exec("/usr/local/bin/ffmpeg -f avfoundation -i  :0 $path");
            System.out.println("music should now record.");

        } catch (ex: Exception) {
            System.out.println("exception.");
        }
    }

    fun finishRecording() {
        recordingProcess!!.destroy()
    }
}
