require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the MySQL connection pool

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint to fetch all todos
app.get('/todos', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM todos');
    res.json(results);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to add a new todo
app.post('/todos', async (req, res) => {
  const { task, completed } = req.body;
  const todo = { task, completed }; // Create an object with correct property names

  try {
    const [results] = await db.query('INSERT INTO todos SET ?', todo);
    const insertedId = results.insertId;
    res.status(201).json({ id: insertedId, ...todo });
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update a todo
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  // Determine which fields are being updated
  const updatedFields = {};
  if (task) updatedFields.task = task;
  if (completed !== undefined) updatedFields.completed = completed;

  try {
    await db.query('UPDATE todos SET ? WHERE id = ?', [updatedFields, id]);
    const updatedTodo = { id, ...updatedFields };
    res.json(updatedTodo);
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to delete a todo
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM todos WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
