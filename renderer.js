const { ipcRenderer } = require("electron");

// 获取 DOM 元素
const noteContent = document.getElementById("noteContent");
const saveBtn = document.getElementById("saveBtn");
const openBtn = document.getElementById("openBtn");
const status = document.getElementById("status");

// 保存笔记按钮点击事件
saveBtn.addEventListener("click", async () => {
  const content = noteContent.value.trim();
  if (!content) {
    status.textContent = "错误：笔记内容不能为空！";
    status.style.color = "red";
    return;
  }
  // 向主进程发送保存请求
  const result = await ipcRenderer.invoke("save-note", content);
  status.textContent = result.msg;
  status.style.color = result.success ? "green" : "red";
});

// 打开笔记按钮点击事件
openBtn.addEventListener("click", async () => {
  const result = await ipcRenderer.invoke("read-note");
  if (result.success) {
    noteContent.value = result.content;
    status.textContent = result.msg;
    status.style.color = "green";
  } else {
    status.textContent = result.msg;
    status.style.color = "red";
  }
});
