import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [login, setLogin] = useState(false);
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

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", user);
      if (res.data.status === "success") setLogin(true);
    } catch (err) {
      alert("Invalid login");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
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
    alert("Saved");
  };

  const handleView = async () => {
    const res = await axios.post("http://localhost:5000/view", {
      className,
      division,
    });
    setViewData(res.data);
  };

  const handleEditChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...viewData];
    updated[index][name] = value;
    setViewData(updated);
  };

  const saveUpdates = async () => {
    await axios.post("http://localhost:5000/update", {
      className,
      students: viewData,
    });
    alert("Updated");
    setEditMode(false);
    handleView();
  };

  if (!login) {
    return (
      <div className="login">
        <h2>Login</h2>
        <input
          placeholder="Username"
          name="username"
          onChange={(e) => setUser({ ...user, username: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          name="password"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="selectors">

        <select onChange={(e) => setClassName(e.target.value)}>
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{`Class ${i + 1}`}</option>
          ))}
        </select>

        <select onChange={(e) => setDivision(e.target.value)}>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>

        <button onClick={() => setViewData([])}>Submit</button>
        
      </div>

      {viewData.length === 0 ? (
        <div className="form">
          {Object.keys(student).map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input name={key} onChange={handleChange} />
            </div>
          ))}
          <button onClick={handleSave}>Save</button>
          <button onClick={handleView}>View Details</button>
        </div>
      ) : (
        <div className="table-section">
          <button onClick={() => setEditMode(true)}>Edit</button>
          <table border="1">
            <thead>
              <tr>
                {Object.keys(viewData[0] || {}).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewData.map((item, index) => (
                <tr key={item.id}>
                  {Object.keys(item).map((key) => (
                    <td key={key}>
                      {editMode && key !== "id" && key !== "division" ? (
                        <input
                          value={item[key]}
                          name={key}
                          onChange={(e) => handleEditChange(e, index)}
                        />
                      ) : (
                        item[key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {editMode && <button onClick={saveUpdates}>Save</button>}
        </div>
      )}
    </div>
  );
}

export default App;
