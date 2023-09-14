require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");
const userRoutes = require("./Routes/userRoutes");
const roleRoutes = require("./Routes/roleRoutes");
const communityRoutes = require("./Routes/communityRoutes");
const memberRoutes = require("./Routes/memberRoutes");

const app = express();
// Connect to MongoDB
connectDB();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/v1/auth", userRoutes);
app.use("/v1/role", roleRoutes);
app.use("/v1/community", communityRoutes);
app.use("/v1/member", memberRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
