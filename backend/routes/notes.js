const router = require("express").Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Route:1 Create a new note using : GET /api/notes/fetchallnotes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id }); // Find all the notes with the user id
  res.json(notes);
});

// Route:2 Create a new note using : POST /api/notes/addnote
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }), // Validate the title
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }), // Validate the description
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body; // Destructure the title, description and tag from the request body
      const errors = validationResult(req); // Check if there are any validation errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      console.log(req.user);
      // Create a new note
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNote = await note.save(); // Save the note
      res.json(savedNote); // Return the saved note
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route:3 Update an existing note using : PUT /api/notes/updatenote/:id
 router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body; // Destructure the title, description and tag from the request body
    try {
        // Create a newNote object
        const newNote = {};
        if (title) {
        newNote.title = title;
        }
        if (description) {
        newNote.description = description;
        }
        if (tag) {
        newNote.tag = tag;
        }
    
        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) {
        return res.status(404).send("Not Found");
        }
    
        if (note.user.toString() !== req.user.id) {// Allow update only if user owns the note
        return res.status(401).send("Not Allowed");
        }
    
        note = await Notes.findByIdAndUpdate(
        req.params.id,// Find the note by id
        { $set: newNote },// Set the newNote object
        { new: true }// Return the updated note
        );
        res.json({ note });// Return the updated note
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
 });

 // Route:4 Delete an existing note using : DELETE /api/notes/deletenote/:id
    router.delete("/deletenote/:id", fetchuser, async (req, res) => {
        try {
            // Find the note to be deleted
            let note = await Notes.findById(req.params.id);
            if (!note) {
            return res.status(404).send("Not Found");
            }
            console.log(note);
            // Allow delete only if user owns the note
            if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
            }
        
            // Delete the note
            note = await Notes.findByIdAndDelete(req.params.id);
            res.json({ success: "Note has been deleted", note: note });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    });
module.exports = router;
