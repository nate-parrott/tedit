let extraBounds = Math.sqrt(2);

export let computeHeight = (shapes) => {
  let maxY = 0;
  for (let shapeId of Object.keys(shapes)) {
    let shape = shapes[shapeId];
    let bottom = shape.y + Math.max(shape.w, shape.h) * extraBounds * shape.scale;
    maxY = Math.max(maxY, bottom);
  }
  return maxY;
}
