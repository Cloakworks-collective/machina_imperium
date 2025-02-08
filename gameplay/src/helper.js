"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.euclideanDistance = euclideanDistance;
/**
 * Calculates the Euclidean distance between two points in 3D space.
 * Works for any object with three numerical properties.
 *
 * @param a - First point/vector { x, y, z }.
 * @param b - Second point/vector { x, y, z }.
 * @returns Euclidean distance between the two points.
 */
function euclideanDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2) +
        Math.pow(a.z - b.z, 2));
}
