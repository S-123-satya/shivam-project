const express = require("express");
require("dotenv").config();
const mongodb = require("./db/index.js");
const { join } = require("node:path");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes.js");
const { createServer } = require("node:http");

const PORT = process.env.PORT || 3000;

async function main() {
  const app = express();
  const httpServer = createServer(app);

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.static("public"));
  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "public", "index.html"));
  });

  app.use("/user", userRoutes);
  
  
  mongodb()
    .then((res) => {
      httpServer.listen(PORT, () => {
        console.log(`data base connected app listening on port ${PORT}`);
      });
    })
    .catch((error) => console.log(error));
}
main();