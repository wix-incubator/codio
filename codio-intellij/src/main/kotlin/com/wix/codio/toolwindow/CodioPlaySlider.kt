package com.wix.codio.toolwindow

import com.wix.codio.CodioProgressTimer
import com.wix.codio.CodioProgressTimerOnUpdateObserver
import com.wix.codio.Player
import java.awt.BorderLayout
import java.awt.event.MouseEvent
import java.awt.event.MouseListener
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JSlider

class CodioPlaySlider {

    private val slider = JSlider(JSlider.HORIZONTAL, 0, 100, 0)


    val content: JComponent = createSlider()

    fun setSliderValue(value: Int) {
        slider.value = value
    }


    fun setSliderRange(min: Int, max: Int, value: Int) {
        slider.minimum = min
        slider.maximum = max
        slider.value = value

//        val position = Hashtable<Int, JLabel>()
//        position.put(0, JLabel("0:00"))
//        position.put(155, JLabel("2:35"))
//        slider.setLabelTable(position)
    }

    private fun createSlider(): JComponent {
        val label = JLabel("0:00")
        //val slider = JSlider(JSlider.HORIZONTAL, 0, 155, 0)
        //set major or minor ticks for the slider
        slider.majorTickSpacing = 25
        slider.paintTicks = true

        //slider.setPaintLabels(true)
        CodioProgressTimer.onUpdate(object : CodioProgressTimerOnUpdateObserver() {
            override fun run(current: Int, total: Int) {
                slider.maximum = total
                slider.value = current
            }
        })
        slider.isEnabled = true

        // Add change listener to the slider
        slider.addChangeListener {
            val value = slider.value
            label.text = "%02d".format(value / 60) + ":" + "%02d".format(value % 60)
        }

        slider.addMouseListener(object : MouseListener {
            override fun mouseReleased(e: MouseEvent?) {
                println("mouse release")
                println(slider.value)
                Player.instance.playFrom((slider.value * 1000).toLong())
            }

            override fun mouseEntered(e: MouseEvent?) {
            }

            override fun mouseExited(e: MouseEvent?) {
            }

            override fun mousePressed(e: MouseEvent?) {
                println("mouse press")
            }

            override fun mouseClicked(e: MouseEvent?) {
                println("mouse click")
            }
        })


        val wrapperSlider = JPanel(BorderLayout())
        wrapperSlider.add(slider, BorderLayout.WEST)
        wrapperSlider.add(label, BorderLayout.EAST)

        return wrapperSlider
    }
}