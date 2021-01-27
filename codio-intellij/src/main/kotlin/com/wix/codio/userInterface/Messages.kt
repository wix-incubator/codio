package com.wix.codio.userInterface

class Messages {
    companion object {
        val startingToRecord = "Starting to record"
        val alreadyRecording= "You already Recording."
        val cantRecordWhilePlaying = "Can't record while playing."
        val alreadyPlaying = "You already have a codio playing."
        val abortRecording = "Aborted Recording."
        val savingRecording = "Saving recording..."
        val recordingSaved = "Recording saved."
        val cantPlayWhileRecording = "Can't play codio while recording"
        val codioStart = "Codio is about to start.."
        val stopTutorial = "Stopping current codio.."
        val tutorialPause = "Paused codio."
        val ffmpegNotInstalled = "Seems like you don't have ffmpeg. run `brew install ffmpeg` from your terminal and try again"
        val ffmpegIsNeededTitle = "FFMPEG is needed"
        val ffmpegIsNeededMessage = "Do you agree to install FFMPEG?"
    }
}