'use strict';

const fs = require('fs');
const path = require('path');
const toml = require('toml');

/* Recursively gets all files from a given directory. */
async function getFiles(dir) {
  return (await getFilesRecursive(dir))
    .map(file => path.relative(dir, file));
}

async function getFilesRecursive(dir) {

  if (!fs.existsSync(dir)) return [];
  
  const dirents = fs.readdirSync(dir, { withFileTypes: true });

  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFilesRecursive(res) : res;
  }));

  return Array.prototype.concat(...files);

}

/* Compare two files by content. */
function equalFiles(pathA, pathB) {

    console.log(pathA);
    console.log(pathB);
  const file1 = fs.readFileSync(pathA);
  const file2 = fs.readFileSync(pathB);

  if (file1.length != file2.length) { return false; }

  return file1.equals(file2);

}

function getTrimmedContent(filepath) {
    return fs.readFileSync(filepath, 'utf8').replace(/\s/g, '');
}

function readToml(filepath) {
    const tomlData = fs.readFileSync(filepath);
    return toml.parse(tomlData);
}

function readJson(filepath) {
    const jsonData = fs.readFileSync(filepath);
    return JSON.parse(jsonData);
}

module.exports = {
    getFiles,
    equalFiles,
    getTrimmedContent,
    readToml,
    readJson
};