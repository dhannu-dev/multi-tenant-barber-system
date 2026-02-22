import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

// import bcrypt from "bcrypt";

// const hash = await bcrypt.hash("admin123", 10);
// console.log(hash);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
