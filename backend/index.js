require("dotenv").config();
const app = require("./src/app");

const paymentRoutes = require('./routes/payment');

const PORT = process.env.PORT || 3000;

// Use the payment routes
app.use('/api/payment', paymentRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
