const notesList = document.getElementById('notes-list');
const noteContent = document.getElementById('note-content');
const saveNoteButton = document.getElementById('save-note');

function createNoteElement(noteText) {
  const noteElement = document.createElement('div');
  noteElement.textContent = noteText;
  notesList.appendChild(noteElement);
}

saveNoteButton.addEventListener('click', () => {
  const noteText = noteContent.value.trim();

  if (noteText) {
    window.ipcRenderer.send('save-note', noteText);
    createNoteElement(noteText);
    noteContent.value = '';
  }
});

window.ipcRenderer.on('load-notes', (event, notes) => {
  notes.forEach(noteText => createNoteElement(noteText));
});