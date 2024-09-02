import { Model } from "./models.js";
import { View } from "./views.js";
import { Controller } from "./controllers.js";

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
controller.startLoop();
