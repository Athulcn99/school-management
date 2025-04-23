const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "info123",
  database: "school_management"
});

// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    res.json({ status: "success" });
  } else {
    res.status(401).json({ status: "fail" });
  }
});

// Save Student Data
app.post("/save", (req, res) => {
  const { className, division, student } = req.body;
  const tableName = `class_${className}`;
  const sql = `INSERT INTO ${tableName} (roll_no, name, sex, english, malayalam, maths, science, social, total, status, division) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    student.roll_no,
    student.name,
    student.sex,
    student.english,
    student.malayalam,
    student.maths,
    student.science,
    student.social,
    student.total,
    student.status,
    division
  ];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Student data saved." });
  });
});

// View Student Data
app.post("/view", (req, res) => {
  const { className, division } = req.body;
  const tableName = `class_${className}`;
  const sql = `SELECT * FROM ${tableName} WHERE division = ?`;
  db.query(sql, [division], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Update Student Data
app.post("/update", (req, res) => {
  const { className, students } = req.body;
  const tableName = `class_${className}`;
  const updates = students.map((s) =>
    db.query(
      `UPDATE ${tableName} SET roll_no=?, name=?, sex=?, english=?, malayalam=?, maths=?, science=?, social=?, total=?, status=? WHERE id=?`,
      [s.roll_no, s.name, s.sex, s.english, s.malayalam, s.maths, s.science, s.social, s.total, s.status, s.id]
    )
  );
  Promise.all(updates)
    .then(() => res.json({ message: "Updated successfully." }))
    .catch((err) => res.status(500).send(err));
});

app.listen(5000, () => console.log("Server started on port 5000"));
