package com.wix.codio

import java.util.*

abstract class CodioProgressTimerOnUpdateObserver {
    abstract fun run(current: Int, total: Int)
}

abstract class CodioProgressTimerOnFinishObserver {
    abstract fun run()
}

class CodioProgressTimer(val totalLength: Long) {

    companion object {
        private var onFinishObservers = ArrayList<CodioProgressTimerOnFinishObserver>()
        private var onUpdateObservers = ArrayList<CodioProgressTimerOnUpdateObserver>()

        fun onFinish(observer: CodioProgressTimerOnFinishObserver) {
            this.onFinishObservers.add(observer);
        }

        fun onUpdate(observer: CodioProgressTimerOnUpdateObserver) {
            this.onUpdateObservers.add(observer);
        }
    }

    var timer = Timer()
    var timerTask : TimerTask? = null
    var currentSecond: Int = 0



    fun stop() {
        timer.cancel()
    }

    fun run(tutorialTime: Int = 0) {
        try {
            if (this.timerTask != null) { stop() }
            this.currentSecond = tutorialTime;
            this.timerTask = object : TimerTask() {
                override fun run() {
                    currentSecond++
                    if (totalLength > 0 && currentSecond > totalLength / 1000) {
                        onFinishObservers.forEach{ it.run()}
                        onUpdateObservers.forEach{it.run((totalLength/ 1000).toInt(), (totalLength/ 1000).toInt())}
                        stop()
                    } else {
                        onUpdateObservers.forEach{it.run(currentSecond, (totalLength / 1000).toInt())}
                    }
                }
            }
            timer = Timer()
            timer.scheduleAtFixedRate(timerTask, 1000, 1000)

        } catch(e: Exception) {
            e.printStackTrace()
        }
    }
}