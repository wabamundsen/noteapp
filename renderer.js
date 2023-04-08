const notesList = document.getElementById('notes-list');
const noteContent = document.getElementById('note-content');
const saveNoteButton = document.getElementById('save-note');

let currentNoteFileName = null;

function loadNoteToEditor(noteText, fileName) {
  noteContent.value = noteText;
  currentNoteFileName = fileName;
}

function createNoteElement(noteText, fileName) {
  const noteElement = document.createElement('div');
  noteElement.textContent = noteText;
  noteElement.dataset.fileName = fileName;
  noteElement.addEventListener('click', () => {
    loadNoteToEditor(noteText, fileName);
  });
  notesList.appendChild(noteElement);
}

saveNoteButton.addEventListener('click', () => {
  const noteText = noteContent.value.trim();

  if (noteText) {
    const isNewNote = !currentNoteFileName;
    const payload = { noteText, fileName: currentNoteFileName || `note-${Date.now()}.txt` };

    window.ipcRenderer.send(isNewNote ? 'save-note' : 'update-note', payload);

    if (isNewNote) {
      createNoteElement(noteText, payload.fileName);
    }

    noteContent.value = '';
    currentNoteFileName = null;
  }
});

window.ipcRenderer.on('load-notes', (event, notes) => {
  notes.forEach(({ noteText, fileName }) => createNoteElement(noteText, fileName));
});