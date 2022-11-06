import Note from './components/Note'
import {useEffect, useState} from "react";
import noteService from './services/notes';

const Notification = ({message}) => {
    if (message === null) {
        return null;
    }

    return (
        <div className="error">
            {message}
        </div>
    );
}

const Footer = () => {
    const footerStyle = {
        color: 'green',
        fontStyle: 'italic',
        fontSize: 16
    };

    return (
        <div style={footerStyle}>
            <em>Note app, Department of Computer Science, University of Helsinki 2022</em>
        </div>
    );
}

const App = () => {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('');
    const [showAll, setShowAll] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        noteService.getAll()
            .then(initialNotes => {
                setNotes(initialNotes)
            });
    }, []);

    const addNote = (event) => {
        event.preventDefault();
        const noteObject = {
            content: newNote,
            date: new Date().toISOString(),
            important: Math.random() < 0.5,
        }

        noteService.create(noteObject)
            .then(createdNote => {
                setNotes(notes.concat(createdNote));
                setNewNote('');
            });
    }

    const handleNoteChange = (event) => {
        setNewNote(event.target.value);
    }

    const notesToShow = showAll
        ? notes
        : notes.filter(note => note.important);

    const toggleImportanceOf = (id) => {
        const note = notes.find(n => n.id === id);
        const changedNote = {...note, important: !note.important};

        noteService.update(id, changedNote)
            .then(updatedNote => {
                setNotes(notes.map(n => n.id !== id ? n : updatedNote));
            })
            .catch(error => {
                setErrorMessage(`The note ${id} does not exist on the server`);
            });
        setNotes(notes.filter(n => n.id !== id));
    }

    return (
        <div>
            <h1>Notes</h1>
            <Notification message={errorMessage}/>

            <div>
                <button onClick={() => setShowAll(!showAll)}>
                    show {showAll ? 'important' : 'all'}
                </button>
            </div>
            <ul>
                {notesToShow.map(note =>
                    <Note key={note.id} note={note}
                          toggleImportance={() => toggleImportanceOf(note.id)}/>
                )}
            </ul>
            <form onSubmit={addNote}>
                <input value={newNote} onChange={handleNoteChange}/>
                <button type="submit">save</button>
            </form>

            <Footer/>
        </div>
    )
}

export default App;
