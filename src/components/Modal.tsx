import { useGlobalContext } from "~/GlobalContext/store"
import Icon from "./Icon"
import { createEventListener } from "@solid-primitives/event-listener"
import type { JSX } from "solid-js"

// TODO: should contain JSX passed in
// find a type for JSX.element..
interface Props {
  children: JSX.Element
  title: string
  onClose: () => void
}

export default function Modal(props: Props) {
  const global = useGlobalContext()

  let ref!: HTMLDivElement
  createEventListener(
    () => ref,
    "click",
    (e) => {
      if (e.target === ref) {
        global.setShowHelp(false)
        global.setShowSettings(false)
        global.setNewTodo(false)
      }
    },
    { passive: true }
  )

  return (
    <div
      style={{
        "background-color": "#00000080",
        "backdrop-filter": "blur(2px)",
      }}
      class="fixed h-screen w-screen"
    >
      <div class="items-center h-full w-full flex justify-center" ref={ref}>
        <div
          style={{
            "border-radius": "10px",
          }}
          class=" bg-gray-100 dark:bg-stone-900 h-1/2 flex w-1/2"
        >
          <div class="w-full h-full flex flex-col">
            <nav
              style={{
                "border-radius": "10px 10px 0 0",
              }}
              class="flex items-end justify-between pl-4 pr-3 pb-1 pt-1"
            >
              <div></div>
              <div>{props.title}</div>
              <div class="cursor-pointer" onClick={() => props.onClose()}>
                <Icon name="Cross" />
              </div>
            </nav>
            <div class="h-full w-full overflow-hidden">{props.children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
