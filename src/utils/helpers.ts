
export const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };
export const generateUniqueColorArray=  (length: number) => {
    const colorArray:string[] = [];
    for (let i = 0; i < length; i++) {
      let color =generateRandomColor();
      while (colorArray.includes(color)) {
        color = generateRandomColor();
      }
      colorArray.push(color);

    }
    return colorArray;
  }
export const generateRandomColor = () => {
    const compactColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${compactColor}`.toUpperCase();
  }