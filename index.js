//FINAL CODE WITHOUT FILE SYSTEM
const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const cors = require("cors");
const archiver = require("archiver");
const connectDB = require("./db");
const {
  handleGetFeaturesList,
  handleGetSelectedFeaturesCode,
} = require("./AI");
const featureRoutes = require("./routes/feature");
const app = express();
const PORT = process.env.PORT || 3002;
require("dotenv").config();

app.use(cors({ origin: "http://localhost:3000" }));
// Middleware to parse JSON
app.use(express.json());

const features = [
  {
    id: 1,
    name: "User",
    code: {
      initialize:
        "const express = require('express');\nconst router = express.Router();\nconst User = require('../model/User');\nconst bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\n\n",
      login:
        "router.post('/login', async (req, res) => {\n    const key = process.env.key;\n    const user = await User.findOne({email: req.body.email});\n    if(!user) {\n        return res.status(400).send('user not found!');\n    }\n    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {\n        const token = jwt.sign({\n            userId: user.id,\n            isAdmin: user.isAdmin\n        },\n        key,\n        {expiresIn: '1d'});\n\n        res.status(200).send({user: user.email, token: token});\n    } else {\n        res.status(400).send('password is wrong!');\n    }\n});\n",
      create:
        "router.post('/create', async (req, res) => {\n    let newUser = new User({\n        username: req.body.username,\n        email: req.body.email,\n        passwordHash: bcrypt.hashSync(req.body.password, 10),\n        phone: req.body.phone,\n        isAdmin: req.body.isAdmin,\n        street: req.body.street,\n        apartment: req.body.apartment,\n        zip: req.body.zip,\n        city: req.body.city,\n        country: req.body.country\n    });\n\n    try {\n        const savedUser = await newUser.save();\n        res.status(200).send(savedUser);\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      list: "router.get('/list', async (req, res) => {\n    try {\n        let user = await User.find().select('-passwordHash');\n        res.status(200).send(user);\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      single:
        "router.get('/:id', async (req, res) => {\n    try {\n        let user = await User.findById(req.params.id).select('-passwordHash');\n        res.status(200).send(user);\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      count:
        "router.get('/get/count', async (req, res) => {\n    const userCount = await User.count();\n\n    if(!userCount) {\n        res.status(500).json({success: false});\n    }\n    res.send({userCount: userCount});\n});\n",
      update:
        "router.put('/update/:id', async (req, res) => {\n    if(req.body.id == req.params.id) {\n        try {\n            const updatedUser = await User.findByIdAndUpdate(req.params.id, {\n                username: req.body.username,\n                email: req.body.email,\n                passwordHash: bcrypt.hashSync(req.body.password, 10),\n                phone: req.body.phone,\n                isAdmin: req.body.isAdmin,\n                street: req.body.street,\n                apartment: req.body.apartment,\n                zip: req.body.zip,\n                city: req.body.city,\n                country: req.body.country\n            },\n            { new: true });\n            res.status(200).json(updatedUser);\n        } catch (err) {\n            res.status(500).json(err);\n        }\n    } else {\n        res.status(401).json(\"you can only update your profile\");\n    }\n});\n",
      delete:
        "router.delete('/delete/:id', (req, res) => {\n    User.findByIdAndRemove(req.params.id).then(User => {\n        if(User) {\n            return res.status(200).json({success: true, message: 'the User is deleted'});\n        } else {\n            return res.status(404).json({success: false, message: 'the User not found'});\n        }\n    }).catch(err => {\n        return res.status(400).json({success: false, error: err});\n    });\n});\n",
    },
    schema:
      "const mongoose = require('mongoose');\n\nconst UserSchema = new mongoose.Schema({\n    username: {type: String, required: true},\n    email: {type: String, required: true},\n    passwordHash: {type: String, required: true},\n    phone: {type: String, required: true},\n    isAdmin: {type: Boolean, default: false},\n    street: {type: String, default: ''},\n    apartment: {type: String, default: ''},\n    zip: {type: String, default: ''},\n    city: {type: String, default: ''},\n    country: {type: String, default: ''}\n});\n\nUserSchema.virtual('id').get(function () {\n    return this._id.toHexString();\n});\n\nUserSchema.set('toJSON', {\n    virtuals: true,\n});\n\nmodule.exports = mongoose.model('User', UserSchema);",
  },
  {
    id: 2,
    name: "Product",
    code: {
      initialize:
        "const express = require('express');\nconst router = express.Router();\nconst Product = require('../model/Product');\nconst Categories = require('../model/Categories');\nconst mongoose = require('mongoose');\nconst multer = require('multer');\n\nconst FILE_TYPE_MAP = {\n    'image/png': 'png',\n    'image/jpeg': 'jpeg',\n    'image/jpg': 'jpg'\n};\n\nconst storage = multer.diskStorage({\n    destination: function (req, file, cb) {\n        const isValid = FILE_TYPE_MAP[file.mimetype];\n        let uploadError = new Error('invalid image type');\n\n        if(isValid) {\n            uploadError = null;\n        }\n        cb(uploadError, 'public/uploads');\n    },\n    filename: function (req, file, cb) {\n        const fileName = file.fieldname.split(' ').join('-');\n        const extension = FILE_TYPE_MAP[file.mimetype];\n        cb(null, `${fileName}-${Date.now()}.${extension}`);\n    }\n});\n\nconst uploadOptions = multer({ storage: storage });\n\n",
      create:
        "router.post('/create/new', uploadOptions.single('image'), async (req, res) => {\n    const category = await Categories.findById(req.body.category);\n    if(!category) {\n        return res.status(400).send('invalid category');\n    }\n    const file = req.file;\n    if(!file) return res.status(400).send('No image in the request');\n\n    const fileName = file.filename;\n    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;\n    const newProduct = new Product({\n        name: req.body.name,\n        description: req.body.description,\n        richDescription: req.body.richDescription,\n        image: `${basePath}${fileName}`,\n        images: req.body.image,\n        brand: req.body.brand,\n        price: req.body.price,\n        category: req.body.category,\n        countInStock: req.body.countInStock,\n        rating: req.body.rating,\n        isFeatured: req.body.isFeatured\n    });\n    try {\n        const savedProduct = await newProduct.save();\n        res.status(200).send(savedProduct);\n    } catch (err) {\n        res.status(500).send(err + 'the product cannot be created');\n    }\n});\n",
      gallery:
        "router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {\n    if(!mongoose.isValidObjectId(req.params.id)) {\n        return res.status(400).send('Invalid Product Id');\n    }\n    const files = req.files;\n    let imagesPaths = [];\n    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;\n\n    if(files) {\n        files.map(file => {\n            imagesPaths.push(`${basePath}${file.filename}`);\n        });\n    }\n\n    const product = await Product.findByIdAndUpdate(\n        req.params.id,\n        { images: imagesPaths },\n        { new: true }\n    );\n\n    if(!product)\n        return res.status(500).send('the gallery cannot be updated!');\n\n    res.send(product);\n});\n",
      list: "router.get('/list', async (req, res) => {\n    let productList;\n    if(req.query.categories) {\n        productList = await Product.find({\n            category: req.query.categories.split(',')\n        }).populate('category');\n    } else {\n        productList = await Product.find().populate('category');\n    }\n    if(!productList) {\n        res.status(500).json({success: false});\n    }\n    res.send(productList);\n});\n",
      single:
        "router.get('/:id', async (req, res) => {\n    const product = await Product.findById(req.params.id).populate('category');\n    if(!product) {\n        res.status(500).json({success: false});\n    }\n    res.send(product);\n});\n",
      update:
        "router.put('/update/:id', async (req, res) => {\n    if(!mongoose.isValidObjectId(req.params.id)) {\n        return res.status(400).send('Invalid Product Id');\n    }\n    const category = await Categories.findById(req.body.category);\n    if(!category) {\n        return res.status(400).send('invalid category');\n    }\n\n    const updatedProduct = await Product.findByIdAndUpdate(\n        req.params.id,\n        {\n            name: req.body.name,\n            description: req.body.description,\n            richDescription: req.body.richDescription,\n            image: req.body.image,\n            images: req.body.images,\n            brand: req.body.brand,\n            price: req.body.price,\n            category: req.body.category,\n            countInStock: req.body.countInStock,\n            rating: req.body.rating,\n            isFeatured: req.body.isFeatured\n        },\n        { new: true }\n    );\n    if(!updatedProduct)\n        return res.status(500).send('the product cannot be updated');\n    res.send(updatedProduct);\n});\n",
      delete:
        "router.delete('/delete/:id', (req, res) => {\n    Product.findByIdAndRemove(req.params.id).then(product => {\n        if(product) {\n            return res.status(200).json({success: true, message: 'the product is deleted'});\n        } else {\n            return res.status(404).json({success: false, message: 'the product not found'});\n        }\n    }).catch(err => {\n        return res.status(400).json({success: false, error: err});\n    });\n});\n",
      count:
        "router.get('/get/count', async (req, res) => {\n    const productCount = await Product.count();\n    if(!productCount) {\n        res.status(500).json({success: false});\n    }\n    res.send({productCount: productCount});\n});\n",
    },
    schema:
      "const mongoose = require('mongoose');\n\nconst productSchema = mongoose.Schema({\n    name: { type: String, required: true },\n    description: { type: String },\n    richDescription: { type: String },\n    image: { type: String },\n    images: [{ type: String }],\n    brand: { type: String },\n    price: { type: Number, required: true },\n    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },\n    countInStock: { type: Number, required: true },\n    rating: { type: Number, default: 0 },\n    isFeatured: { type: Boolean, default: false }\n});\n\nproductSchema.set('toJSON', {\n    virtuals: true,\n});\n\nmodule.exports = mongoose.model('Product', productSchema);",
  },
  {
    id: 3,
    name: "Order",
    code: {
      initialize:
        "const express = require('express');\nconst router = express.Router();\nconst Order = require('../model/Order');\nconst Product = require('../model/Product');\nconst mongoose = require('mongoose');\n\n",
      create:
        "router.post('/create', async (req, res) => {\n    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;\n\n    const order = new Order({\n        orderItems,\n        shippingAddress,\n        paymentMethod,\n        itemsPrice,\n        taxPrice,\n        shippingPrice,\n        totalPrice,\n        user: req.body.user\n    });\n\n    try {\n        const savedOrder = await order.save();\n        res.status(201).send(savedOrder);\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      list: "router.get('/list', async (req, res) => {\n    try {\n        const orders = await Order.find().populate('user', 'name').populate('orderItems.product', 'name');\n        res.status(200).send(orders);\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      single:
        "router.get('/:id', async (req, res) => {\n    try {\n        const order = await Order.findById(req.params.id).populate('user', 'name').populate('orderItems.product', 'name');\n        if (!order) return res.status(404).send('Order not found');\n        res.status(200).send(order);\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      update:
        "router.put('/update/:id', async (req, res) => {\n    if(!mongoose.isValidObjectId(req.params.id)) {\n        return res.status(400).send('Invalid Order Id');\n    }\n    try {\n        const updatedOrder = await Order.findByIdAndUpdate(\n            req.params.id,\n            req.body,\n            { new: true }\n        );\n        if (!updatedOrder) return res.status(404).send('Order not found');\n        res.status(200).send(updatedOrder);\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      delete:
        "router.delete('/delete/:id', async (req, res) => {\n    try {\n        const order = await Order.findByIdAndRemove(req.params.id);\n        if (!order) return res.status(404).send('Order not found');\n        res.status(200).send('Order deleted');\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
      count:
        "router.get('/get/count', async (req, res) => {\n    try {\n        const orderCount = await Order.count();\n        res.status(200).send({ orderCount });\n    } catch (err) {\n        res.status(500).send(err);\n    }\n});\n",
    },
    schema:
      "const mongoose = require('mongoose');\n\nconst orderSchema = mongoose.Schema({\n    orderItems: [{\n        name: { type: String, required: true },\n        quantity: { type: Number, required: true },\n        price: { type: Number, required: true },\n        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }\n    }],\n    shippingAddress: {\n        address: { type: String, required: true },\n        city: { type: String, required: true },\n        postalCode: { type: String, required: true },\n        country: { type: String, required: true }\n    },\n    paymentMethod: { type: String, required: true },\n    itemsPrice: { type: Number, required: true },\n    taxPrice: { type: Number, required: true },\n    shippingPrice: { type: Number, required: true },\n    totalPrice: { type: Number, required: true },\n    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },\n    isPaid: { type: Boolean, default: false },\n    paidAt: { type: Date },\n    isDelivered: { type: Boolean, default: false },\n    deliveredAt: { type: Date }\n}, { timestamps: true });\n\nmodule.exports = mongoose.model('Order', orderSchema);",
  },
];

connectDB();

// Use the feature routes
app.use("/api/features", featureRoutes);

app.get("/features", (req, res) => {
  res.json(features);
});

app.post("/generate", (req, res) => {
  const { selectedFeatures, allFeatures } = req.body;

  console.log("Received selected features:", selectedFeatures); // Log received data

  const projectDir = path.join(__dirname, "server");
  const routesDir = path.join(projectDir, "routes");
  const modelsDir = path.join(projectDir, "models");
  const helpersDir = path.join(projectDir, "helpers");

  try {
    // Create directories
    fs.ensureDirSync(routesDir);
    fs.ensureDirSync(modelsDir);
    fs.ensureDirSync(helpersDir);

    // Create index.js
    const indexPath = path.join(projectDir, "index.js");
//     const indexContent = `const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3000;


// app.listen(PORT, () => {
//   console.log(\`Server is listening on port \${PORT}\`);
// });
// `;
const indexContent = `
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");

const userRoute = require("./routes/user.js");
const productRoute = require("./routes/product.js");
const categoryRoute = require("./routes/categories.js");
const orderRoute = require("./routes/order.js");
const authJwt = require('./helper/jwt.js');
const errorHandler = require('./helper/error-handler.js');
const port = process.env.port || 5000;
dotenv.config();

mongoose
  .connect(process.env.mongo_url, {
      useNewUrlParser: true,
      dbName: 'eshop-database'
  })
  .then(() => console.log("mongo db is connectd successfully!"))
  .catch((err) => {
    console.log(err);
  });
  
//middleware
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//routes
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/order", orderRoute);

app.listen(port, () => {
  console.log("server running on", { port });
});
`;
    fs.writeFileSync(indexPath, indexContent);

    // Create README.md
    const readmePath = path.join(projectDir, "README.md");
    const readmeContent = `# Generated Project


## How to Run


1. Install dependencies:
\`\`\`
npm install express cors mongoose dotenv morgan
\`\`\`
npm install jsonwebtoken bcryptjs
\`\`\`
npm install
\`\`\`


2. Start the server:
\`\`\`
node index.js
\`\`\`
`;
    fs.writeFileSync(readmePath, readmeContent);

    selectedFeatures.forEach((feature) => {
      const featureData = allFeatures.find((f) => f.id === feature.id);

      if (!featureData) {
        throw new Error(`Feature with ID ${feature.id} not found`);
      }

      if(featureData['code']['schema']) return;

      if (typeof featureData.code === "string") {
        const routePath = path.join(
          routesDir,
          `${featureData.name.toLowerCase().replace(/\s+/g, "_")}.js`
        );
        fs.writeFileSync(routePath, featureData.code);
      } else {
        let combinedCode = "";

        feature.keys.forEach((key) => {
          console.log(key);
          if (!featureData.code[key]) {
            throw new Error(
              `Key ${key} not found in feature with ID ${feature.id}`
            );
          }

          combinedCode += featureData.code[key] + "\n\n";
        });

        const routePath = path.join(
          routesDir,
          `${featureData.name.toLowerCase().replace(/\s+/g, "_")}.js`
        );
        fs.writeFileSync(routePath, combinedCode);
      }

      const modelPath = path.join(
        modelsDir,
        `${featureData.name.toLowerCase().replace(/\s+/g, "_")}.js`
      );
      fs.writeFileSync(modelPath, featureData.schema);
    });

    res.status(200).json({
      message: "Project structure created successfully.",
      downloadPath: "/download",
    });
  } catch (error) {
    console.error("Error generating project:", error);
    res
      .status(500)
      .json({ message: "Error generating project.", error: error.toString() });
  }
});

app.get("/download", (req, res) => {
  const projectDir = path.join(__dirname, "server");
  const zipPath = path.join(__dirname, "project.zip");

  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip");

  output.on("close", () => {
    res.download(zipPath, "project.zip", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file.");
      } else {
        fs.removeSync(projectDir);
        fs.removeSync(zipPath);
      }
    });
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(projectDir, "server"); // Add the projectDir to the zip under the 'server' directory
  archive.finalize();
});

app.post("/get-features-list", async (req, res) => {
  const { data, status, error } = await handleGetFeaturesList(req);

  if (!error) return res.status(200).json({ data, status, error });

  return res.status(400).json({ data, status, error });
});

app.post("/get-selected-feature-code", async (req, res) => {
  const { data, status, error } = await handleGetSelectedFeaturesCode(req);

  if (!error) return res.status(200).json({ data, status, error });

  return res.status(400).json({ data, status, error });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
