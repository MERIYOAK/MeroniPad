import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import "./createArea.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import BASE_URL from "../../../config";

function CreateArea({ onNoteAdded }) {
    const { state } = useAuth();
    const { isAuthenticated, user } = state;
    const [note, setNote] = useState({
        title: "",
        content: "",
        userId: "",
    });
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setNote({
            title: name === "title" ? value : note.title,
            content: name === "content" ? value : note.content,
            userId: user ? localStorage.getItem("userId") : "",
        });
    };
    const submitNote = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}/add-note`, note, {
                headers: {
                    "Content-Type": "application/json",
                    "sessionId": localStorage.getItem("sessionId"),
                },
            });

            const data = response.data;

            if (data.success) {
                alert("Note added successfully");
                setNote({
                    title: "",
                    content: "",
                });

                setIsExpanded(false);
                onNoteAdded(note);
            } else {
                console.error("Failed to add note");
            }
        } catch (error) {
            console.error("Error submitting note:", error);
        }
    };

    function expand() {
        setIsExpanded(true);
    }

    return (
        <div className="create-note-div">
            <form className="create-note" onSubmit={submitNote}>
                {isExpanded && (
                    <input
                        name="title"
                        onChange={handleChange}
                        value={note.title}
                        placeholder="Title"
                    />
                )}

                <textarea
                    name="content"
                    onChange={handleChange}
                    value={note.content}
                    placeholder="Take a note..."
                    rows={isExpanded ? 3 : 1}
                    onClick={expand}
                />
                <button title="Add Note" type="submit" className={isExpanded && isAuthenticated ? "expanded" : "no-expanded"}>
                    <IoMdAdd className="add-icon" />
                </button>
            </form>
        </div>
    );
}

export default CreateArea;
