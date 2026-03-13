import { mountComponent, setContainer } from "@engine/index";
import App from "./App";

setContainer(document.getElementById("app")!);
mountComponent(App, document.getElementById("app")!);
