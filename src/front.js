// Display the current version
const version = window.location.hash.substring(1);
document.getElementById("version").innerText = version;

// Listen for messages
import { ipcRenderer } from "electron";

ipcRenderer.on("message", function (event, text) {
  const container = document.getElementById("messages");
  const message = document.createElement("div");
  message.innerHTML = text;
  container.appendChild(message);
});

ipcRenderer.on("update-ready", function (event) {});
