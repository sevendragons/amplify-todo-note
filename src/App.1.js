import React, { Component } from 'react';
import {withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { onCreateTodoNote, onDeleteTodoNote, onUpdateTodoNote } from './graphql/subscriptions';

import styled from 'styled-components';


import {
  createTodoNote,
  deleteTodoNote,
  updateTodoNote
} from './graphql/mutations';
import { listTodoNotes } from './graphql/queries';

const Button = styled.button`
  outline: none;
  background-color: #71CAD0 !important;
  padding: 8px;
  margin-left: 16px;
  &:hover{
    background-color: #F91B46 !important;
  }
  &:focus{
    outline: none;
  }
  &:active{
    outline: dashed 4px blue;
    transform: scale(1.2, 1.2);
  }
 
` ;
const Input = styled.input`
  background-color: #EDBAF6 !important;
  padding: 8px;
  margin-right: 16px;
  border: 3px solid #0D74F5;
  &:hover{
    background-color: #BADEEA !important;
  }

  &:focus{
    outline: dashed 4px #F70D56;
    transform: scale(1.1, 1.1);
    color: #1C530C
    border: none;

  }
 
` ;

class App extends Component {
  // state = {
  //   notes: [{
  //     id: 1,
  //     note: "Hello ToDo List"
  //   }]
  // }
  state = {
    id: "",
    note: "",
    notes: []
  }

  componentDidMount() {
    this.getNotes();
    this.createNoteListener = API.graphql(graphqlOperation(onCreateTodoNote)).subscribe({
      next: noteData => {
        // console.log(noteData);
        const newNote = noteData.value.data.onCreateTodoNote
        const prevNotes = this.state.notes.filter(note => note.id !== newNote.id)
        const updatedNotes = [...prevNotes, newNote];
        this.setState({notes: updatedNotes})
      }
    });

    this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteTodoNote)).subscribe({
      next: noteData => {
        const deletedNote = noteData.value.data.onDeleteTodoNote
        const updatedNotes = this.state.notes.filter(note => note.id !== deletedNote.id)
        this.setState({notes:updatedNotes})
      }
    });

    this.updateNoteListener = API.graphql(graphqlOperation(onUpdateTodoNote)).subscribe({
      next: noteData => {
        const { notes } = this.state;
        const updatedNote = noteData.value.data.onUpdateTodoNote;
        const index = notes.findIndex(note => note.id === updatedNote.id)

         // Be careful this one; value is so similar.
         const updatedNotes = [
           ...notes.slice(0, index),
           updatedNote,
           ...notes.slice(index + 1)
         ];

         this.setState({
           notes: updatedNotes,
           note: "",
           id: ""
         });
      }
    });


  }
  
  componentWillUnmount() {
    this.createNoteListener.unsubscribe();
    this.deleteNoteListener.unsubscribe();
    this.updateNoteListener.unsubscribe();
  }


  getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listTodoNotes));
    this.setState({ notes:result.data.listTodoNotes.items })
    
  }

  handleSetNote = ({note, id}) => this.setState({note, id})

  handleChangeNote = event => {
    this.setState({ note: event.target.value })
  }

  hasExistingNote = () => {
    const {notes, id} = this.state
    if (id) {
      // is the id  a valid id?
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false;
  }
  

  handleAddNote = async event => {
    const {note, notes} = this.state;
    event.preventDefault();

    // check if we have an existing note, if so update it
    if (this.hasExistingNote()) {
      // console.log('note updated!');
      this.handleUpdateNote()
    } else {
      const input = { note };
      await API.graphql(graphqlOperation( createTodoNote, { input} ));
      // const result = await API.graphql(graphqlOperation( createTodoNote, { input} ));
      // const newNote = result.data.createTodoNote;
      // const updatedNote = [newNote, ...notes];
      this.setState({ note: '' });
    }
  }

  handleUpdateNote = async () => {
    const { id, note } = this.state;
    // const { notes, id, note } = this.state;
    const input = { id, note }
    // const result = await API.graphql(graphqlOperation(updateTodoNote, { input }));
    await API.graphql(graphqlOperation(updateTodoNote, { input }));
    // const updatedNote = result.data.updateTodoNote;
    // const index = notes.findIndex(note => note.id === updatedNote.id)
  
    // // Be careful this one; value is so similar.
    // const updatedNotes = [
    //   ...notes.slice(0, index),
    //   updatedNote,
    //   ...notes.slice(index + 1)
    // ];

    // this.setState({ notes: updatedNotes, note: "", id: "" });
  }

  handleDeleteNote = async noteId => {
    const { notes } = this.state
    const input = { id: noteId }
    await API.graphql( graphqlOperation(deleteTodoNote, {input}) )
    // const result = await API.graphql( graphqlOperation(deleteTodoNote, {input}) )
    // const deleteNoteId = result.data.deleteTodoNote.id
    // const updatedNotes = notes.filter(note => 
      // note.id !== deleteNoteId
    // )
    // this.setState({ notes: updatedNotes })

  }

  refreshPage() {
    console.log("Clicked");
    window.location.reload();
  }

  render() {
    const { id, notes, note } = this.state;
    const { handleChangeNote, handleAddNote, handleDeleteNote, handleSetNote } = this;

    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-1">
          To Do Note
          {/* Form */}
          <form onSubmit={handleAddNote} className="mb3">
            <Input type="text" 
                    className="pa2 f4"
                    placeholder="Write todo here 🏎"
                    onChange={handleChangeNote}
                    value={note}
                    />
            <button type="submit" className="pa2 f4 btn-info">
              {id ? "Update Note" : "Add Note"}
            </button>
          </form>

          {/* List */}
          <div>
            { notes.map( item => (
              <div key={item.id} className="flex items-center">
                <li onClick={ () => handleSetNote(item) } className="list pa1 f3" style={{margin: '12px auto'}}>
                  {item.note}
                </li>
                <Button onClick={ () => handleDeleteNote(item.id) }className="bg-transparent bn f4 primary">
                  <span >&times; ⛑ 🤺</span>
                </Button>
              </div>
            )) }

          </div>
        </h1>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
