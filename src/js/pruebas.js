document.getElementById("hablar").addEventListener("click", () => {
  leerPdf(document.getElementById("libro").files, (texto) => {
    leerTexto(texto);
  });
});
const leerTexto = (texto) => {
  speechSynthesis.speak(new SpeechSynthesisUtterance(texto));
};
const leerPdf = (e, callback) => {
  if (e.length) {
    console.log(e[0]);
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
              // add page promise
              var textContent = page.getTextContent();
              return textContent.then(function (text) {
                // return content promise
                return text.items
                  .map(function (s) {
                    return s.str;
                  })
                  .join(""); // value page text
              });
            })
          );
        }
        return Promise.all(countPromises).then(function (texts) {
          callback(texts.join(""));
        });
        // pdf.getPage(pdf.numPages).then((pages) => {
        //     console.log(maxPages);
        // you can now use *page* here
        // var viewport = page.getViewport(2.0);
        // var canvas = document.querySelector("canvas")
        // canvas.height = viewport.height;
        // canvas.width = viewport.width;

        // page.render({
        // 	canvasContext: canvas.getContext('2d'),
        // 	viewport: viewport
        // });
        // });
      });
    };
    fileReader.readAsArrayBuffer(file);
  } else {
    console.log("no se selecciono archivo");
  }
  //   speechSynthesis.speak(new SpeechSynthesisUtterance(texto));
};
