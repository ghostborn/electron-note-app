const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

// 确保 notes 目录存在
const notesDir = path.join(app.getPath("userData"), "notes");
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

let mainWindow;

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // 允许渲染进程使用 node 模块（新手简化配置）
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 加载本地 HTML 文件
  mainWindow.loadFile("index.html");

  // 打开开发者工具（方便调试）
  mainWindow.webContents.openDevTools();
}

// 监听应用就绪事件
app.whenReady().then(createWindow);

// 监听渲染进程的「保存笔记」请求
ipcMain.handle("save-note", async (event, noteContent, noteName) => {
  try {
    // 如果没传文件名，弹出保存对话框
    if (!noteName) {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: path.join(notesDir, "未命名笔记.txt"),
        filters: [{ name: "文本文件", extensions: ["txt"] }],
      });
      if (!filePath) return { success: false, msg: "取消保存" };
      fs.writeFileSync(filePath, noteContent, "utf-8");
      return { success: true, msg: `保存成功:${filePath}` };
    } else {
      const filePath = path.join(notesDir, `${noteName}.txt`);
      fs.writeFileSync(filePath, noteContent, "utf-8");
      return { success: true, msg: `保存成功:${filePath}` };
    }
  } catch (err) {
    return { success: false, msg: `保存失败:${err.message}` };
  }
});

// 监听渲染进程的「读取笔记」请求
ipcMain.handle("read-note", async () => {
  try {
    // 弹出选择文件对话框
    const { filePaths } = await dialog.showOpenDialog({
      defaultPath: notesDir,
      filters: [{ name: "文本文件", extensions: ["txt"] }],
    });
    if (filePaths.length === 0) return { success: false, msg: "取消选择" };
    const content = fs.readFileSync(filePaths[0], "utf-8");
    return { success: true, content, msg: "读取成功" };
  } catch (err) {
    return { success: false, msg: `读取失败:${err.message}` };
  }
});

// 关闭所有窗口时退出应用（macOS 除外）
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// macOS 下激活应用时的逻辑
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
