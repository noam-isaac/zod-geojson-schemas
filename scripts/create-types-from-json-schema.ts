import path from 'path';
import { promisify } from 'util';
import fs from 'fs';

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

const cleanUp = async () => {
  try {
    await promisify(fs.rm)(path.join(__dirname, '../dist'), {
      recursive: true,
    });
  } catch {}
  await promisify(fs.mkdir)(path.join(__dirname, '../dist'), {
    recursive: true,
  });
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
    promisify(fs.writeFile)(
      path.join(__dirname, '../dist/' + schema.name + '.ts'),
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
