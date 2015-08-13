
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
import tar from 'tar-fs';
import * as formatter from './FileFormatter.js';

class FileManager {

    traverse(entity){
        _.forOwn(entity, (value, prop) => {
            console.log('Prop: ' + prop + 'Value: ' + value);
        });
    }

    ensureFilePath(filePath){
        return new Promise((resolve, reject) => {
            fs.ensureFile(filePath, err => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    ensureDirPath(dirPath){
        return new Promise((resolve, reject) => {
            fs.ensureDir(dirPath, err => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    readFile(filePath){
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, {encoding: 'utf8'}, (err, data) => {
                if(err){
                    reject("Can't read file: " + filePath + ". Cause: " + err.message);
                } else {
                    resolve(data);
                }
            });
        });
    }

    writeFile(filePath, fileData, format){
        return new Promise((resolve, reject) => {
            if(!fileData){
                reject('File data is undefined. File path: ' + filePath);
            }
            if(format === true){
                try{
                    fileData = formatter.formatJsFile(fileData);
                } catch(e){
                    reject(e.message + '. File path: ' + filePath);
                }
            }
            fs.writeFile(filePath, fileData, {encoding: 'utf8'}, err => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    writeBinaryFile(filePath, fileData){
        return new Promise((resolve, reject) => {
            if(!fileData){
                reject('File data is undefined. File path: ' + filePath);
            }
            fs.writeFile(filePath, fileData, {encoding: null}, err => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    placeInPosition(filePath, options){
        return this.readFile(filePath)
            .then( data => {
                if(!data){
                    throw Error('Cannot place content into file. Cause: file is empty. File path: ' + filePath);
                }
                let dataArray = data.split('');
                let inDataArray = options.text.split('');
                let args = [options.position, 0];
                args = args.concat(inDataArray);
                Array.prototype.splice.apply(dataArray, args);
                return dataArray.join('');

            })
            .then( fileData => {
                return this.writeFile(filePath, fileData, options.format);
            });
    }

    copyFiles(options){
        return options.reduce(
            (sequence, valuePair) => {
                return sequence.then(() => {
                    return this.copyFile(valuePair.srcFilePath, valuePair.destFilePath);
                });
            },
            Promise.resolve()
        );
    }

    copyFile(srcFilePath, destFilePath, rewrite = true){
        return new Promise( (resolve, reject) => {
            fs.copy(srcFilePath, destFilePath, function(err){
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    _readDir(start, callback, testFileNames) {

        // Use lstat to resolve symlink if we are passed a symlink
        fs.lstat(start, ( err, stat ) => {
                if (err) {
                    callback(err);
                }
                let found = {dirs: [], files: []},
                    total = 0,
                    processed = 0;

                let isDir = (abspath, isValid) => {
                    fs.stat(abspath, (err, stat) => {
                        if (stat.isDirectory()) {
                            if (isValid === true) {
                                found.dirs.push(abspath);
                            }
                            // If we found a directory, recurse!
                            this._readDir(abspath, (err, data) => {
                                found.dirs = found.dirs.concat(data.dirs);
                                found.files = found.files.concat(data.files);
                                if (++processed == total) {
                                    callback(null, found);
                                }
                            }, testFileNames);
                        } else {
                            if (isValid === true) {
                                found.files.push(abspath);
                            }
                            if (++processed == total) {
                                callback(null, found);
                            }
                        }
                    });
                };

                // Read through all the files in this directory
                if (stat.isDirectory()) {
                    fs.readdir(start, (err, files) => {
                        total = files.length;
                        if (total === 0) {
                            callback(null, found);
                        }
                        for (let x = 0, l = files.length; x < l; x++) {
                            if(testFileNames){
                                isDir(path.join(start, files[x]), _.contains(testFileNames, files[x]));
                            } else {
                                isDir(path.join(start, files[x]), true);
                            }
                        }
                    });
                } else {
                    callback("Path: " + start + " is not a directory");
                }
            }
        )
    }

    readDirectory(dirPath, testFileNames = undefined){
        return new Promise( (resolve, reject) => {
            this._readDir(dirPath, (err, found) => {
                if(err){
                    reject(err);
                } else {
                    resolve(found);
                }
            }, testFileNames);
        });
    }

    checkDirIsEmpty(dirPath){
        return new Promise( (resolve, reject) => {
            fs.stat(dirPath, (err, stat) => {
                if(err){
                    reject('Can not read directory. ' + err);
                } else {
                    if (stat.isDirectory()) {
                        fs.readdir(dirPath, (err, files) => {
                            var total = files.length;
                            if (total === 0) {
                                resolve();
                            } else {
                                reject(dirPath + ' is not empty');
                            }
                        });
                    } else {
                        reject(dirPath + ' is not a directory');
                    }
                }
            });
        });
    }

    readJson(filePath){
        return new Promise( (resolve, reject) => {
            fs.readJson(filePath, (err, packageObj) => {
                if(err){
                    reject(err);
                } else {
                    resolve(packageObj);
                }
            });
        });
    }

    writeJson(filePath, jsonObj){
        return new Promise( (resolve, reject) => {
            fs.writeJson(filePath, jsonObj, err => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    removeFile(filePath){
        return new Promise( (resolve, reject) => {
            fs.remove(filePath, err => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    unpackTarGz(srcFilePath, destDirPath){
        return new Promise( (resolve, reject) => {
            fs.createReadStream(srcFilePath)
                .pipe(zlib.createGunzip())
                .pipe(tar.extract(destDirPath, { dmode: '0555', fmode: '0444' })
                    .on('finish', () => { resolve(); }))
                    .on('error', err => { reject(err); });
        });
    }

    packTarGz(srcDirPath, destFilePath, entries){
        return new Promise( (resolve, reject) => {
            let destFile = fs.createWriteStream(destFilePath);
            tar.pack(srcDirPath, {entries: entries}).pipe(zlib.createGzip()).pipe(destFile)
                .on('finish', () => { resolve(); })
                .on('error', err => { reject(err); });
        });
    }



}

export default FileManager;