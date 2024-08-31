/* GAME

Why is the laser blur hidden by clearCanvas and by the rectangles even though they're drawn first and the lasers themselves are not hidden.

Do I want them to move and have the player try to align the crosshairs so that they, the player, move through he hoops, and have some condition to represent failure?

Add obstacles to shoot with the lasers. What will they look like? Have some nice particle explosions.

Have the baseline normal speed increase gradually and slowly to some peak, then slow towards the end of the run.

*/

import { Model } from "./models.js";
import { View } from "/views.js";
import { Controller } from "./controllers.js";

const canvas = document.getElementById("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const model = new Model();
const view = new View(canvas);
const controller = new Controller(model, view);
controller.startLoop();
