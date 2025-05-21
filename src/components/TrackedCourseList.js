// frontend/src/components/TrackedCourseList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link is still available in v5
import axios from 'axios';

// Individual TrackedCourse component for rendering each row
const TrackedCourse = (props) => {
  const certificateLink = props.trackedCourse.certificateLink;
  // Ensure the link has a proper protocol for external navigation
  const hrefValue = certificateLink && (
    certificateLink.startsWith('http://') || certificateLink.startsWith('https://')
      ? certificateLink
      : `http://${certificateLink}` // Prepend http:// if no protocol is found
  );

  return (
    <tr>
      <td>{props.trackedCourse.courseName}</td>
      <td>{props.trackedCourse.status}</td>
      {/* Format completion date, or display '-' if not set */}
      <td>{props.trackedCourse.completionDate ? props.trackedCourse.completionDate.substring(0, 10) : '-'}</td>
      <td>
        {props.trackedCourse.status === 'Ongoing' ? ( // Show progress bar only for Ongoing courses
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${props.trackedCourse.progress}%` }}
              aria-valuenow={props.trackedCourse.progress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {props.trackedCourse.progress}%
            </div>
          </div>
        ) : (
          `${props.trackedCourse.progress}%` // Display percentage for other statuses
        )}
      </td>
      <td>
        <Link to={"/edit-tracked/" + props.trackedCourse._id} className="btn btn-sm btn-primary">Edit</Link>
        <button onClick={() => props.deleteTrackedCourse(props.trackedCourse._id)} className="btn btn-danger btn-sm ml-2">Delete</button>
        {hrefValue && (
          // Removed the JSX comment that was causing parsing errors
          <a href={hrefValue} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm ml-2">Certificate</a>
        )}
      </td>
    </tr>
  );
};

// Main TrackedCourseList component
function TrackedCourseList({ loggedInUserId }) {
  const [trackedCourses, setTrackedCourses] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // State for filtering
  const [sortBy, setSortBy] = useState('none'); // State for sorting column
  const [sortOrder, setSortOrder] = useState('asc'); // State for sort order (asc/desc)

  // Effect to fetch courses when component mounts or userId changes
  useEffect(() => {
    console.log('TrackedCourseList - Fetching for loggedInUserId:', loggedInUserId);
    if (loggedInUserId) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/tracked-courses/?userId=${loggedInUserId}`)
        .then(response => {
          setTrackedCourses(response.data);
          setFetchError(''); // Clear any previous fetch error
          setDeleteError(''); // Also clear delete error on successful re-fetch
        })
        .catch((error) => {
          console.error('Error fetching tracked courses:', error);
          setFetchError(error.response?.data?.message || 'Failed to load courses.');
        });
    } else {
      // Clear courses if no userId is logged in
      setTrackedCourses([]);
      setFetchError('Please log in to view your courses.');
    }
  }, [loggedInUserId]); // Re-run effect if loggedInUserId changes

  // Function to handle course deletion
  const deleteTrackedCourse = (id) => {
    if (loggedInUserId && window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      axios.delete(`${process.env.REACT_APP_BACKEND_URL}/tracked-courses/${id}`, { data: { userId: loggedInUserId } }) // Pass userId in data for DELETE
        .then(res => {
          console.log(res.data.message);
          // Update state to remove the deleted course from the list
          setTrackedCourses(trackedCourses.filter(el => el._id !== id));
          setDeleteError(''); // Clear any previous delete error
        })
        .catch(error => {
          console.error('Error deleting tracked course:', error);
          setDeleteError(error.response?.data?.message || 'Failed to delete course.');
        });
    }
  };

  // Function to sort courses based on selected criteria
  const sortCourses = (courses) => {
    if (sortBy === 'none') {
      return courses; // No sorting applied
    }

    // Create a shallow copy to avoid mutating original state directly
    return [...courses].sort((a, b) => {
      let valA, valB;

      if (sortBy === 'courseName') {
        valA = a.courseName.toLowerCase();
        valB = b.courseName.toLowerCase();
      } else if (sortBy === 'completionDate') {
        // Handle null/undefined dates: push them to the end if sorting ascending, to the beginning if descending
        valA = a.completionDate ? new Date(a.completionDate).getTime() : (sortOrder === 'asc' ? Infinity : -Infinity);
        valB = b.completionDate ? new Date(b.completionDate).getTime() : (sortOrder === 'asc' ? Infinity : -Infinity);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0; // Values are equal
    });
  };

  // Function to toggle sort order (asc/desc)
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  // Memoized list of courses after filtering and sorting
  const trackedCourseList = () => {
    // 1. Filter courses
    const filteredCourses = trackedCourses.filter(course => {
      return filterStatus === 'All' || course.status === filterStatus;
    });

    // 2. Sort filtered courses
    const sortedAndFilteredCourses = sortCourses(filteredCourses);

    // 3. Map to TrackedCourse components
    return sortedAndFilteredCourses.map(currentTrackedCourse => (
      <TrackedCourse
        trackedCourse={currentTrackedCourse}
        deleteTrackedCourse={deleteTrackedCourse}
        key={currentTrackedCourse._id}
      />
    ));
  };

  return (
    <div className="tracked-course-list">
      <h3>My Tracked Courses</h3>

      {/* Filter and Sort Controls */}
      <div className="filter-sort-controls">
        <label htmlFor="filterStatus">Filter by Status:</label>
        <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Planned">Planned</option>
        </select>

        <label htmlFor="sortBy" className="ml-2">Sort by:</label>
        <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="none">None</option>
          <option value="courseName">Course Name</option>
          <option value="completionDate">Completion Date</option>
        </select>

        {/* Show sort order button only if a sort option is selected */}
        {sortBy !== 'none' && (
          <button onClick={toggleSortOrder} className="btn btn-secondary btn-sm ml-2">
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        )}
      </div>

      {/* Display Fetch and Delete Errors */}
      {fetchError && <div className="alert alert-danger mt-2">{fetchError}</div>}
      {deleteError && <div className="alert alert-danger mt-2">{deleteError}</div>}

      {/* Course Table */}
      <table className="table mt-3">
        <thead className="thead-light">
          <tr>
            <th>Course Name</th>
            <th>Status</th>
            <th>Completion Date</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trackedCourseList()}
        </tbody>
      </table>
      <Link to="/add-tracked" className="btn btn-primary mt-3">Add New Tracked Course</Link>
    </div>
  );
}

export default TrackedCourseList;