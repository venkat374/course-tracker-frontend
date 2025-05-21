// frontend/src/components/EditTrackedCourse.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Changed import for React Router v5: useHistory
import { useHistory, useParams } from 'react-router-dom';

function EditTrackedCourse({ loggedInUserId }) {
  // State variables for course fields
  const [courseName, setCourseName] = useState('');
  const [status, setStatus] = useState('Ongoing');
  const [instructor, setInstructor] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [certificateLink, setCertificateLink] = useState('');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');

  // State variables for messages and errors
  const [message, setMessage] = useState(''); // For success messages
  const [editError, setEditError] = useState(''); // For errors during update operation
  const [fetchCourseError, setFetchCourseError] = useState(''); // For errors when initially fetching course data

  const history = useHistory(); // Use useHistory hook for v5
  const { id } = useParams(); // Get the course ID from the URL parameter

  // Effect to fetch course data when component mounts or ID/userId changes
  useEffect(() => {
    console.log('EditTrackedCourse - Fetching for loggedInUserId:', loggedInUserId, 'Course ID:', id);
    if (loggedInUserId && id) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/tracked-courses/${id}?userId=${loggedInUserId}`)
        .then(response => {
          const courseData = response.data;
          setCourseName(courseData.courseName);
          setStatus(courseData.status);
          setInstructor(courseData.instructor || ''); // Handle null/undefined from backend
          // Format date for input type="date" (YYYY-MM-DD)
          setCompletionDate(courseData.completionDate ? new Date(courseData.completionDate).toISOString().split('T')[0] : '');
          setCertificateLink(courseData.certificateLink || ''); // Handle null/undefined
          setProgress(courseData.progress);
          setNotes(courseData.notes || ''); // Handle null/undefined
          setFetchCourseError(''); // Clear any previous fetch error
        })
        .catch(error => {
          console.error('Error fetching course for edit:', error);
          setFetchCourseError(error.response?.data?.message || 'Failed to load course details. It might not exist or you might not have access.');
        });
    } else if (!loggedInUserId) {
        setFetchCourseError('Please log in to edit courses.');
    } else if (!id) {
        setFetchCourseError('No course ID provided for editing.');
    }
  }, [loggedInUserId, id]); // Dependencies: re-run if loggedInUserId or id changes

  // Handler for form submission (update)
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Clear any previous messages/errors
    setEditError('');
    setMessage('');

    // --- Client-side Validation ---
    if (!courseName.trim()) {
        setEditError('Course Name is required.');
        return;
    }
    if (progress < 0 || progress > 100) {
        setEditError('Progress must be between 0 and 100.');
        return;
    }

    // Prepare updated course object
    const updatedTrackedCourse = {
      userId: loggedInUserId, // Essential for backend authentication
      courseName,
      status,
      instructor: instructor.trim() || null,
      completionDate: completionDate || null,
      certificateLink: certificateLink.trim() || null,
      progress: parseInt(progress, 10),
      notes: notes.trim() || null,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/tracked-courses/update/${id}`, updatedTrackedCourse);
      setMessage(response.data.message); // Display success message

      // Navigate back to the list page using history.push for v5
      setTimeout(() => {
        history.push('/');
      }, 2000); // 2-second delay
    } catch (error) {
      console.error('Error updating tracked course:', error);
      // Display error message from backend or a generic one
      setEditError(error.response?.data?.message || 'Failed to update course. Please try again.');
    }
  };

  return (
    <div>
      <h3>Edit Tracked Course</h3>
      {/* Display fetch error if any */}
      {fetchCourseError && <div className="alert alert-danger">{fetchCourseError}</div>}
      {/* Display success message */}
      {message && <div className="alert alert-info">{message}</div>}
      {/* Display update error */}
      {editError && <div className="alert alert-danger">{editError}</div>}
      
      {/* Render form only if no fetch error occurred and course data is loaded */}
      {!fetchCourseError && (
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="courseName">Course Name: </label>
            <input
              type="text"
              id="courseName"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status: </label>
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
            <label htmlFor="instructor">Instructor (Optional): </label>
            <input
              type="text"
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="completionDate">Completion Date (Optional): </label>
            <input
              type="date"
              id="completionDate"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="certificateLink">Certificate Link (Optional): </label>
            <input
              type="text"
              id="certificateLink"
              value={certificateLink}
              onChange={(e) => setCertificateLink(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="progress">Progress (%): </label>
            <input
              type="number"
              id="progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes (Optional): </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">Update Course</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EditTrackedCourse;