import { Show, createSignal } from "solid-js"
import { createSettingsState } from "~/GlobalContext/settings"
import {
  PageType,
  TodoListProvider,
  createTodoListState,
} from "~/GlobalContext/todo-list"
import Help from "~/components/Help"
import Modal from "~/components/Modal"
import Settings from "~/components/Settings"
import Sidebar from "~/components/Sidebar"
import TodoList from "~/components/TodoList"
import { createShortcuts } from "~/lib/primitives"

export default function App() {
  const settingsState = createSettingsState()
  const todoList = createTodoListState()

  const [showHelp, setShowHelp] = createSignal(false)
  const [showSettings, setShowSettings] = createSignal(false)

  createShortcuts({
    "Control+1"() {
      todoList.updateActivePage(PageType.All)
    },
    "Control+2"() {
      todoList.updateActivePage(PageType.Today)
    },
    "Control+3"() {
      todoList.updateActivePage(PageType.Starred)
    },
    "Control+4"() {
      todoList.updateActivePage(PageType.Done)
    },
  })

  return (
    <div class="flex min-h-screen  bg-gray-100 dark:bg-stone-900">
      <TodoListProvider {...todoList}>
        <Sidebar />
        <TodoList />
        <Show when={showHelp()}>
          <Modal
            title="Help"
            onClose={() => setShowHelp(false)}
            children={<Help />}
          />
        </Show>
        <Show when={showSettings()}>
          <Modal
            title="Settings"
            onClose={() => setShowSettings(false)}
            children={<Settings />}
          />
        </Show>
      </TodoListProvider>
    </div>
  )
}
