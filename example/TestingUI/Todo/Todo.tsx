import { onMount, when } from "@engine";
import { addTodo, limit, removeTodo, title, todoList } from "./todo.state";

export const Todo = () => {
  when(onMount, () => {
    console.log("Hello world ----");
  });

  return (
    <div>
      <h1>{title}</h1>

      {todoList.map((item) => (
        <div>{item}</div>
      ))}
      <button onClick={() => addTodo("item")}>Add todo</button>
      <button onClick={removeTodo}>Remove</button>
      {limit && "Limit reached"}
    </div>
  );
};
