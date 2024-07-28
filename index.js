const { app, server } = require("./sockets/socket");
const authRouter = require("./routes/auth/auth.routes");
const convoRouter = require("./routes/app/convo.routes");
const { urlencoded, json } = require("express");
const { dbConnect } = require("./db/dbConnect.db");

app.use(json());
app.use(urlencoded({ extended: true }));

dbConnect();

app.get("/", (req, res) => {
  res.status(200).send({ statusCode: 200, mesage: "HOME PAGE FOR TEST" });
});

app.use("/api/v1/auth", authRouter.router);
app.use("/api/v1/convo", convoRouter.router);

server.listen(5000, () => {
  console.log(`http://localhost:5000`);
});
