	
//FINAL CODE WITHOUT FILE SYSTEM
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const archiver = require('archiver');
const app = express();
const port = 3002;


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


const features = [
  {
    id: 1,
    name: "Feature 1",
    code: "\nconst express = require('express');\n\n// Create an Express application\nconst app = express();\n\n// Define a route handler for the root URL\napp.get('/', (req, res) => {\n  res.send('Hello, World!');\n});\n\n// Start the server\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => {\n  console.log(`Server is listening on port ${PORT}`);\n});\n",
    schema: "const mongoose = require('mongoose');\nconst feature1Schema = new mongoose.Schema({\n  name: String,\n  value: String\n});\nmodule.exports = mongoose.model('Feature1', feature1Schema);\n"
  },
  {
    id: 2,
    name: "Feature 2",
    code: {
      register: "const express = require(\"express\");\nconst router = express.Router();\nconst bcrypt = require(\"bcrypt\");\nconst jwt = require(\"jsonwebtoken\");\nconst User = require(\"../model/User\");\n\nrouter.post(\"/register\", async (req, res) => {\n  try {\n    const existingUser = await User.findOne({ username: req.body.username });\n\n    if (existingUser) {\n      return res.status(400).json({ message: \"User already exists\", error: err });\n    }\n\n    const hashPassword = await bcrypt.hashSync(req.body.password, 10);\n\n    let newUser = new User({\n      username: req.body.username,\n      email: req.body.email,\n      password: hashPassword,\n      role: req.body.role,\n      profile: {\n        firstName: req.body.firstName,\n        lastName: req.body.lastName,\n        companyName:\n          req.body.role === \"employer\" ? req.body.companyName : undefined,\n        resumeURL:\n          req.body.role === \"jobSeeker\" ? req.body.resumeURL : undefined,\n      },\n    });\n    const savedUser = await newUser.save();\n    res\n      .status(200)\n      .json(savedUser);\n  } catch (err) {\n    res.status(500).json({ message: \"Registration failed\", error: err });\n  }\n});\n",
      login: "\nrouter.post(\"/login\", async (req, res) => {\n  try {\n    const key = process.env.key;\n    let user = await User.findOne({ email: req.body.email });\n\n    if (!user) {\n      return res\n        .status(401)\n        .json({ message: \"User does not exists\", error: err });\n    }\n\n    const isPasswordValid = bcrypt.compareSync(\n      req.body.password,\n      user.password\n    );\n    if (!isPasswordValid) {\n      res.status(401).json({ message: \"Invalid username or password\" });\n    }\n\n    const token = jwt.sign({ userId: user._id, role: user.role }, key, {\n      expiresIn: \"1d\",\n    });\n\n    res\n      .status(200)\n      .json({ message: \"Login successful\", token: token, email: user.email });\n  } catch (err) {\n    res.status(500).json({ message: \"Login failed\", error: err });\n  }\n});\n",
      list: "\nrouter.get(\"/list\", async (req, res) => {\n  try {\n    let user = await User.find();\n    res.status(200).json(user);\n  } catch (err) {\n    res.status(500).json({ message: \"failed\", error: err });\n  }\n});\n",
      single: "\nrouter.get(\"/single/:id\", async (req, res) => {\n  try {\n    let user = await User.findById(req.params.id).select(\"-passwordHash\");\n    res.status(200).json(user);\n  } catch (err) {\n    res.status(500).json({ message: \"failed\", error: err });\n  }\n});\n",
      update: "\nrouter.put(\"/update/:id\", async (req, res) => {\n  try {\n    if (req.user.userId !== req.params.id) {\n      return res\n        .status(403)\n        .json({ message: \"You are not authorized to update this profile\" });\n    }\n\n    const existingUser = await User.findById(req.params.id);\n\n    if (!existingUser) {\n      return res.status(404).json({ message: \"User not found\" });\n    }\n\n    if (req.body.username) {\n      existingUser.username = req.body.username;\n    }\n    if (req.body.email) {\n      existingUser.email = req.body.email;\n    }\n    if (req.body.firstName) {\n      existingUser.profile.firstName = req.body.firstName;\n    }\n    if (req.body.lastName) {\n      existingUser.profile.lastName = req.body.lastName;\n    }\n\n    const updatedUser = await existingUser.save();\n\n    res\n      .status(200)\n      .json(updatedUser);\n  } catch (err) {\n    res.status(500).json({ message: \"Profile update failed\", error: err });\n  }\n});\n",
      delete: "\nrouter.delete(\"/delete/:id\",async (req, res) => {\n  try {\n    if (req.user.role !== \"admin\" && req.user.userId !== req.params.id) {\n      return res.status(403).json({ message: \"You are not authorized to delete this user\" });\n    }\n\n    const deletedUser = await User.findByIdAndRemove(req.params.id);\n\n    if(!deletedUser){\n       return res.status(404).json({ message: 'User not found' });\n    }\n    res.status(200).json(deletedUser);\n\n  } catch (err) {\n    return res.status(400).json({ message: 'User deletion failed', error: err });\n  }\n});\n\nmodule.exports = router;"
    },
    schema: "const mongoose = require('mongoose');\n\nconst UserSchema = new mongoose.Schema({\n    username: { type: String, required: true },\n    email: { type: String, required: true, unique: true },\n    password: { type: String, required: true },\n    role: { type: String, enum: ['jobSeeker', 'employer', 'admin'], required: true },\n    profile: {\n      firstName: String,\n      lastName: String,\n      companyName: String, // For employers\n      resumeURL: String, // For job seekers\n    },\n\n});\n  \n  module.exports = mongoose.model('User', UserSchema);"
  },
  { id: 3, name: "Feature 3", code: "// Code for feature 3", schema: "// Schema for feature 3" },
  { id: 4, name: "Feature 4", code: "// Code for feature 4", schema: "// Schema for feature 4" },
  { id: 5, name: "Feature 5", code: "// Code for feature 5", schema: "// Schema for feature 5" }
];


app.get('/features', (req, res) => {
  res.json(features);
});


app.post('/generate', (req, res) => {
  const { selectedFeatures } = req.body;


  console.log('Received selected features:', selectedFeatures); // Log received data


  const projectDir = path.join(__dirname, 'server');
  const routesDir = path.join(projectDir, 'routes');
  const modelsDir = path.join(projectDir, 'models');
  const helpersDir = path.join(projectDir, 'helpers');


  try {
    // Create directories
    fs.ensureDirSync(routesDir);
    fs.ensureDirSync(modelsDir);
    fs.ensureDirSync(helpersDir);


    // Create index.js
    const indexPath = path.join(projectDir, 'index.js');
    const indexContent = `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(\`Server is listening on port \${PORT}\`);
});
`;
    fs.writeFileSync(indexPath, indexContent);


    // Create README.md
    const readmePath = path.join(projectDir, 'README.md');
    const readmeContent = `# Generated Project


## How to Run


1. Install dependencies:
\`\`\`
npm install
\`\`\`


2. Start the server:
\`\`\`
node index.js
\`\`\`
`;
    fs.writeFileSync(readmePath, readmeContent);


    selectedFeatures.forEach(feature => {
      const featureData = features.find(f => f.id === feature.id);


      if (!featureData) {
        throw new Error(`Feature with ID ${feature.id} not found`);
      }


      if (typeof featureData.code === 'string') {
        const routePath = path.join(routesDir, `${featureData.name.toLowerCase().replace(/\s+/g, '_')}.js`);
        fs.writeFileSync(routePath, featureData.code);
      } else {
        let combinedCode = '';


        feature.keys.forEach(key => {
          if (!featureData.code[key]) {
            throw new Error(`Key ${key} not found in feature with ID ${feature.id}`);
          }


          combinedCode += featureData.code[key] + '\n\n';
        });


        const routePath = path.join(routesDir, `${featureData.name.toLowerCase().replace(/\s+/g, '_')}.js`);
        fs.writeFileSync(routePath, combinedCode);
      }


      const modelPath = path.join(modelsDir, `${featureData.name.toLowerCase().replace(/\s+/g, '_')}.js`);
      fs.writeFileSync(modelPath, featureData.schema);
    });


    res.status(200).json({ message: 'Project structure created successfully.', downloadPath: '/download' });
  } catch (error) {
    console.error('Error generating project:', error);
    res.status(500).json({ message: 'Error generating project.', error: error.toString() });
  }
});


app.get('/download', (req, res) => {
  const projectDir = path.join(__dirname, 'server');
  const zipPath = path.join(__dirname, 'project.zip');


  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip');


  output.on('close', () => {
    res.download(zipPath, 'project.zip', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error sending file.');
      } else {
        fs.removeSync(projectDir);
        fs.removeSync(zipPath);
      }
    });
  });


  archive.on('error', (err) => {
    throw err;
  });


  archive.pipe(output);
  archive.directory(projectDir, 'server'); // Add the projectDir to the zip under the 'server' directory
  archive.finalize();
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});









