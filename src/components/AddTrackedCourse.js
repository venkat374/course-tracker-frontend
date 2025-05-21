// frontend/src/components/AddTrackedCourse.js
import React, { useState } from 'react';
import axios from 'axios';
// Changed import for React Router v5: useHistory
import { useHistory } from 'react-router-dom';

function AddTrackedCourse({ loggedInUserId }) {
  const [courseName, setCourseName] = useState('');
  const [status, setStatus] = useState('Ongoing');
  const [instructor, setInstructor] = useState('');
  const [completionDate, setCompletionDate] = useState(''); // Stored as string from input
  const [certificateLink, setCertificateLink] = useState('');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState(''); // For success messages
  const [addError, setAddError] = useState(''); // For specific error messages during add operation
  const history = useHistory(); // Use useHistory hook for v5

  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    // Clear any previous messages/errors
    setAddError('');
    setMessage('');

    console.log('AddTrackedCourse - loggedInUserId:', loggedInUserId);

    // --- Client-side Validation ---
    if (!courseName.trim()) {
      setAddError('Course Name is required.');
      return;
    }
    if (progress < 0 || progress > 100) {
        setAddError('Progress must be between 0 and 100.');
        return;
    }

    // Construct the new course object
    const newTrackedCourse = {
      userId: loggedInUserId, // This is crucial for backend authentication/filtering
      courseName,
      status,
      instructor: instructor.trim() || null, // Send null if empty string
      completionDate: completionDate || null, // Send null if empty string
      certificateLink: certificateLink.trim() || null,
      progress: parseInt(progress, 10), // Ensure progress is an integer
      notes: notes.trim() || null,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/tracked-courses/add`, newTrackedCourse);
      setMessage(response.data.message); // Display success message from backend

      // Reset form fields after successful submission
      setCourseName('');
      setStatus('Ongoing');
      setInstructor('');
      setCompletionDate('');
      setCertificateLink('');
      setProgress(0);
      setNotes('');

      // Navigate to the list page using history.push for v5
      setTimeout(() => {
        history.push('/');
      }, 2000); // 2-second delay
    } catch (error) {
      console.error('Error adding tracked course:', error);
      // Display error message from backend or a generic one
      setAddError(error.response?.data?.message || 'Failed to add course. Please try again.');
    }
  };

  return (
    <div>
      <h3>Add New Tracked Course</h3>
      {message && <div className="alert alert-info">{message}</div>} {/* Success message */}
      {addError && <div className="alert alert-danger">{addError}</div>} {/* Error message */}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="courseName">Course Name:</label>
          <input
            type="text"
            id="courseName"
            required // HTML5 required attribute
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Planned">Planned</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="instructor">Instructor (Optional):</label>
          <input
            type="text"
            id="instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="completionDate">Completion Date (Optional):</label>
          <input
            type="date"
            id="completionDate"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="certificateLink">Certificate Link (Optional):</label>
          <input
            type="text"
            id="certificateLink"
            value={certificateLink}
            onChange={(e) => setCertificateLink(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="progress">Progress (%):</label>
          <input
            type="number"
            id="progress"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            min="0" // HTML5 min attribute
            max="100" // HTML5 max attribute
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes (Optional):</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary">Add Course</button>
        </div>
      </form>
    </div>
  );
}

export default AddTrackedCourse;