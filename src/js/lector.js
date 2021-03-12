const nombreArchivo = document.getElementById("nombre-archivo");
var audio = new SpeechSynthesisUtterance();
var synth = window.speechSynthesis;
var lectura = [];
var posicionActual = 0;
var pausado = false;

document.getElementById("archivo").addEventListener("change", function () {
  if (validar(this.files)) {
    leerPdf(this.files, (texto) => {
      if (texto.length === 0) {
        nombreArchivo.textContent = "No se encontro texto en el archivo";
      } else {
        document.getElementById("barra-progreso").style.width = `0%`;
        document.getElementById("lectura").innerHTML = "";
        posicionActual = 0;
        lectura = texto.split(" ");
      }
      // leerTexto(texto);
    });
  }
});
document.getElementById("reproducir").addEventListener("click", function () {
  iniciarReproduccion();
});
document.getElementById("pausar").addEventListener("click", function () {
  pausar();
});
document.getElementById("reiniciar").addEventListener("click", function () {
  reiniciar();
});
const validarNavegador = () => {
  if (!"speechSynthesis" in window) {
    nombreArchivo.textContent =
      "Lo siento, tu navegador no soporta esta tecnología";
  }
};

validarNavegador();
const validar = (files) => {
  if (files.length === 0) {
    nombreArchivo.textContent = "Debe selecciona un archivo";
    return false;
  }
  nombreArchivo.textContent = files[0].name;
  return true;
};
// const leerTexto = (texto) => {
//   console.log(texto);
//   if (texto.length > 0) {
//     audio.text = texto;
//   } else {
//     nombreArchivo.textContent = "No se encontro texto en el archivo";
//   }
// };

const iniciarReproduccion = () => {
  if (lectura.length > 0) {
    pausado = false;
    reproducir(posicionActual);
  }
};

const reproducir = (posicion = 0) => {
  document.getElementById("barra-progreso").style.width = `${
    posicion / lectura.length
  }%`;
  document.getElementById("lectura").innerHTML += " " + lectura[posicion];
  document.getElementById("lectura").scrollTop = document.getElementById(
    "lectura"
  ).scrollHeight;
  audio.text = lectura[posicion];
  posicionActual = posicion;
  synth.speak(audio);

  audio.onend = () => {
    synth.cancel();
    if (!pausado) {
      reproducir(posicion + 1);
    }
  };
};

const pausar = () => {
  synth.cancel();
  pausado = true;
  posicionActual++;
};
const reiniciar = () => {
  posicionActual = 0;
  document.getElementById("barra-progreso").style.width = `0%`;
  document.getElementById("lectura").innerHTML = "";
  pausado = true;
  synth.cancel();
};

const leerPdf = (e, callback) => {
  var file = e[0];
  var fileReader = new FileReader();
  fileReader.onloadend = function () {
    var typedarray = new Uint8Array(this.result);
    var loadingTask = pdfjsLib.getDocument(typedarray);
    loadingTask.promise.then(function (pdf) {
      var maxPages = pdf.numPages;
      var countPromises = [];
      for (var j = 1; j <= maxPages; j++) {
        var page = pdf.getPage(j);
        var txt = "";
        countPromises.push(
          page.then(function (page) {
            var textContent = page.getTextContent();
            return textContent.then(function (text) {
              return text.items
                .map(function (s) {
                  return s.str;
                })
                .join("");
            });
          })
        );
      }
      return Promise.all(countPromises).then(function (texts) {
        callback(texts.join(""));
      });
    });
  };
  fileReader.readAsArrayBuffer(file);
};
