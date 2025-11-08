import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("Fusion API running 🚀");
});

app.listen(3001, () => {
  console.log("✅ API listening on port 3001");
});
