const app = require("express")();

app.get("/", (req, res) => {
  res.status(200).send({ statusCode: 200, mesage: "HOME PAGE FOR TEST" });
});

app.listen(5000, (c, e) => {
  console.log(`http://localhost:5000`);
});
