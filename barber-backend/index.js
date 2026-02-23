import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
