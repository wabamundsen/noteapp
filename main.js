const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const notesDir = path.join(app.getPath('userData'), 'notes');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile('index.html');

  loadNotes(mainWindow);
}

function loadNotes(mainWindow) {
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir);
  }

  fs.readdir(notesDir, (err, files) => {
    if (err) {
      console.error('Error reading notes directory:', err);
      return;
    }

    const notes = files
      .filter(file => path.extname(file) === '.txt')
      .map(file => ({
        noteText: fs.readFileSync(path.join(notesDir, file), 'utf-8'),
        fileName: file,
      }));

    mainWindow.webContents.send('load-notes', notes);
  });
}

ipcMain.on('save-note', (event, { noteText, fileName }) => {
  const filePath = path.join(notesDir, fileName);

  fs.writeFile(filePath, noteText, (err) => {
    if (err) {
      console.error('Error saving note:', err);
    }
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('update-note', (event, { noteText, fileName }) => {
  const filePath = path.join(notesDir, fileName);

  fs.writeFile(filePath, noteText, (err) => {
    if (err) {
      console.error('Error updating note:', err);
    }
  });
});

