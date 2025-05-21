import React, { useState } from 'react';
// Changed import for React Router v5: BrowserRouter, Switch, Route, Link
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import TrackedCourseList from './components/TrackedCourseList';
import AddTrackedCourse from './components/AddTrackedCourse';
import EditTrackedCourse from './components/EditTrackedCourse';
import './App.css'; // Import the main CSS file

function App() {
  // IMPORTANT: Replace this with YOUR actual userId from your MongoDB database.
  // This is a placeholder for demonstration. In a real app, this comes from login.
  const [loggedInUserId] = useState('681f5e03a1e2df137b1f3330'); // e.g., '60d5ec49e4d5c9f8d8b9d8c0'

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Course Tracker</Link>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">My Courses</Link>
          </li>
          <li className="nav-item">
            <Link to="/add-tracked" className="nav-link">Add Course</Link>
          </li>
        </ul>
      </nav>
      <div className="container">
        {/* --- REACT ROUTER V5 SYNTAX --- */}
        <Switch>
          {/* Use 'children' prop to render components for props passing in v5 */}
          <Route path="/" exact> {/* `exact` ensures it only matches the root path */}
            <TrackedCourseList loggedInUserId={loggedInUserId} />
          </Route>
          <Route path="/add-tracked">
            <AddTrackedCourse loggedInUserId={loggedInUserId} />
          </Route>
          {/* For routes with parameters, still use 'children' prop to render the component */}
          <Route path="/edit-tracked/:id">
            <EditTrackedCourse loggedInUserId={loggedInUserId} />
          </Route>
        </Switch>
        {/* --- END OF REACT ROUTER V5 CHANGES --- */}
      </div>
    </Router>
  );
}

export default App;