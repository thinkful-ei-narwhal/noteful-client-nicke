import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import { getNotesForFolder, findNote, findFolder } from '../notes-helpers';
import './App.css';
import Config from './../config'

class App extends Component {
  state = {
    notes: [],
    folders: []
  };

  componentDidMount() {
    const getObj = {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${Config.API_KEY}`,
      })
    }

    // fake date loading from API call
    let notes;
    let folders;
    fetch("http://localhost:8000/notes", getObj)
      .then(res => {
        if (!res.ok) {
          throw Error("Failed to fetch");
        }
        else {
          return res.json();
        }
      })
      .then(resJson => {
        notes = resJson;
        this.setState({ notes: notes });
      })
      .catch((err) => console.log(err));

    fetch("http://localhost:8000/folders", getObj)
      .then(res => {
        if (!res.ok) {
          throw Error("Failed to fetch");
        }
        else {
          return res.json();
        }
      })
      .then(resJson => {
        folders = resJson;
        this.setState({ folders: folders });
      })
      .catch((err) => console.log(err));
  }

  renderNavRoutes() {
    const { notes, folders } = this.state;
    return (
      <>
        {['/', '/folder/:folderId'].map(path => (
          <Route
            exact
            key={path}
            path={path}
            render={routeProps => (
              <NoteListNav
                folders={folders}
                notes={notes}
                {...routeProps}
              />
            )}
          />
        ))}
        <Route
          path="/note/:noteId"
          render={routeProps => {
            const { noteId } = routeProps.match.params;
            const note = findNote(notes, noteId) || {};
            const folder = findFolder(folders, note.folderId);
            return <NotePageNav {...routeProps} folder={folder} />;
          }}
        />
        <Route path="/add-folder" component={NotePageNav} />
        <Route path="/add-note" component={NotePageNav} />
      </>
    );
  }

  renderMainRoutes() {
    const { notes } = this.state;
    return (
      <>
        {['/', '/folder/:folderId'].map(path => (
          <Route
            exact
            key={path}
            path={path}
            render={routeProps => {
              const { folderId } = routeProps.match.params;
              const notesForFolder = getNotesForFolder(
                notes,
                folderId
              );
              return (
                <NoteListMain
                  {...routeProps}
                  notes={notesForFolder}
                />
              );
            }}
          />
        ))}
        <Route
          path="/note/:noteId"
          render={routeProps => {
            const { noteId } = routeProps.match.params;
            const note = findNote(notes, noteId);
            return <NotePageMain {...routeProps} note={note} />;
          }}
        />
      </>
    );
  }

  render() {
    return (
      <div className="App">
        <nav className="App__nav">{this.renderNavRoutes()}</nav>
        <header className="App__header">
          <h1>
            <Link to="/">Noteful</Link>{' '}
            <FontAwesomeIcon icon="check-double" />
          </h1>
        </header>
        <main className="App__main">{this.renderMainRoutes()}</main>
      </div>
    );
  }
}

export default App;
