const express = require("express");
const rootRouter = require("./routes/index");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use("/api/v1", rootRouter);
app.listen(3000, () => {
	console.log("Listening on Port 3000");
});
