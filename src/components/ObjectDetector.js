import { useState, useRef } from "react";
import styled from "styled-components";
import React from "react";
import Cars from "../assets/images/cars.jpg";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const ObjectDetector = () => {
  const [img, setImg] = useState();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const imageRef = useRef();
  const isEmptyPredictions = !predictions || predictions.length === 0;

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const normalizePredictions = (predictions, imgSize) => {
    if (!predictions || !imgSize || !imageRef) return predictions || [];
    return predictions.map((prediction) => {
      const { bbox } = prediction;
      const oldX = bbox[0];
      const oldY = bbox[1];
      const oldWidth = bbox[2];
      const oldHeight = bbox[3];

      const imgWidth = imageRef.current.width;
      const imgHeight = imageRef.current.height;

      const x = (oldX * imgWidth) / imgSize.width;
      const y = (oldY * imgHeight) / imgSize.height;
      const width = (oldWidth * imgWidth) / imgSize.width;
      const height = (oldHeight * imgHeight) / imgSize.height;

      return { ...prediction, bbox: [x, y, width, height] };
    });
  };

  const detectObjectsOnImage = async (imageElement, imgSize) => {
    const model = await cocoSsd.load({});
    const predictions = await model.detect(imageElement, 6);
    const newPredictions = normalizePredictions(predictions, imgSize);
    setPredictions(newPredictions);
  };

  const readImageData = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsDataURL(file);
    });
  };

  const imageHandler = async (e) => {
    setPredictions([]);
    setLoading(true);

    const file = e.target.files[0];
    const imgData = await readImageData(file);

    setImg(imgData);

    const imageElement = document.createElement("img");
    imageElement.src = imgData;

    imageElement.onload = async () => {
      const imgSize = {
        width: imageElement.width,
        height: imageElement.height,
      };

      await detectObjectsOnImage(imageElement, imgSize);
      setLoading(false);
    };
  };

  const TargetBox = styled.div`
    position: absolute;
    left: ${({ x }) => x + "px"};
    top: ${({ y }) => y + "px"};
    width: ${({ width }) => width + "px"};
    height: ${({ height }) => height + "px"};

    border: 4px solid #1ac71a;
    background-color: transparent;
    z-index: 20;
    &::before {
      content: "${({ classType, score }) =>
        `${classType} ${score.toFixed(2)}%`}";
      color: #1ac71a;
      font-weight: 500;
      font-size: 17px;
      position: absolute;
      top: -1.5em;
      left: -5px;
    }
  `;
  return (
    <div className="container detector_wrapper mt-4">
      <div className="row">
        <div className="col-12">
          <h3>Please select an image.</h3>
          <div className="img_wrapper">
            {img ? (
              <>
                <img src={img} ref={imageRef} />
                {!isEmptyPredictions &&
                  predictions.map((prediction, idx) => {
                    return (
                      <TargetBox
                        key={idx}
                        x={prediction.bbox[0]}
                        y={prediction.bbox[1]}
                        width={prediction.bbox[2]}
                        height={prediction.bbox[3]}
                        classType={prediction.class}
                        score={prediction.score * 100}
                      />
                    );
                  })}
              </>
            ) : (
              <img src="https://via.placeholder.com/1140x700" />
            )}
          </div>
          <input
            type={"file"}
            hidden
            ref={fileInputRef}
            onChange={imageHandler}
          />
          <button
            className="btn btn-primary mt-4"
            onClick={openFilePicker}
            disabled={loading}
          >
            {loading ? "please wait..." : "Select File"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetector;
