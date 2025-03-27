const backgroundColors = [
  "#f5f9",
  "#e0fe",
  "#f0fa",
  "#fec3",
  "#fef",
  "#f0f4",
  "#f5ff",
  "#fff2",
  "#edfe",
  "#e0ff",
];

const shapeColors = [
  "#06d4",
  "#85f6",
  "#e89",
  "#f90b",
  "#10b9",
  "#38f6",
  "#e44",
  "#14b8",
  "#66f1",
  "#f916",
];

const getRandomColor = (colors) => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateSimpleThumbnail = () => {
  const bgColor = getRandomColor(backgroundColors);
  const shapeColor = getRandomColor(shapeColors);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${bgColor}"/>
    <circle cx="${getRandomNumber(30, 70)}" cy="${getRandomNumber(30, 70)}" 
      r="${getRandomNumber(15, 30)}" fill="${shapeColor}" opacity="0.6"/>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const generateRandomThumbnail = (drawingName = "") => {
  return generateSimpleThumbnail();
};

export default {
  generateRandomThumbnail,
};
