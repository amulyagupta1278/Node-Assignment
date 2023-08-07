// Import required modules
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const mongoURL = 'mongodb://localhost:27017'; // Update with your MongoDB connection string

// Use body-parser middleware to parse JSON requests
server.use(bodyParser.json());

// MongoDB Connection
let db;

MongoClient.connect(mongoURL, (err, client) => {
  if (err) throw err;
  db = client.db('DB_NAME'); // Replace with your database name
  console.log('Connected to MongoDB');
});

// GET Event by ID
server.get('/api/v3/app/events', async (req, res) => {
  const eventId = req.query.id;
  
  try {
    // Find a single event by its ID and send as JSON response
    const event = await db.collection('events').findOne({ _id: new require('mongodb').ObjectId(eventId) });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// GET Latest Events with Pagination
server.get('/api/v3/app/events/latest', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5; // Set default limit to 5 if not provided
  const page = parseInt(req.query.page) || 1;   // Set default page to 1 if not provided
  
  try {
    // Find and send the latest events with pagination
    const events = await db.collection('events')
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
  
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// POST Create Event
server.post('/api/v3/app/events', async (req, res) => {
  const eventData = req.body;
  
  try {
    // Insert a new event into the database and send its ID as response
    const result = await db.collection('events').insertOne(eventData);
    res.json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// PUT Update Event by ID
server.put('/api/v3/app/events/:id', async (req, res) => {
  const eventId = req.params.id;
  const eventData = req.body;
  
  try {
    // Update an event by its ID and send a success message
    await db.collection('events').updateOne({ _id: new require('mongodb').ObjectId(eventId) }, { $set: eventData });
    res.json({ message: 'Event updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// DELETE Event by ID
server.delete('/api/v3/app/events/:id', async (req, res) => {
  const eventId = req.params.id;
  
  try {
    // Delete an event by its ID and send a success message
    await db.collection('events').deleteOne({ _id: new require('mongodb').ObjectId(eventId) });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
