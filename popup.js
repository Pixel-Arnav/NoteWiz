document.addEventListener('DOMContentLoaded', initialize);

// Initialize the extension
function initialize() {
  // Elements
  const noteInput = document.getElementById('note-input');
  const saveBtn = document.getElementById('save-btn');
  const notesList = document.getElementById('notes-list');
  const searchInput = document.getElementById('search-input');
  const themeToggle = document.getElementById('theme-toggle');
  const categorySelect = document.getElementById('category-select');

  // Load saved theme
  loadTheme();

  // Load and render saved notes
  loadNotes();

  // Event Listeners
  saveBtn.addEventListener('click', saveNote);
  noteInput.addEventListener('input', autoSaveNote);
  searchInput.addEventListener('input', filterNotes);
  themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Load and render notes from Chrome storage
 */
function loadNotes() {
  chrome.storage.sync.get(['notes'], function(result) {
    const notes = result.notes || [];
    renderNotes(notes);
  });
}

/**
 * Render notes to the DOM
 * @param {Array} notes - Array of note objects
 */
function renderNotes(notes) {
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = ''; // Clear existing notes

  // Sort notes: Pinned notes first
  const sortedNotes = notes.sort((a, b) => b.pinned - a.pinned);

  sortedNotes.forEach((note, index) => {
    createNoteElement(note, index);
  });
}

/**
 * Create a note DOM element
 * @param {Object} note - Note object
 * @param {number} index - Index of the note in the array
 */
function createNoteElement(note, index) {
  const notesList = document.getElementById('notes-list');

  const noteEl = document.createElement('div');
  noteEl.className = 'note';

  // Note Text
  const noteText = document.createElement('span');
  noteText.className = 'note-text';
  noteText.textContent = `[${capitalizeFirstLetter(note.category)}] ${note.text}`;
  noteEl.appendChild(noteText);

  // Note Buttons Container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'buttons-container';

  // Pin Button
  const pinBtn = document.createElement('button');
  pinBtn.textContent = note.pinned ? 'Unpin' : 'Pin';
  pinBtn.className = 'pin-btn';
  pinBtn.addEventListener('click', () => togglePin(index));
  buttonsContainer.appendChild(pinBtn);

  // Edit Button
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'edit-btn';
  editBtn.addEventListener('click', () => editNote(index));
  buttonsContainer.appendChild(editBtn);

  // Delete Button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete-btn';
  deleteBtn.addEventListener('click', () => deleteNote(index));
  buttonsContainer.appendChild(deleteBtn);

  noteEl.appendChild(buttonsContainer);
  notesList.appendChild(noteEl);
}

/**
 * Save a new note
 */
function saveNote() {
  const noteInput = document.getElementById('note-input');
  const categorySelect = document.getElementById('category-select');
  const noteText = noteInput.value.trim();
  const noteCategory = categorySelect.value;

  if (noteText === '') {
    alert('Please enter a note.');
    return;
  }

  const newNote = {
    id: Date.now(), // Unique identifier
    text: noteText,
    category: noteCategory,
    pinned: false
  };

  chrome.storage.sync.get(['notes'], function(result) {
    const notes = result.notes || [];
    notes.push(newNote);
    chrome.storage.sync.set({ notes }, function() {
      renderNotes(notes);
      document.getElementById('note-input').value = ''; // Clear input
    });
  });
}

/**
 * Auto-save note while typing (creates a temporary note)
 */
function autoSaveNote() {
  // Optional: Implement auto-save logic if needed
  // For this implementation, we'll keep the manual save button
  // Alternatively, you can implement live saving as user types
}

/**
 * Delete a note
 * @param {number} index - Index of the note to delete
 */
function deleteNote(index) {
  chrome.storage.sync.get(['notes'], function(result) {
    let notes = result.notes || [];
    notes.splice(index, 1); // Remove the note
    chrome.storage.sync.set({ notes }, function() {
      renderNotes(notes);
    });
  });
}

/**
 * Edit a note
 * @param {number} index - Index of the note to edit
 */
function editNote(index) {
  chrome.storage.sync.get(['notes'], function(result) {
    let notes = result.notes || [];
    const note = notes[index];
    const newText = prompt('Edit your note:', note.text);
    if (newText !== null) {
      const trimmedText = newText.trim();
      if (trimmedText !== '') {
        notes[index].text = trimmedText;
        chrome.storage.sync.set({ notes }, function() {
          renderNotes(notes);
        });
      }
    }
  });
}

/**
 * Toggle pin status of a note
 * @param {number} index - Index of the note to pin/unpin
 */
function togglePin(index) {
  chrome.storage.sync.get(['notes'], function(result) {
    let notes = result.notes || [];
    notes[index].pinned = !notes[index].pinned;
    chrome.storage.sync.set({ notes }, function() {
      renderNotes(notes);
    });
  });
}

/**
 * Filter notes based on search input
 */
function filterNotes() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  chrome.storage.sync.get(['notes'], function(result) {
    const notes = result.notes || [];
    const filteredNotes = notes.filter(note =>
      note.text.toLowerCase().includes(searchInput) ||
      note.category.toLowerCase().includes(searchInput)
    );
    renderNotes(filteredNotes);
  });
}

/**
 * Toggle between dark and light mode
 */
function toggleTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  body.classList.toggle('dark-mode');
  const isDarkMode = body.classList.contains('dark-mode');
  themeToggle.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
  chrome.storage.sync.set({ theme: isDarkMode ? 'dark' : 'light' });
}

/**
 * Load saved theme from storage
 */
function loadTheme() {
  chrome.storage.sync.get(['theme'], function(result) {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    if (result.theme === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.textContent = 'Light Mode';
    } else {
      body.classList.remove('dark-mode');
      themeToggle.textContent = 'Dark Mode';
    }
  });
}

/**
 * Capitalize the first letter of a string
 * @param {string} string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
