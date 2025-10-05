import json
import numpy as np
from shapely.geometry import Point, MultiPolygon
from shapely.ops import unary_union
import os
from tqdm import tqdm

# A multiplier for the range of each point. This can be adjusted.
RANGE_MULTIPLIER = 0.3

def create_circle(lon, lat, radius_meters):
    """Creates a shapely circle polygon."""
    # Approximate conversion from meters to degrees
    meters_to_degrees = 1 / 111320
    radius_degrees = radius_meters * meters_to_degrees
    return Point(lon, lat).buffer(radius_degrees)

def process_data(input_path, output_path):
    """
    Reads point data, merges points by event type into polygons,
    and saves the result as GeoJSON.
    """
    with open(input_path, 'r') as f:
        data = json.load(f)

    # Group points by event type (name_id)
    points_by_type = {}
    for item in data:
        name_id = item.get('e')
        if name_id not in points_by_type:
            points_by_type[name_id] = []
        points_by_type[name_id].append(item)

    features = []
    for name_id, points in tqdm(points_by_type.items(), desc="Processing event types"):
        circles = []
        for point_data in points:
            lat = point_data.get('a')
            lon = point_data.get('b')
            radius = point_data.get('c', 0) * RANGE_MULTIPLIER
            if lat is not None and lon is not None:
                circles.append(create_circle(lon, lat, radius))

        if not circles:
            continue

        # Merge all circles for the current event type
        merged_geometry = unary_union(circles)

        # Ensure the result is a MultiPolygon for consistency
        if not isinstance(merged_geometry, MultiPolygon):
            merged_geometry = MultiPolygon([merged_geometry])
        
        # Convert shapely geometry to GeoJSON format
        coords = []
        for poly in merged_geometry.geoms:
            exterior_coords = np.array(poly.exterior.coords).tolist()
            interior_coords = [np.array(interior.coords).tolist() for interior in poly.interiors]
            coords.append([exterior_coords] + interior_coords)

        feature = {
            "type": "Feature",
            "properties": {
                "name_id": name_id
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": coords
            }
        }
        features.append(feature)

    # Create a GeoJSON FeatureCollection
    output_geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(output_geojson, f)

    print(f"Processed data saved to {output_path}")

if __name__ == "__main__":
    # Correctly locate the files relative to the project root
    input_file = os.path.join('public', 'blobs', 'data_minimized.json')
    output_file = os.path.join('public', 'blobs', 'data_aggregated.json')
    process_data(input_file, output_file)
