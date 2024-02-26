import React from "react";
import { MdDelete } from "react-icons/md";
import "./note.css";
import axios from "axios";
import BASE_URL from "../../../config";
import { useAuth } from "../../context/AuthContext";

function Note(props) {

    const { state } = useAuth();
    const { isAuthenticated } = state;
    const handleClick = async () => {

        if (!isAuthenticated) {
            alert("Please login to delete a note");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this note?")) {
            return;
        }


        const response = await axios.delete(`${BASE_URL}/delete-note/${props.id}`, {
            headers: {
                "Content-Type": "application/json",
                "sessionId": localStorage.getItem("sessionId"),
            },
        });

        if (response.data.success) {
            alert(response.data.message);
            props.onNoteDeleted(props.id);
        }
        else {
            console.error("Failed to delete note");
        }

    }

    const formattedDate = new Date(props.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <div className="note" >
            <h1>{props.title}</h1>
            <p>{props.content}</p>
            <small>{formattedDate}</small>
            <button onClick={handleClick}><MdDelete className="delete-icon" /></button>
        </div>
    );
}

export default Note;