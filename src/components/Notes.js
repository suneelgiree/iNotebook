import React, { useContext, useEffect, useRef, useState } from "react";
import NoteContext from "../context/notes/noteContext";
import Noteitem from "./Noteitem";
import AddNote from "./AddNote";
import { useNavigate } from "react-router-dom";

const Notes = (props) => {
  const context = useContext(NoteContext);
  let navigate = useNavigate();
  const { notes, getNotes, editNote } = context;

  useEffect(() => {
    if (localStorage.getItem("token")){ // Check if user is logged in
    getNotes(); // Fetch notes on component mount
  }else{
    navigate("/login");
  }
    // eslint-disable-next-line
  }, []);

  const [note, setNote] = useState({ id: "", title: "", description: "", tag: "" });

  const ref = useRef(); // Reference for the modal open button
  const refClose = useRef(); // Reference for the modal close button

  const updateNote = (currentNote) => {
    // Update state with the selected note details
    setNote({
      id: currentNote._id,
      title: currentNote.title,
      description: currentNote.description,
      tag: currentNote.tag,
    });
    ref.current.click(); // Trigger the hidden button to open the modal
  };

  const handleClick = (e) => {
    e.preventDefault();
    // Logic to update the note on the server
    console.log("Updated Note:", note);
    editNote(note.id, note.title, note.description, note.tag);
    refClose.current.click(); // Close the modal after saving changes
    props.showAlert("Updated Successfully","success");
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value }); // Update note state as user types
  };

  return (
    <>
      {/* Hidden Button to Trigger Modal */}
      <button
        ref={ref}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Launch demo modal
      </button>

      <AddNote showAlert={props.showAlert}/>

      {/* Modal */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Edit Note
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form className="my-3">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={note.title}
                    onChange={onChange}
                    minLength={5} 
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={note.description}
                    onChange={onChange}
                    minLength={5} 
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="tag" className="form-label">
                    Tag
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="tag"
                    name="tag"
                    value={note.tag}
                    onChange={onChange}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                ref={refClose}
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
              disabled={note.title.length < 5 || note.description.length < 5}
                type="button"
                className="btn btn-primary"
                onClick={handleClick}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="row my-3">
      <div className="conatiner mx-2">
        {notes.length === 0 && <p>No notes to display</p>}
      </div>
        {Array.isArray(notes) ? (
          notes.map((note) => (
            <Noteitem note={note} updateNote={updateNote} showAlert={props.showAlert} key={note._id} />
          ))
        ) : (
          <p>No notes available</p>
        )}
      </div>
    </>
  );
};

export default Notes;

