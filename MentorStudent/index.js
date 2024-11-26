
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Mentor = require('./models/Mentor');
const Student = require('./models/Student');


const app = express();

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mentorDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error));

// API route to create a new mentor
app.post('/api/mentors', async (req, res) => {
  const { name, email, skills, bio, phone } = req.body;

  try {
    // Create 
    const mentor = new Mentor({
      name,
      email,
      skills,
      bio,
      phone,
    });

    // Save
    const savedMentor = await mentor.save();
    res.status(201).json(savedMentor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating mentor', error });
  }
});

// Test 
app.get('/', (req, res) => {
  res.send('Mentor API is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

app.post('/api/students', async (req, res) => {
  const { firstName, lastName, email, dateOfBirth, phone, courses } = req.body;

  try {
    // Create a new student document
    const student = new Student({
      firstName,
      lastName,
      email,
      dateOfBirth,
      phone,
      courses,
    });

    // Save the student to the database
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating student', error });
  }
});

// API route to get a list of all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving students', error });
  }
});

// API route to get a student by ID
app.get('/api/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving student', error });
  }
});


// API route to assign a student to a mentor
app.post('/api/assign-mentor', async (req, res) => {
  const { studentId, mentorId } = req.body;

  try {
    // Find the student and mentor by their respective IDs
    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Assign the mentor to the student
    student.mentor = mentorId;
    await student.save();

    // Add the student to the mentor's students list
    mentor.students.push(studentId);
    await mentor.save();

    res.status(200).json({ message: 'Student assigned to mentor successfully', student, mentor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning student to mentor', error });
  }
});

// API route to get all students who do not have a mentor
app.get('/api/students_without_mentor', async (req, res) => {
  try {
    // Find students who don't have a mentor
    const students = await Student.find({ mentor: null });

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving students', error });
  }
});

// API route to assign or change mentor for a particular student
app.post('/api/assign-change-mentor', async (req, res) => {
  const { studentId, mentorId } = req.body;

  try {
    // Find the student and mentor by their respective IDs
    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // If the student already has a mentor, remove the student from the previous mentor's list
    if (student.mentor) {
      const previousMentor = await Mentor.findById(student.mentor);
      previousMentor.students = previousMentor.students.filter(id => id.toString() !== studentId);
      await previousMentor.save();
    }

    // Assign the new mentor to the student
    student.mentor = mentorId;
    await student.save();

    // Add the student to the new mentor's list
    mentor.students.push(studentId);
    await mentor.save();

    res.status(200).json({ message: 'Mentor assigned/changed successfully', student, mentor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning or changing mentor', error });
  }
});

// API route to get all students assigned to a particular mentor
app.get('/api/mentor/:mentorId/students', async (req, res) => {
  const { mentorId } = req.params;

  try {
    // Find the mentor by ID and populate the students array
    const mentor = await Mentor.findById(mentorId).populate('students');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Return the list of students for this mentor
    res.status(200).json(mentor.students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving students for mentor', error });
  }
});


// API route to get the mentor assigned to a particular student
app.get('/api/student/:studentId/mentor', async (req, res) => {
  const { studentId } = req.params;

  try {
    // Find the student by ID
    const student = await Student.findById(studentId).populate('mentor');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the student has an assigned mentor
    if (!student.mentor) {
      return res.status(404).json({ message: 'This student does not have a mentor assigned' });
    }

    // Return the mentor details
    res.status(200).json(student.mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving mentor for student', error });
  }
});
