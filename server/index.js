const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://mouni:mouni123@cluster0.8toan42.mongodb.net/?appName=Cluster0")
.then(() => console.log("MongoDB Connected"));

const ProjectSchema = new mongoose.Schema({
   files: Object,
});

const Project = mongoose.model(
  "Project",
  ProjectSchema
);

app.post("/save", async (req, res) => {

  const { files, projectId } = req.body;

  let project;

  // UPDATE PROJECT
  if (projectId) {

    project = await Project.findByIdAndUpdate(
      projectId,
      {
        files: files,
      },
      { new: true }
    );

  } else {

    // CREATE PROJECT
    project = await Project.create({
      files: files,
    });

  }

  res.json(project);
});
app.get("/project/:id", async (req, res) => {

  const project = await Project.findById(
    req.params.id
  );

  res.json(project);
});

app.listen(5000, () => {
  console.log("Server Running");
});