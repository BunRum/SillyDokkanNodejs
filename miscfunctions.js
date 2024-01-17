const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

function ThroughDirectory(Directory) {
    let Files = [];
    const rth = (directory) => {
        fs.readdirSync(directory).forEach(file => {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) {
                rth(absolute);
            } else {
                Files.push(absolute.replace(/\\/g, '/'));
            }
        });
    };

    rth(Directory);
    return Files;
}


module.exports = {
    WriteFileSyncRecursive: function (filename, content, charset) {
        // -- normalize path separator to '/' instead of path.sep, 
        // -- as / works in node for Windows as well, and mixed \\ and / can appear in the path
        let filepath = filename.replace(/\\/g, '/');

        // -- preparation to allow absolute paths as well
        let root = '';
        if (filepath[0] === '/') {
            root = '/';
            filepath = filepath.slice(1);
        }
        else if (filepath[1] === ':') {
            root = filepath.slice(0, 3);   // c:\
            filepath = filepath.slice(3);
        }

        // -- create folders all the way down
        const folders = filepath.split('/').slice(0, -1);  // remove last item, file
        folders.reduce(
            (acc, folder) => {
                const folderPath = acc + folder + '/';
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                }
                return folderPath
            },
            root // first 'acc', important
        );

        // -- write file
        fs.writeFileSync(root + filepath, content, charset);
    },
    GetFilesTimedCloud: async function (referenceTime) {
        const storage = new Storage()
        const bucket = storage.bucket(process.env.STORAGE_BUCKET)
        const filesStream = bucket.getFilesStream();
        return new Promise((resolve) => {
            const files = []
            filesStream
                .on('data', (file) => {
                    // console.log(file)
                    files.push(file.metadata)
                })
                .on('error', (err) => {
                    console.error('Error occurred:', err);
                })
                .on('end', () => {
                    resolve(files.filter(metadata => {
                        const modTime = new Date(metadata.updated);
                        const createTime = new Date(metadata.timeCreated);

                        return modTime > referenceTime || createTime > referenceTime;
                    }))
                });
        })
    },
    GetFilesTimed: function (referenceTime, dir) {
        const files = [];
        //        let assetPath = "./assets"
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (error) {
                return null;
            }
        }
        console.log(referenceTime)
        try {
            ThroughDirectory(dir).forEach((dirent) => {
                const fileStat = fs.statSync(dirent);
                const modTime = fileStat.mtime.getTime();
                const createTime = fileStat.birthtime.getTime();
                //                console.log(modTime > referenceTime, createTime > referenceTime)
                if (modTime > referenceTime || createTime > referenceTime) {
                    files.push(dirent);
                }
            });
        } catch (error) {
            console.log(error);
        }

        return files;
    },
    parsejson: function (json) {
        const replacecmds = {
            "./": `${process.env.SERVER_URL}/`,
            ".storage/": `${process.env.DEBUG === "true" ? `https://localhost:${process.env.DEBUG_PORT}` : process.env.STORAGE_BUCKET_URL_ALT}/`,
            '".currentdate"': Date.now(),
            '".endoftime"': 32503738187
        };
        try {
            function check(json) {
                if (typeof (json) == "string") {
                    if (fs.existsSync(json)) {
                        return fs.readFileSync(json).toString()
                    } else {
                        return json
                    }
                } else {
                    return JSON.stringify(json)
                }
            }

            let newton = check(json);
            Object.keys(replacecmds).forEach((rmnd) => {
                newton = newton.replaceAll(rmnd, replacecmds[rmnd])
            })
            return JSON.parse(newton)
        } catch (err) {
            console.error(`${json} does not exist`);
        }
    }
}