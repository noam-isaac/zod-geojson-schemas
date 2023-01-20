import path from 'path';
import fs from 'fs/promises';

import { jsonSchemaToZod } from 'json-schema-to-zod';

const JSON_SCHEMA_URL = 'http://geojson.org/schema';
const GEOJSON_TYPES = [
  'FeatureCollection',
  'Feature',
  'Geometry',
  'GeometryCollection',
  'MultiPolygon',
  'MultiLineString',
  'MultiPoint',
  'Polygon',
  'LineString',
  'Point',
  'GeoJSON',
];
const BUILD_DIR = path.join(__dirname, '../generated');

const cleanUp = async () => {
  try {
    await fs.rm(BUILD_DIR, {
      recursive: true,
      force: true,
    });
  } catch (err) {
    console.log(err);
  }
  await fs.mkdir(BUILD_DIR),
    {
      recursive: true,
    };
};

const getGeoJsonSchemas = async () => {
  return Promise.all(
    GEOJSON_TYPES.map(async (type) => {
      const response = await fetch(`${JSON_SCHEMA_URL}/${type}.json`);
      return { name: type, json: await response.json() };
    })
  );
};

const createZodSchema = async () => {
  const geoJsonSchemas = await getGeoJsonSchemas();

  geoJsonSchemas.map((schema) =>
    fs.writeFile(
      path.join(BUILD_DIR, schema.name + '.ts'),
      jsonSchemaToZod(schema.json, schema.name)
    )
  );
};

const main = async () => {
  await cleanUp();
  await createZodSchema();
  console.log('Done!');
};

main();
