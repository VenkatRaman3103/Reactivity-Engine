import { derive, onMount, onUnmount, whenever } from "@engine";

export let todoList: string[] = [];
export let limit: boolean = false;
export let title: string = "";

whenever(todoList, () => {
  if (todoList.length > 3) {
    limit = true;
  }
});

async function fn() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const data = await res.json();

  title = data.title;

  console.log(data);
}

fn();

export function addTodo(item: string) {
  if (!limit) {
    todoList = [...todoList, item];
  }
}

export function removeTodo() {
  todoList = todoList.slice(0, -1);
}
