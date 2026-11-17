import * as THREE from "three";

/**
 * A curved gable roof, ridge running along local X and slope falling toward
 * local ±Z. Sized as a 1×1×1 unit so it can be instanced and scaled per house.
 */
export function createGableRoofGeometry() {
  const thickness = 0.075;
  const shape = new THREE.Shape();

  shape.moveTo(-0.58, 0.035);
  shape.quadraticCurveTo(-0.26, 0.72, 0, 1);
  shape.quadraticCurveTo(0.26, 0.72, 0.58, 0.035);
  shape.lineTo(0.58, 0.035 - thickness);
  shape.quadraticCurveTo(0.26, 0.72 - thickness, 0, 1 - thickness);
  shape.quadraticCurveTo(-0.26, 0.72 - thickness, -0.58, 0.035 - thickness);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1,
    bevelEnabled: false,
    curveSegments: 10,
  });

  geometry.rotateY(-Math.PI / 2);
  geometry.translate(0.5, 0, 0);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * A tiered pagoda roof: an octagonal, concave cone with a flared eave lip.
 * Unit radius 0.5 and unit height, meant to be scaled per tier.
 */
export function createPagodaRoofGeometry() {
  const profile = [
    [0.5, 0],
    [0.555, 0.018],
    [0.555, 0.07],
    [0.5, 0.095],
    [0.42, 0.18],
    [0.32, 0.32],
    [0.21, 0.52],
    [0.1, 0.76],
    [0.03, 0.9],
    [0, 0.95],
    [0.035, 0.9],
    [0.13, 0.72],
    [0.24, 0.48],
    [0.35, 0.28],
    [0.46, 0.1],
    [0.47, 0.055],
    [0.47, 0.015],
    [0.485, 0.005],
  ] as const;

  const points = profile.map(
    ([radius, height]) => new THREE.Vector2(radius, height)
  );

  const geometry = new THREE.LatheGeometry(points, 8);
  geometry.computeVertexNormals();

  return geometry;
}

/** A craggy cliff block built from a displaced, flat-shaded box. */
export function createCliffGeometry() {
  const geometry = new THREE.BoxGeometry(58, 30, 16, 18, 9, 3);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);

    const noise =
      Math.sin(x * 0.21) * 0.9 +
      Math.sin(y * 0.33 + 1.7) * 0.7 +
      Math.sin((x - y) * 0.11) * 1.1;

    position.setX(index, x + noise * (z > 0 ? 1.4 : 0.4));
    position.setZ(index, z + noise * 0.9);
    position.setY(index, y + Math.sin(x * 0.17 + 2.1) * 1.1);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}
