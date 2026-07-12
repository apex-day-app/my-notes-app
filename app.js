// ऐप का मुख्य JavaScript

let notes = [];
let editingId = null;

// DOM एलिमेंट्स
const notesContainer = document.getElementById('notesContainer');
const modal = document.getElementById('modal');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const addNoteBtn = document.getElementById('addNoteBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// लोड होने पर नोट्स लाएं
document.addEventListener('DOMContentLoaded', loadNotes);

// ईवेंट लिस्नर्स
addNoteBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
saveNoteBtn.addEventListener('click', saveNote);

// मोडल बंद करें अगर बाहर क्लिक करें
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// एंटर की से सेव करें (शीर्षक में)
noteTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        noteContent.focus();
    }
});

// Ctrl+Enter से सेव करें (कंटेंट में)
noteContent.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        saveNote();
    }
});

// नोट्स लोड करें
function loadNotes() {
    const saved = localStorage.getItem('notes');
    if (saved) {
        try {
            notes = JSON.parse(saved);
            renderNotes();
        } catch (e) {
            notes = [];
        }
    } else {
        renderNotes();
    }
}

// नोट्स सेव करें
function saveNotesToStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// नोट्स रेंडर करें
function renderNotes() {
    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="#ccc" style="margin-bottom:12px;">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                <p>अभी कोई नोट नहीं है</p>
                <p class="sub-text">"नया" बटन दबाकर नोट बनाएं</p>
            </div>
        `;
        return;
    }

    // नए से पुराने क्रम में (रिवर्स)
    const sortedNotes = [...notes].reverse();
    
    notesContainer.innerHTML = sortedNotes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <h3>${escapeHtml(note.title) || 'बिना शीर्षक'}</h3>
            <p>${escapeHtml(note.content) || 'कोई कंटेंट नहीं'}</p>
            <span class="note-time">${formatTime(note.timestamp)}</span>
            <button class="delete-btn" onclick="deleteNote('${note.id}')">
                <svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                हटाएं
            </button>
        </div>
    `).join('');
}

// HTML एस्केप करें (XSS से बचाव)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// टाइम फॉर्मेट करें
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'अभी';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' मिनट पहले';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' घंटे पहले';
    if (diff < 172800000) return 'कल';
    
    return date.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// मोडल खोलें
function openModal(noteId = null) {
    if (noteId) {
        // एडिट मोड
        const note = notes.find(n => n.id === noteId);
        if (note) {
            editingId = noteId;
            noteTitle.value = note.title || '';
            noteContent.value = note.content || '';
            document.querySelector('.modal-content h2').innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                नोट संपादित करें
            `;
            saveNoteBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                अपडेट करें
            `;
        }
    } else {
        // नया नोट
        editingId = null;
        noteTitle.value = '';
        noteContent.value = '';
        document.querySelector('.modal-content h2').innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            नया नोट
        `;
        saveNoteBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
            </svg>
            सेव करें
        `;
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => noteTitle.focus(), 100);
}

// मोडल बंद करें
function closeModal() {
    modal.classList.add('hidden');
    noteTitle.value = '';
    noteContent.value = '';
    editingId = null;
}

// नोट सेव करें
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title && !content) {
        alert('कृपया कम से कम शीर्षक या कंटेंट तो लिखें!');
        return;
    }
    
    if (editingId) {
        // एडिट
        const index = notes.findIndex(n => n.id === editingId);
        if (index !== -1) {
            notes[index].title = title;
            notes[index].content = content;
            notes[index].timestamp = Date.now();
        }
    } else {
        // नया
        const newNote = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            title: title,
            content: content,
            timestamp: Date.now()
        };
        notes.push(newNote);
    }
    
    saveNotesToStorage();
    renderNotes();
    closeModal();
}

// नोट डिलीट करें
function deleteNote(id) {
    if (confirm('क्या आप यह नोट हटाना चाहते हैं?')) {
        notes = notes.filter(n => n.id !== id);
        saveNotesToStorage();
        renderNotes();
    }
}

// कीबोर्ड शॉर्टकट
document.addEventListener('keydown', (e) => {
    // Ctrl + N = नया नोट
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openModal();
    }
    
    // ESC = मोडल बंद करें
    if (e.key === 'Escape') {
        closeModal();
    }
});

// लोड होने पर offline चेक
window.addEventListener('online', () => {
    const banner = document.getElementById('offlineBanner');
    if (banner) banner.remove();
});

window.addEventListener('offline', () => {
    if (!document.getElementById('offlineBanner')) {
        const offlineMsg = document.createElement('div');
        offlineMsg.id = 'offlineBanner';
        offlineMsg.textContent = '📡 आप ऑफलाइन हैं - सेव्ड डेटा के साथ काम कर रहे हैं';
        document.body.prepend(offlineMsg);
    }
});
