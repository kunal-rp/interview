const express = require("express");
const expressFileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

app.use(expressFileUpload());
app.use(
	cors({
		methods: ["POST", "GET"],
		origin: ["http://localhost:3000"],
	}),
);

const port = 4000;

var image;

var uploadRoute = (req, res) => {
	image = req.files.imageFile.data.toString("base64");
	res.json({});
};

var getImage = (req, res) => {
	res.json({ image: image });
};

app.post("/upload", uploadRoute);
app.get("/getImage", getImage);

app.listen(port, () => {
	console.log(`running on port ${port}`);
});
