const fs = require('fs');
const path = require('path');
var ip = require('ip').address()
const { Storage } = require('@google-cloud/storage');
class File {
    constructor(path, relativePath, modTime, isBeforeModTime, isEqualToModTime, creationTime, isBeforeCreationTime, isEqualToCreationTime) {
        this.path = path;
        this.relativePath = relativePath;
        this.modTime = modTime;
        this.isBeforeModTime = isBeforeModTime;
        this.isEqualToModTime = isEqualToModTime;
        this.creationTime = creationTime;
        this.isBeforeCreationTime = isBeforeCreationTime;
        this.isEqualToCreationTime = isEqualToCreationTime;
    }
}

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
    GetFilesTimedCloud: async function (referenceTime) {
        const storage = new Storage({
            "projectId": 'dokkanarise',
            "keyFilename": 'C:/Users/adamv/AppData/Roaming/gcloud/application_default_credentials.json'
        });
        const bucket = storage.bucket("assets.bunrum.com");
        const files = [];

        try {
            const [fileList] = await bucket.getFiles();
            // Use list instead of getMetadata for faster retrieval
            const [metadataList] = await Promise.all(fileList.map(file => file.getMetadata()));
            for (let i = 0; i < fileList.length; i++) {
                const metadata = metadataList[i];
                const modTime = metadata.updated;
                const createTime = metadata.timeCreated;

                if (modTime > referenceTime || createTime > referenceTime) {
                    files.push(fileList[i].name);
                }
            }
        } catch (error) {
            console.error(error);
        }

        return files;
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
        var replacecmds = {
            "./": `${process.env.SERVER_URL}/`,
            ".storage/": `${process.env.DEBUG == "true" ? `https://${ip}:${process.env.DEBUG_PORT}` : process.env.STORAGE_BUCKET_URL}/`,
            '".currentdate"': Date.now(),
            '".endoftime"': 32503738187
        }
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
            var newton = check(json)
            Object.keys(replacecmds).forEach((rmnd) => {
                newton = newton.replaceAll(rmnd, replacecmds[rmnd])
            })
            return JSON.parse(newton)
        } catch (err) {
            console.error(`${json} does not exist`);
        }
    }
}