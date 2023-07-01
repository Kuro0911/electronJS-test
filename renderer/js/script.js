const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];
  if (!isFileImg(file)) {
    alertError("error not img file");
    return;
  }
  // get org h w

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
}
function sendImage(e) {
  e.preventDefault();
  if (!img.files[0]) {
    alertError("enter valid image");
    return;
  }
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;
  if (width === "" || height === "") {
    alertError("enter valid height and width");
    return;
  }
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

ipcRenderer.on("image:done", () => {
  alertSuccess(`image resized to ${widthInput.value} * ${heightInput.value}`);
});

function isFileImg(file) {
  const acceptedImg = ["image/gif", "image/png", "image/jpeg"];
  return file && acceptedImg.includes(file["type"]);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 4000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}
function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 4000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
