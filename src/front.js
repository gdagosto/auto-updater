// Display the current version
const version = window.location.hash.substring(1);
document.getElementById("version").innerText = version;

// Listen for messages
import { ipcRenderer } from "electron";

ipcRenderer.on("message", function (text) {
  const { type, data } = JSON.parse(text);

  if (type === "message") onMessage(data);
  if (type === "progress") onProgress(data);
});

function onMessage(msg) {
  const container = document.getElementById("messages");
  const message = document.createElement("div");
  message.innerHTML = msg;
  container.appendChild(message);
}

function onProgress(progressRaw) {
  const { bps, pct, curr, total } = JSON.parse(progressRaw);
  // Ajusta velocidade
  document.getElementById("velocidade").innerHTML = exibeVelocidade(bps);
  document.getElementById("pct").value = pct;
  document.getElementById("atual").innerHTML = exibeAtualTotal(curr, total);
}

const KILO = 1024;

const letras = ["b", "kb", "Mb", "Gb", "Tb"];

function transformaEmBit(bytes, fixo = -1) {
  const bits = bytes * 8;

  let num = bits;
  let i = 0;

  if (fixo === -1) {
    while (num >= KILO) {
      num /= KILO;
      i++;
    }
  } else {
    i = fixo;
    for (let j = 0; j < i; j++) {
      num /= KILO;
    }
  }

  if (i <= 1) {
    num = num.toFixed(0);
  } else {
    num = num.toFixed(1);
  }

  return [num, letras[i], i];
}

function exibeVelocidade(bytes) {
  const [num, letra, _] = transformaEmBit(bytes);
  return `${num} ${letra}/s`;
}

function exibeAtualTotal(atual, total) {
  const [numTotal, letra, i] = transformaEmBit(total);
  const numAtual = transformaEmBit(atual, i)[0];

  return `${numAtual} / ${numTotal} ${letra}`;
}
