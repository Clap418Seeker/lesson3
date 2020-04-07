import {App} from "./gameserver";
import {routers} from "./router";

const port = 2000;
const app = new App(routers, port);
app.listen();