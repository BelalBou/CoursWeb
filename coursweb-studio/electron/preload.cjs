const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("coursWeb", {
  getCourseMap: () => ipcRenderer.invoke("course:getMap"),
  readLesson: (lessonPath) => ipcRenderer.invoke("course:readLesson", lessonPath),
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url)
});
