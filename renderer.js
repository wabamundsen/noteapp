const notesList = document.getElementById('notes-list');
const noteContent = document.getElementById('note-content');
const saveNoteButton = document.getElementById('save-note');

let currentNoteFileName = null;

function loadNoteToEditor(noteElement) {
  noteContent.value = noteElement.textContent;
  currentNoteFileName = noteElement.dataset.fileName;
}

function createNoteElement(noteText, fileName) {
  const noteElement = document.createElement('div');
  noteElement.textContent = noteText;
  noteElement.dataset.fileName = fileName;
  noteElement.classList.add('note-item');
  noteElement.addEventListener('click', () => {
    loadNoteToEditor(noteElement);
  });
  notesList.appendChild(noteElement);
}

function updateNoteElement(noteText, fileName) {
  const noteElements = notesList.children;
  for (const noteElement of noteElements) {
    if (noteElement.dataset.fileName === fileName) {
      noteElement.textContent = noteText;
      break;
    }
  }
}

function deleteNoteElement(noteElement) {
  notesList.removeChild(noteElement);
}

saveNoteButton.addEventListener('click', () => {
  const noteText = noteContent.value.trim();

  if (noteText) {
    const isNewNote = !currentNoteFileName;
    const payload = { noteText, fileName: currentNoteFileName || `note-${Date.now()}.txt` };

    window.ipcRenderer.send(isNewNote ? 'save-note' : 'update-note', payload);

    if (isNewNote) {
      createNoteElement(noteText, payload.fileName);
    } else {
      updateNoteElement(noteText, currentNoteFileName);
    }

    noteContent.value = '';
    currentNoteFileName = null;
  }
});

window.ipcRenderer.on('load-notes', (event, notes) => {
  notes.forEach(({ noteText, fileName }) => createNoteElement(noteText, fileName));
});