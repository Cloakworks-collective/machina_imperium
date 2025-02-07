/**
 * Generic type for any object with three numerical properties.
 */
type Vector3D = {
    x: number;
    y: number;
    z: number;
  };
  
  /**
   * Calculates the Euclidean distance between two points in 3D space.
   * Works for any object with three numerical properties.
   *
   * @param a - First point/vector { x, y, z }.
   * @param b - Second point/vector { x, y, z }.
   * @returns Euclidean distance between the two points.
   */
  export function euclideanDistance(a: Vector3D, b: Vector3D): number {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2) +
      Math.pow(a.z - b.z, 2)
    );
  }  