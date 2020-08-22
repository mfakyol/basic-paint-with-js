const presets = document.querySelector(".presets");
const canvas = document.querySelector("canvas");
const paint = document.querySelector(".paint");
const positions = document.querySelector("#positions");
const colorPicker = document.querySelector("#color-picker");
const colorSize = document.querySelector("#color-size");
const lineButton = document.querySelector("#line-button");
const widthInput = document.querySelector("#width-input");
const heightInput = document.querySelector("#height-input");
const newButton = document.querySelector("#new-button");
const getFromStoreButton = document.querySelector("#get-from-store-button");
const undoButton = document.querySelector("#undo-button");
const redoButton = document.querySelector("#redo-button");
const savebutton = document.querySelector("#save-button");

var ctx = canvas.getContext("2d");
canvas.style.display = "none";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

let lineWidth = 1;
let color = "#000000";
let isDrawing = false;
let lastX = 0;
let lastY = 0;
lines = [];
redoList = [];
step = 0;

function draw(e) {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineCap = "round";
  ctx.lineJoin = "line";
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  lines.push({
    step,
    color: color,
    lineWidth: lineWidth,
    startX: lastX,
    startY: lastY,
    endX: e.offsetX,
    endY: e.offsetY,
  });

  [lastX, lastY] = [e.offsetX, e.offsetY];
  undoButton.disabled = false;
  redoButton.disabled = true;
  redoList = [];
}

function drawFromStore(line) {
  ctx.beginPath();
  ctx.moveTo(line.startX, line.startY);
  ctx.lineTo(line.endX, line.endY);
  ctx.lineCap = "round";
  ctx.lineJoin = "line";
  ctx.lineWidth = line.lineWidth;
  ctx.strokeStyle = line.color;
  ctx.stroke();
}

newButton.addEventListener("click", function () {
  canvas.width = widthInput.value;
  canvas.height = heightInput.value;
  presets.style.display = "none";
  canvas.style.display = "block";
});

getFromStoreButton.addEventListener("click", function () {
  if (localStorage.getItem("data") != null) {
    const data = JSON.parse(localStorage.getItem("data"));
    canvas.width = data.width;
    canvas.height = data.height;
    presets.style.display = "none";
    canvas.style.display = "block";
    lines = data.lines;
    lines.map((line) => drawFromStore(line));
    step = lines[lines.length - 1].step + 1;
    undoButton.disabled = false;
  }
});

canvas.addEventListener("mousemove", function (e) {
  positions.textContent = `X:${e.offsetX}, Y:${e.offsetY}`;
  draw(e);
});
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});
colorPicker.addEventListener("change", (e) => (color = e.target.value));

colorSize.addEventListener("change", (e) => (lineWidth = e.target.value));

canvas.addEventListener("mouseup", () => {isDrawing = false; step++;});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
  if (isDrawing) {
    step++;
  }
});

undoButton.addEventListener("click", () => {
  lines = lines.filter((line) => {
    if (line.step == step - 1) {
      redoList.push(line);
    }
    return line.step != step - 1;
  });
  step--;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.map((line) => {
    drawFromStore(line);
  });
  if (step == 0) {
    undoButton.disabled = true;
  }
  redoButton.disabled = false;
});

redoButton.addEventListener("click", () => {
  redoList.map((line) => {
    if (line.step == step) {
      drawFromStore(line);
      lines.push({
        step,
        lineWidth: line.lineWidth,
        color: line.color,
        startX: line.startX,
        startY: line.startY,
        endX: line.endX,
        endY: line.endY,
      });
    }
    undoButton.disabled = false;
  });
  redoList = redoList.filter((line) => line.step != step);
  step++;
  if (redoList.length == 0) {
    redoButton.disabled = true;
  }
});

savebutton.addEventListener("click", function () {
  const width = canvas.width;
  const height = canvas.height;
  localStorage.setItem("data", JSON.stringify({ width, height, lines }));
  alert('Saved..')
});
