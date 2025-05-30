import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // State management
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ username: "", password: "" });
  const [className, setClassName] = useState("1");
  const [division, setDivision] = useState("A");
  const [student, setStudent] = useState({
    roll_no: "",
    name: "",
    sex: "",
    english: 0,
    malayalam: 0,
    maths: 0,
    science: 0,
    social: 0,
    total: 0,
    status: ""
  });
  const [viewData, setViewData] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Handlers
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("http://localhost:5000/login", user);
      if (res.data.status === "success") setLogin(true);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const validateStudent = () => {
    if (!student.roll_no || !student.name) {
      setError("Roll number and name are required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateStudent()) return;
    
    setLoading(true);
    try {
      const total = 
        Number(student.english) +
        Number(student.malayalam) +
        Number(student.maths) +
        Number(student.science) +
        Number(student.social);
      const status = total >= 150 ? "Pass" : "Fail";
      
      await axios.post("http://localhost:5000/save", {
        className,
        division,
        student: { ...student, total, status },
      });
      setStudent({
        roll_no: "",
        name: "",
        sex: "",
        english: 0,
        malayalam: 0,
        maths: 0,
        science: 0,
        social: 0,
        total: 0,
        status: ""
      });
      setError(null);
      alert("Student record saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student record");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/view", {
        className,
        division,
      });
      setViewData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch student records");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...viewData];
    updated[index][name] = value;
    
    // Recalculate total and status if marks are edited
    if (['english', 'malayalam', 'maths', 'science', 'social'].includes(name)) {
      const total = 
        Number(updated[index].english) +
        Number(updated[index].malayalam) +
        Number(updated[index].maths) +
        Number(updated[index].science) +
        Number(updated[index].social);
      updated[index].total = total;
      updated[index].status = total >= 150 ? "Pass" : "Fail";
    }
    
    setViewData(updated);
  };

  const saveUpdates = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/update", {
        className,
        students: viewData,
      });
      setEditMode(false);
      setError(null);
      alert("Student records updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update records");
    } finally {
      setLoading(false);
    }
  };

  // Login Page
  if (!login) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Student Management System</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Username</label>
            <input
              className="form-input"
              placeholder="Enter username"
              name="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter password"
              name="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </div>
          
          <button 
            className="login-button" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : "Login"}
          </button>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Student Management System</h1>
        
        <div className="class-selectors">
          <div className="selector-group">
            <label>Class:</label>
            <select
              className="form-select"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{`Class ${i + 1}`}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label>Division:</label>
            <select
              className="form-select"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              {['A', 'B'].map((div) => (
                <option key={div} value={div}>Division {div}</option>
              ))}
            </select>
          </div>

          <button 
            className="action-button" 
            onClick={() => setViewData([])}
            disabled={loading}
          >
            New Student
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <main className="content-area">
        {viewData.length === 0 ? (
          <div className="student-form">
            <h2>Add New Student</h2>
            
            <div className="form-grid">
              {['roll_no', 'name', 'sex'].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field.replace('_', ' ')}</label>
                  <input
                    name={field}
                    value={student[field]}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
            
            <h3>Marks</h3>
            <div className="form-grid">
              {['english', 'malayalam', 'maths', 'science', 'social'].map((subject) => (
                <div className="form-group" key={subject}>
                  <label>{subject}</label>
                  <input
                    type="number"
                    name={subject}
                    value={student[subject]}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
            
            <div className="form-actions">
              <button 
                className="primary-button" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Student"}
              </button>
              <button 
                className="secondary-button" 
                onClick={handleView}
                disabled={loading}
              >
                View Students
              </button>
            </div>
          </div>
        ) : (
          <div className="student-table-container">
            <div className="table-header">
              <h2>Student Records - Class {className} Division {division}</h2>
              {!editMode ? (
                <button 
                  className="edit-button" 
                  onClick={() => setEditMode(true)}
                  disabled={loading}
                >
                  Edit Records
                </button>
              ) : (
                <button 
                  className="save-button" 
                  onClick={saveUpdates}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            //Student Table
            <div className="table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    {Object.keys(viewData[0] || {}).map((key) => (
                      <th key={key}>{key.replace('_', ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewData.map((item, index) => (
                    <tr key={item.id || index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      {Object.keys(item).map((key) => (
                        <td key={key} className={item.status === 'Fail' ? 'failed' : ''}>
                          {editMode && !['id', 'division', 'total', 'status'].includes(key) ? (
                            <input
                              className="table-input"
                              value={item[key]}
                              name={key}
                              onChange={(e) => handleEditChange(e, index)}
                              disabled={loading}
                              type={['english', 'malayalam', 'maths', 'science', 'social'].includes(key) ? 'number' : 'text'}
                            />
                          ) : (
                            key === 'status' ? (
                              <span className={`status-badge ${item.status.toLowerCase()}`}>
                                {item.status}
                              </span>
                            ) : (
                              item[key]
                            )
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
