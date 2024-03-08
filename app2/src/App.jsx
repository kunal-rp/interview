import { useState, useEffect, useRef } from "react";

import "./App.css";

const UPLOAD_URL = "http://localhost:4000/upload";
const GET_IMAGE_URL = "http://localhost:4000/getImage";

const UPDATE_DIMENSIONS_URL = "http://localhost:4000/updateDimensions";
const GET_DIMENSIONS_URL = "http://localhost:4000/getDimensions";

function App() {
  const [image, setImage] = useState(null);

  async function getImage() {
    const response = await fetch(GET_IMAGE_URL, {
      method: "GET",
    });

    response.json().then((resData) => setImage(resData.image));
  }

  useEffect(() => {
    getImage();
  }, []);

  useEffect(() => {
    if (image == null) getImage();
  }, [image]);

  return (
    <div className="w-screen h-screen grid grid-cols-2 grid-rows-1">
      <ImageUpload setImage={setImage} className="col-span-1" />

      <ImageDisplay image={image} className="col-span-1 " />
    </div>
  );
}

function ImageUpload({ image, setImage, className }) {
  // image to upload
  const [imageFile, setImageFile] = useState(null);

  async function uploadImage() {
    var formData = new FormData();
    formData.append("imageFile", imageFile);

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    response.json().then(() => setImage(null));
  }

  return (
    <div className={className + " flex flex-col justify-center items-center"}>
      <input
        type="file"
        accept="image/*"
        name="imageUpload"
        onChange={(event) => setImageFile(event.target.files[0])}
      />
      {imageFile ? (
        <button
          onClick={uploadImage}
          className="border-2 shadow-xl pl-5 pr-5 p-2 rounded-md "
        >
          Submit
        </button>
      ) : null}
    </div>
  );
}

function ImageDisplay({ image = null, className }) {
  var canvasRef = useRef();

  var [boundingBoxes, setBoundingBoxes] = useState([]);
  const [hasInit, setHasInit] = useState(false);

  function getAspectRatio(image) {
    const w = image.naturalWidth;
    const h = image.naturalHeight;

    let aspectRatio;

    if (w > h) {
      aspectRatio = w / h;
    } else {
      aspectRatio = h / w;
    }

    return aspectRatio;
  }

  async function updateDimensionsToServer() {
    const response = await fetch(UPDATE_DIMENSIONS_URL, {
      method: "POST",
      body: JSON.stringify(boundingBoxes),
      headers: {
        "Content-Type": "application/json",
      },
    });

    response.json();
  }

  async function getDimensionsFromServer() {
    const response = await fetch(GET_DIMENSIONS_URL, {
      method: "GET",
    });

    response.json().then((res) => {
      setBoundingBoxes(res.dimensions);
      setHasInit(true);
    });
  }

  const drawRectangle = (context, box) => {
    context.strokeStyle = box.color;
    context.lineWidth = 2;
    context.strokeRect(box.x, box.y, box.xLen, box.yLen);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      boundingBoxes.forEach((box) => drawRectangle(context, box));
    }
  }, [boundingBoxes, canvasRef]);

  useEffect(() => {
    if (canvasRef.current && image && boundingBoxes.length == 0) {
      getDimensionsFromServer();
    }
  }, [image]);

  useEffect(() => {
    if (hasInit) updateDimensionsToServer();
  }, [boundingBoxes]);

  function BoxInput({ box }) {
    function updateBoxValue(boxId, param, value) {
      var temp = [...boundingBoxes];
      var index = temp.findIndex((boundingBox) => boundingBox.id == boxId);
      temp[index][param] = value;
      setBoundingBoxes(temp);
    }

    return (
      <div className="justify-center items-center ">
        <span className="italic mr-5">ID:{box.id} </span>
        <span>X:</span>
        <input
          type="number"
          min={0}
          value={box.x}
          className="w-[10px] mr-5"
          placeHolder="x"
          onChange={(e) => updateBoxValue(box.id, "x", e.target.value)}
        />
        <span>Y: </span>
        <input
          type="number"
          min={0}
          placeHolder="y"
          className="w-[10px] mr-5"
          value={box.y}
          onChange={(e) => updateBoxValue(box.id, "y", e.target.value)}
        />
        <span>X Length: </span>
        <input
          type="number"
          min={0}
          value={box.xLen}
          className="w-[10px] mr-5"
          placeHolder="x length"
          onChange={(e) => updateBoxValue(box.id, "xLen", e.target.value)}
        />
        <span>Y Length: </span>
        <input
          type="number"
          min={0}
          className="w-fit"
          className="w-[10px] mr-5"
          placeHolder="y length"
          value={box.yLen}
          onChange={(e) => updateBoxValue(box.id, "yLen", e.target.value)}
        />
        <span>Color</span>
        <input
          type="color"
          className="w-[10px] mr-5"
          placeHolder="color"
          value={box.color}
          onChange={(e) => updateBoxValue(box.id, "color", e.target.value)}
        />
      </div>
    );
  }

  function generateBox() {
    setBoundingBoxes(
      boundingBoxes.concat({
        id: parseInt(Date.now().toString().slice(-6)),
        x: 170,
        y: 65,
        xLen: 100,
        yLen: 80,
        color: "#FFFFFF",
      }),
    );
  }

  function BoundingBoxControls() {
    return (
      <div className="text-left">
        <button
          className="pl-5 pr-5 p-2 border-2 hover:bg-gray-200 rounded-md"
          onClick={() => setBoundingBoxes([])}
        >
          Clear Boxes
        </button>
        <button
          className="pl-5 pr-5 p-2 border-2 hover:bg-gray-200 rounded-md"
          onClick={() => generateBox([])}
        >
          Add Box
        </button>
        {boundingBoxes.map((box) => (
          <BoxInput box={box} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        className + " flex flex-col justify-center p-5 bg-gray-100 text-center"
      }
    >
      {image ? (
        <div className="w-full h-full justify-center items-center flex">
          <div className="w-full relative">
            <img ref={canvasRef} src={"data:image/png;base64," + image} />
            <canvas
              ref={canvasRef}
              className="absolute w-full h-full top-0 bottom-0 "
            />
          </div>
        </div>
      ) : (
        <span className="font-xl font-semibold justify-center">
          Upload image to start
        </span>
      )}
      {image ? <BoundingBoxControls /> : null}
    </div>
  );
}

export default App;
