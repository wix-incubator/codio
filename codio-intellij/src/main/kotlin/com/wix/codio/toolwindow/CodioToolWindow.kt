package com.wix.codio.toolwindow

import com.intellij.execution.filters.TextConsoleBuilderFactory
import com.intellij.execution.ui.ConsoleView
import com.intellij.execution.ui.ConsoleViewContentType
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.ActionToolbar
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.SimpleToolWindowPanel
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.ui.JBSplitter
import com.intellij.ui.ScrollPaneFactory
import com.intellij.ui.content.ContentFactory
import com.intellij.ui.treeStructure.Tree
import com.wix.codio.CodioProgressTimer
import com.wix.codio.fileSystem.CodioDescriptor
import com.wix.codio.fileSystem.CodioFileSystemHandler
import com.wix.codio.fileSystem.CodioFileSystemListener
import java.awt.BorderLayout
import java.util.*
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JTree
import javax.swing.tree.DefaultMutableTreeNode
import javax.swing.tree.DefaultTreeModel


class CodioToolWindowFactory : ToolWindowFactory, DumbAware {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {

        val toolwindowPanel = CodioToolWindowPanel(project)
        val tab = ContentFactory.SERVICE.getInstance().createContent(toolwindowPanel, "", false)
        toolWindow.contentManager.addContent(tab)

        CodioFileSystemHandler.addNewCodioListener( object: CodioFileSystemListener {
            override fun run(codioDescriptor: CodioDescriptor) {
                val toolWindow = ToolWindowManager.getInstance(project).getToolWindow("codio") ?: return
                val content = toolWindow.getContentManager().getContent(0) ?: return
                val codioToolWindowPanel = content.getComponent() as CodioToolWindowPanel
                codioToolWindowPanel.codioToolWindow.addCodioItem()
            }
        })
    }
}

class CodioToolWindowPanel(project: Project) : SimpleToolWindowPanel(true, false) {
    val codioToolWindow = CodioToolWindow(project)

    init {
        setToolbar(codioToolWindow.toolbar.component)
        codioToolWindow.toolbar.setTargetComponent(this)
        setContent(codioToolWindow.content)
    }
}

class CodioItem(val id: String, val name: String, val duration: Int): Comparable<CodioItem> {
    override fun compareTo(other: CodioItem): Int {
        return if(name.hashCode() >= other.name.hashCode()) 1 else 0
    }

    override fun toString(): String {
        return name
    }
}

class CodioToolWindow(private val project: Project) {

    val toolbar: ActionToolbar = run {
        val actionManager = ActionManager.getInstance()
        actionManager.createActionToolbar(
            "Codio Toolbar",
            actionManager.getAction("com.wix.codio.Toolbar") as DefaultActionGroup,
            true
        )
    }

    private val playSlider = CodioPlaySlider()
    private var codiosTree = getTree()
    private val consoleView = TextConsoleBuilderFactory.getInstance().createBuilder(project).console


    init {
        consoleView.print("Log....\n", ConsoleViewContentType.NORMAL_OUTPUT)

        codiosTree.addTreeSelectionListener {
            val tree = it.source as JTree
            val selectedNode = tree
                .lastSelectedPathComponent as DefaultMutableTreeNode
            val selectedNodeName = selectedNode.toString()
            val duration = (selectedNode.userObject as? CodioItem)?.duration ?: 0
            consoleView.print(selectedNodeName + "\n", ConsoleViewContentType.NORMAL_OUTPUT)
            playSlider.setSliderRange(0, duration, 0)
        }
    }

    val content: JComponent = createContent(playSlider.content, codiosTree, consoleView)

    val selectedCodioItem: CodioItem? get() = getTreeSelectedItemPath()

    fun addCodioItem() {
        val model = codiosTree.model as DefaultTreeModel
        val root = model.root as DefaultMutableTreeNode
        root.removeAllChildren()
        val codioFileSystemHandler = CodioFileSystemHandler(project)
        codioFileSystemHandler.unzipAllCodios()
        val codioList = codioFileSystemHandler.listCodios()

        codioList.forEach {
            root.add(DefaultMutableTreeNode(CodioItem(it.id, it.name, it.duration)))
        }
        model.reload(root)
    }

    private fun getTreeSelectedItemPath(): CodioItem? {
        val selectedTreeNode = codiosTree.selectionPath?.lastPathComponent as? DefaultMutableTreeNode
        return selectedTreeNode?.userObject as? CodioItem
    }

    private fun getTree(): JTree {
        val root = DefaultMutableTreeNode(CodioItem("", "codios", 0))

        val codioFileSystemHandler = CodioFileSystemHandler(project)
        codioFileSystemHandler.unzipAllCodios()
        val codioList = codioFileSystemHandler.listCodios()

        codioList.forEach {
            root.add(DefaultMutableTreeNode(CodioItem(it.id, it.name, it.duration)))
        }
        return Tree(root)
    }


    companion object {

        private fun createContent(playSlider: JComponent, codiosTree: JTree, consoleView: ConsoleView): JComponent {

            val content = JPanel(BorderLayout())
            val mySplitter = JBSplitter(true, "ChangesViewManager.DETAILS_SPLITTER_PROPORTION", 0.7f)
            mySplitter.setHonorComponentsMinimumSize(false)

            val scrollPane = ScrollPaneFactory.createScrollPane(codiosTree)
            val wrapper = JPanel(BorderLayout())
            wrapper.add(scrollPane, BorderLayout.CENTER)

            mySplitter.firstComponent = wrapper
//            mySplitter.secondComponent = consoleView.component

            content.add(playSlider, BorderLayout.NORTH)

            content.add(mySplitter, BorderLayout.CENTER)

            return content
        }

    }
}



