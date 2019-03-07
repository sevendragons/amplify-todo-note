import React, {
  useState,
  useEffect
} from 'react';
import {
  withAuthenticator
} from 'aws-amplify-react';
import {
  API,
  graphqlOperation
} from 'aws-amplify';
import {
  onCreateTodoNote,
  onDeleteTodoNote,
  onUpdateTodoNote
} from './graphql/subscriptions';

import styled from 'styled-components';


import {
  createTodoNote,
  deleteTodoNote,
  updateTodoNote
} from './graphql/mutations';
import {
  listTodoNotes
} from './graphql/queries';

const Button = styled.button `
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
 
`;
const Input = styled.input `
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
 
`;

const App = () => {
  const [id, setId] = useState("")
  const [note, setNote] = useState("")
  const [notes, setNotes] = useState([])

  // similar like componentDidMount
  useEffect(() => {
    getNotes();
    const createNoteListener = API.graphql(graphqlOperation(onCreateTodoNote)).subscribe({
      next: noteData => {
        const newNote = noteData.value.data.onCreateTodoNote
        setNotes(prevNotes => {
          const oldNotes = prevNotes.filter(note => note.id !== newNote.id);
          const updatedNotes = [...oldNotes, newNote];
          return updatedNotes;
        })
        setNote("")
      }
    });

    const deleteNoteListener = API.graphql(graphqlOperation(onDeleteTodoNote)).subscribe({
      next: noteData => {
        const deletedNote = noteData.value.data.onDeleteTodoNote
        setNotes(prevNotes => {
          const updatedNotes = prevNotes.filter(note => note.id !== deletedNote.id);
          return updatedNotes;
        })
      }
    });

    const updateNoteListener = API.graphql(graphqlOperation(onUpdateTodoNote)).subscribe({
      next: noteData => {
        const updatedNote = noteData.value.data.onUpdateTodoNote;
        setNotes(prevNotes => {
          const index = prevNotes.findIndex(note => note.id === updatedNote.id);
          const updatedNotes = [
            ...prevNotes.slice(0, index),
            updatedNote,
            ...prevNotes.slice(index + 1)
          ];
          return updatedNotes;
        })
        setNote("")
        setId("")
      }
    });

    return () => {
      createNoteListener.unsubscribe();
      deleteNoteListener.unsubscribe();
      updateNoteListener.unsubscribe();
    }
  }, [])

  const getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listTodoNotes));
    setNotes(result.data.listTodoNotes.items)

  }

  const handleSetNote = ({
    note,
    id
  }) => {
    setNote(note)
    setId(id)
  }
  const handleChangeNote = event => {
    setNote(event.target.value);
  }

  const hasExistingNote = () => {
    if (id) {
      // is the id  a valid id?
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false;
  }


  const handleAddNote = async event => {
    event.preventDefault();

    // check if we have an existing note, if so update it
    if (hasExistingNote()) {
      // console.log('note updated!');
      handleUpdateNote()
    } else {
      const input = {
        note
      };
      await API.graphql(graphqlOperation(createTodoNote, {
        input
      }));
    }
  }

  const handleUpdateNote = async () => {
    const input = {
      id,
      note
    }
    await API.graphql(graphqlOperation(updateTodoNote, {
      input
    }));
  }

  const handleDeleteNote = async noteId => {
    const input = {
      id: noteId
    }
    await API.graphql(graphqlOperation(deleteTodoNote, {
      input
    }))
  }


  return ( <
    div className = "flex flex-column items-center justify-center pa3 bg-washed-red" >
    <
    h1 className = "code f2-1" >
    To Do Note {
      /* Form */ } <
    form onSubmit = {
      handleAddNote
    }
    className = "mb3" >
    <
    Input type = "text"
    className = "pa2 f4"
    placeholder = "Write todo here 🏎"
    onChange = {
      handleChangeNote
    }
    value = {
      note
    }
    /> <
    button type = "submit"
    className = "pa2 f4 btn-info" > {
      id ? "Update Note" : "Add Note"
    } <
    /button> <
    /form>

    {
      /* List */ } <
    div > {
      notes.map(item => ( <
        div key = {
          item.id
        }
        className = "flex items-center" >
        <
        li onClick = {
          () => handleSetNote(item)
        }
        className = "list pa1 f3"
        style = {
          {
            margin: '12px auto'
          }
        } > {
          item.note
        } <
        /li> <
        Button onClick = {
          () => handleDeleteNote(item.id)
        }
        className = "bg-transparent bn f4 primary" >
        <
        span > & times;⛑🤺 < /span> <
        /Button> <
        /div>
      ))
    }

    <
    /div> <
    /h1> <
    /div>
  )
}

export default withAuthenticator(App, {
  includeGreetings: true
});