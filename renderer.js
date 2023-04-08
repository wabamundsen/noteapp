const notesList = document.getElementById('notes-list');
const noteContent = document.getElementById('note-content');
const saveNoteButton = document.getElementById('save-note');

let currentNoteFileName = null;

function loadNoteToEditor(noteElement) {
  noteContent.value = noteElement.dataset.noteText; // Use the data-noteText attribute
  currentNoteFileName = noteElement.dataset.fileName;
}


function createNoteElement(noteText, fileName) {
  const noteElement = document.createElement('div');
  noteElement.textContent = noteText;
  noteElement.dataset.fileName = fileName;
  noteElement.dataset.noteText = noteText; // Set the data-noteText attribute
  noteElement.classList.add('note-item');
  noteElement.addEventListener('click', () => {
    loadNoteToEditor(noteElement);
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('delete-button');
  deleteButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent triggering the click event on the note element
    window.ipcRenderer.send('delete-note', fileName);
    deleteNoteElement(noteElement);
  });

  noteElement.appendChild(deleteButton);
  notesList.appendChild(noteElement);
}

function updateNoteElement(noteText, fileName) {
  const noteElements = notesList.children;
  for (const noteElement of noteElements) {
    if (noteElement.dataset.fileName === fileName) {
      const noteTextNode = document.createTextNode(noteText);
      const deleteButton = noteElement.querySelector(".delete-button");

      noteElement.innerHTML = "";
      noteElement.appendChild(noteTextNode);
      noteElement.appendChild(deleteButton);

      noteElement.dataset.noteText = noteText; // Update the data-noteText attribute
      break;
    }
  }
}



function deleteNoteElement(noteWrapper) {
  notesList.removeChild(noteWrapper);
}

saveNoteButton.addEventListener("click", () => {
  const noteText = noteContent.value.trim();

  if (noteText) {
    const isNewNote = !currentNoteFileName;
    const payload = { noteText, fileName: currentNoteFileName || `note-${Date.now()}.txt` };

    if (isNewNote) {
      window.ipcRenderer.send("save-note", payload);
      createNoteElement(noteText, payload.fileName);
    } else {
      window.ipcRenderer.send("update-note", payload);
    }

    noteContent.value = "";
    currentNoteFileName = null;
  }
});

// Add a new listener for the "note-updated" event
window.ipcRenderer.on("note-updated", (_, payload) => {
  updateNoteElement(payload.noteText, payload.fileName);
});


window.ipcRenderer.on('load-notes', (event, notes) => {
  notes.forEach(({ noteText, fileName }) => createNoteElement(noteText, fileName));
});