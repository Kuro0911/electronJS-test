const path = require("path");
const os = require("os");
const fs = require("fs");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const ResizeImg = require("resize-img");

const isDev = process.env.NODE_ENV !== "development";
const isMac = process.platform === "darwin";
let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Open devtools if in dev
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 500,
    height: 600,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// app ready

app.whenReady().then(() => {
  createMainWindow();
  // implement menu

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => (mainWindow = null));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

//Menu Template

const menu = [
  // ...(isMac
  //   ? [
  //       {
  //         label: "File",
  //         submenu: [
  //           {
  //             label: "Quit",
  //             click: () => app.quit(),
  //             accelerator: "CmdOrCtrl+W",
  //           },
  //         ],
  //       },
  //     ]
  //   : []),
  {
    // label: "File",
    // submenu: [
    //   {
    //     label: "Quit",
    //     click: () => app.quit(),
    //     accelerator: "CmdOrCtrl+W",
    //   },
    // ],
    role: "fileMenu",
  },
  {
    label: "Help",
    submenu: [{ label: "About", click: createAboutWindow }],
  },
];

ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");

  resizeImage(options);
});
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    let imagePath = fs.readFileSync(imgPath);
    const newPath = await ResizeImg(imagePath, {
      width: +width,
      height: +height,
    });
    const fileName = path.basename(imgPath);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.writeFileSync(path.join(dest, "img-resized"), newPath);
    mainWindow.webContents.send("image:done");
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
