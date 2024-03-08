const express = require("express");
const expressFileUpload = require("express-fileupload");
var bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(expressFileUpload());
app.use(bodyParser.json());
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

var dimensions = [
	{
		id: parseInt(Date.now().toString().slice(-6)),
		x: 50,
		y: 30,
		xLen: 110,
		yLen: 100,
		color: "#FFFFFF",
	},
	{
		id: parseInt((Date.now() + 10).toString().slice(-6)),
		x: 170,
		y: 65,
		xLen: 100,
		yLen: 80,
		color: "#FFFFFF",
	},
];

var updateDimensions = (req, res) => {
	dimensions = req.body;
	res.json({});
};

var getDimensions = (req, res) => {
	res.json({ dimensions: dimensions });
};

app.post("/updateDimensions", updateDimensions);
app.get("/getDimensions", getDimensions);

app.listen(port, () => {
	console.log(`running on port ${port}`);
});
