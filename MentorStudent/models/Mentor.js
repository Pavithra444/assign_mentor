
const mongoose = require('mongoose');

// mentor schema
const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student' // Referencing the Student model
  }]
}, { timestamps: true });


const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;
