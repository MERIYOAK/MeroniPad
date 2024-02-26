import React, { useState, useEffect } from "react";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Note from "./components/note/Note";
import CreateArea from "./components/createArea/CreateArea";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sign_up from "./components/sign-up/Sign-up";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import BASE_URL from "../config";


function App() {
  const { dispatch } = useAuth();
  const [notes, setNotes] = useState([]);
  const fetchData = async () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const sessionId = localStorage.getItem('sessionId');
    const userId = localStorage.getItem('userId');

    if (isAuthenticated === 'true' && sessionId && userId) {
      try {
        const response = await axios.get(`${BASE_URL}/notes`, {
          params: {
            userId,
          },
          headers: {
            'Content-Type': 'application/json',
            'sessionId': sessionId
          },
        });

        const data = response.data;
        if (data.success) {
          setNotes(data.notes);
        }
      } catch (error) {
        console.error(error);
      }
      // If session data is present, set the user as authenticated
      dispatch({
        type: 'LOGIN',
        payload: {
          id: userId,
          isAuthenticated: true,
          firstName: localStorage.getItem('firstName'),
          middleName: localStorage.getItem('middleName'),
          lastName: localStorage.getItem('lastName'),
          username: localStorage.getItem('username'),
          email: localStorage.getItem('email'),
        },
      });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const handleNoteAdded = (newNote) => {
    // Update the state with the newly added note
    setNotes(prevNotes => [newNote, ...prevNotes]);
  };

  const handleNoteDeleted = (noteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);


  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <CreateArea onNoteAdded={handleNoteAdded} />
              {notes.map((noteItem, index) => (
                <Note
                  key={index}
                  id={noteItem._id}
                  title={noteItem.title}
                  content={noteItem.content}
                  onNoteDeleted={handleNoteDeleted}
                  date={noteItem.createdAt}
                />
              ))}
              <Footer />
            </>
          }
        />
        <Route path="/sign_up" element={<Sign_up />} />
      </Routes>
    </Router>
  );
}


export default App;

