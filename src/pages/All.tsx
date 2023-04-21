import { useKeyDownList } from "@solid-primitives/keyboard"
import { Show, createEffect, createSignal, onMount, untrack } from "solid-js"
import { TodoType, useGlobalContext } from "~/GlobalContext/store"
import NewTodo from "~/components/NewTodo"
import Todo from "~/components/Todo"
import { sortTodosByPriority } from "~/lib/lib"

export default function All() {
  const {
    todos,
    setTodos,
    newTodo,
    setNewTodo,
    setNewTodoType,
    setFocusedTodo,
    setLocalSearch,
    localSearch,
    focusedTodo,
    setTodoToEdit,
    setEditingTodo,
    editingTodo,
  } = useGlobalContext()
  const [keys, { event }] = useKeyDownList()
  const [orderedTodos, setOrderedTodos] = createSignal<TodoType[]>([])
  const [currentlyFocusedTodo, setCurrentlyFocusedTodo] = createSignal(0)
  const [changeFocus, setChangeFocus] = createSignal(true)

  createEffect(() => {
    if (!newTodo() && event()?.key === "n") {
      untrack(() => {
        setFocusedTodo(0)
        setNewTodoType("all")
        setNewTodo(true)
        setChangeFocus(false)
      })
    }
    if ((newTodo() || localSearch()) && event()?.key === "Escape") {
      untrack(() => {
        setNewTodo(false)
        setLocalSearch(false)
        setChangeFocus(true)
      })
    }
    if (changeFocus() && orderedTodos().length > 0) {
      if (event()?.key === "ArrowDown") {
        untrack(() => {
          if (orderedTodos().length - 1 === currentlyFocusedTodo()) {
            setCurrentlyFocusedTodo(-1)
          }
          setFocusedTodo(orderedTodos()[currentlyFocusedTodo() + 1].id)
          setCurrentlyFocusedTodo(currentlyFocusedTodo() + 1)
        })
      }
      if (event()?.key === "ArrowUp") {
        untrack(() => {
          if (0 === currentlyFocusedTodo() || -1 === currentlyFocusedTodo()) {
            setCurrentlyFocusedTodo(orderedTodos().length)
          }
          setFocusedTodo(orderedTodos()[currentlyFocusedTodo() - 1].id)
          setCurrentlyFocusedTodo(currentlyFocusedTodo() - 1)
        })
      }
    }
    if (event()?.key === "f") {
      untrack(() => {
        setLocalSearch(true)
      })
    }
    if (focusedTodo() !== 0 && event()?.key === "Enter") {
      untrack(() => {
        setTodoToEdit(focusedTodo())
        setEditingTodo(!editingTodo())
      })
    }
  })

  createEffect(() => {
    setOrderedTodos(
      todos()
        .filter((t) => !t.done)
        .sort((a, b) => b.priority - a.priority)
    )
  })

  // order by priority
  onMount(() => {
    setCurrentlyFocusedTodo(-1)
  })

  return (
    <div class="p-16 pt-6">
      <h1 class="font-bold text-3xl mb-8">All</h1>
      {todos()
        .filter((t) => !t.done)
        .sort((a, b) => b.priority - a.priority)
        .map((todo) => {
          return (
            <Todo
              todo={todo}
              setTodos={setTodos}
              todos={todos}
              setCurrentlyFocusedTodo={setCurrentlyFocusedTodo}
              currentlyFocusedTodo={currentlyFocusedTodo()}
              orderedTodos={orderedTodos}
              setChangeFocus={setChangeFocus}
              newTodo={newTodo}
            />
          )
        })}
      <Show when={newTodo() && !editingTodo()}>
        <NewTodo
          setChangeFocus={setChangeFocus}
          orderedTodos={orderedTodos}
          setOrderedTodos={setOrderedTodos}
          setCurrentlyFocusedTodo={setCurrentlyFocusedTodo}
        />
      </Show>
    </div>
  )
}
