import path from 'path';
import { promisify } from 'util';
import fs from 'fs';

import cbClone from 'git-clone';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import { JSONSchema7 } from 'json-schema';

// as is needed to promisify not functioning well with overloads
const clone = promisify(cbClone) as unknown as (
  repo: string,
  targetPath: string,
  opts?: cbClone.Options
) => Promise<string | undefined>;

const SOURCE_JSON_SCHEMA_NAME = '../jsonSchema';
const PATH_TO_SCHEMAS_IN_SOURCE = '/build/schema';
const DIST_JSON_SCHEMA_NAME = '../zodJsonSchema';

const getAllFiles = (dirPath: string, arrayOfFiles?: string[]) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
};

const cloneJsonSchema = async () => {
  try {
    await Promise.all([
      promisify(fs.rm)(path.join(__dirname, SOURCE_JSON_SCHEMA_NAME), {
        recursive: true,
      }),
      promisify(fs.rm)(path.join(__dirname, DIST_JSON_SCHEMA_NAME), {
        recursive: true,
      }),
    ]);
  } catch {}
  await Promise.all([
    promisify(fs.mkdir)(path.join(__dirname, SOURCE_JSON_SCHEMA_NAME)),
    promisify(fs.mkdir)(path.join(__dirname, DIST_JSON_SCHEMA_NAME)),
    clone(
      'https://github.com/geojson/schema',
      path.join(__dirname, SOURCE_JSON_SCHEMA_NAME),
      {}
    ),
  ]);
  console.log('Cloned json schema');
  
};

const transformJsonSchema = async () => {
  const filesInJsonSchema = await getAllFiles(
    path.join(__dirname, SOURCE_JSON_SCHEMA_NAME + PATH_TO_SCHEMAS_IN_SOURCE)
  );
  filesInJsonSchema.forEach(async (file) => {
    const schema = await promisify(fs.readFile)(file, 'utf8');

    // await promisify(fs.writeFile)(
    //   path.(__dirname, DIST_JSON_SCHEMA_NAME + '/GeoJSON.ts'),
    await promisify(fs.writeFile)(
      path.join(__dirname, 'joe'),
      jsonSchemaToZod(JSON.parse(``) as JSONSchema7)
    );
    // );
  });
};

const main = async () => {
  await cloneJsonSchema();
  await transformJsonSchema();
  console.log('Done!');
};

main();
