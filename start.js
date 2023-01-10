const express = require("express");
var fs = require("fs")
const path = require('path')
var https = require("https");
var ip = require('ip')
var childprocess = require("child_process")
const chokidar = require('chokidar');
const chalk = require("chalk");
const boxen = require("boxen");
var ipaddress = ip.address()
var sqlite3 = require('@journeyapps/sqlcipher').verbose();
var miscfunctions = require("./uifunctions");
const PORT = 8080
// console.log(Server.ServerStart/)
var fulladdress = `https://${ipaddress}:${PORT}`
const cliProgress = require('cli-progress');

const rootDir = __dirname;
console.log(rootDir)
// console.log(path.join(rootDir, "bin", "mkcert.exe"))
// 
// if (!fs.existsSync(path.join(process.env.LOCALAPPDATA, "mkcert", "rootCA.pem"))) {
    // childprocess.execFile(path.join(rootDir, "bin", "mkcert.exe"), ["-install"], (error, stdout, stderr) => {
        // console.log("attempting to install mkcert thingy magig")
    // })
// }
// 
// if (!fs.existsSync(path.join(rootDir, "silly+4-key.pem")) && !fs.existsSync(path.join(rootDir, "silly+4.pem"))) {
    // childprocess.execFile(path.join(rootDir, "bin", "mkcert.exe"), ["silly", "localhost", "127.0.0.1", "::1", ipaddress], (error, stdout, stderr) => {
        // console.log("generating certificates")
    // })
// 
// }
// create a certificate authority
function error(message) {
    const errordesign = {
        padding: '0.5',
        margin: 0,
        backgroundColor: "#000000"
    };
    var errormessage = chalk.red.bold(message);
    console.log(boxen(errormessage, errordesign));
}
function successmessage(message) {
    console.log(boxen(chalk.green.bold(message), {
        padding: '0.5',
        margin: 0,
        backgroundColor: "#000000"
    }));
}

module.exports = {
    ipaddress: ipaddress,
    port: PORT,
    fulladdress: fulladdress,
    rootDir: rootDir
}

async function start() {
    const creds = {
        cert: fs.readFileSync(path.join(rootDir, "silly+4.pem")),
        key: fs.readFileSync(path.join(rootDir, "silly+4-key.pem"))
    }

    const app = express();

    app.use(express.text())
    app.use(express.json())
    app.use(express.static('public'))
    app.disable('etag')

    app.use(function (req, res, next) {
        // console.log(res.headers["connect-src"])
        res.header("Access-Control-Allow-Origin", '*');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })

    // const sslServer = https.createServer(creds, app)
    // sslServer.listen(PORT)
    app.listen(PORT)

    // console.log(`Web server started at: ${fulladdress}`);

    app.get("/cert", (req, res) => {
        res.sendFile(path.join(process.env.LOCALAPPDATA, "mkcert", "rootCA.pem"))
    })

    app.get("/", (req, res) => {
        res.sendFile(path.resolve("local/Index.html"))
    })

    app.post("/cpkfile", (req, res) => {
        console.log(req.body, path.resolve(req.body["input"]))
        const bat = childprocess.spawn('YACpkTool.exe', [req.body["input"], `${req.body["input"]}.cpk`]);
        var good = 3762504530

        const child = execFile('YACpkTool.exe', ['--version'], (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            console.log(stdout);
        });
    })

    require("./Server").ServerStart(app)
}
start()

process.stdin.resume();
process.stdin.setEncoding('utf8');
const watchlist = {}
const commands = {
    "gencards": function () {
        miscfunctions.Gencards()
    },
    "execute": function (text) {
        var pathtofile = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"'))
        if (fs.existsSync(pathtofile)) {
            miscfunctions.executesql(fs.readFileSync(pathtofile, 'utf-8'))
        } else {
            if (pathtofile.length == 0) {
                error("please input a file")
            } else {
                error("that path does not exist")
            }
        }
    },
    "watch": function (text) {
        // console.log(text)
        var textarray = text.split(' ')
        if (textarray[1] == "list") {
            console.log(Object.keys(watchlist))
        } else if (textarray[1] == "add") {
            var pathtofile = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"'))
            if (fs.existsSync(pathtofile)) {
                watchlist[pathtofile] = chokidar.watch(pathtofile)
                watchlist[pathtofile].on("change", (path, stats) => {
                    if (stats.size == 0) {
                        miscfunctions.executesql(fs.readFileSync(pathtofile, 'utf-8'))
                    }
                })
                successmessage(`${pathtofile} has successfully been added to watch`)
            } else {
                if (pathtofile.length == 0) {
                    error("please input a file")
                } else {
                    error("that path does not exist")
                }
            }
        } else if (textarray[1] == "remove") {
            var pathtofile = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"'))
            if (pathtofile in watchlist) {
                watchlist[pathtofile].close()
                delete watchlist[pathtofile]
                successmessage(`${pathtofile} has successfully been removed from watch`)
            } else {
                error("that path does not exist")
            }
        }
    },
    "getassets": function () {
        var assetstore = new sqlite3.Database("assetstore.db", (err) => {
            if (err) {
                error(err)
            } else {
                https.get("https://bunrumz.com/assets.json", (res) => {
                    var body = '';

                    res.on('data', (chunk) => {
                        body += chunk;
                    });

                    res.on('end', () => {
                        var json = JSON.parse(body);
                        console.log(json)

                        Object.keys(json).forEach((value) => {
                            var versions = Object.keys(json[value]).filter(version => Number(version))
                            var maxassetversion = Math.max(versions)
                            console.log(value, maxassetversion)

                            const file = fs.createWriteStream("file.zip");
                            https.get("https://dl.dropboxusercontent.com/s/0z74kdbrx8azda7/stickman.zip", function (response) {

                                response.pipe(file);
                                var filesize = Number(response.headers["content-length"]);
                                console.log(response.headers["content-length"])
                                const bar1 = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
                                bar1.start(filesize, 0)
                                response.on("data", (data) => {
                                    // console.log(file.bytesWritten, response.headers["content-length"])
                                    bar1.update(file.bytesWritten)
                                })

                                file.on("finish", () => {
                                    bar1.update(file.bytesWritten)
                                    bar1.stop()
                                    successmessage("download complete.")
                                    file.close();
                                });
                            }).on("error", (err) => {
                                error(err)
                            })

                            assetstore.run(`insert or replace into downloaded values ("${value}", ${maxassetversion});`)
                            assetstore.all("select * from downloaded;", (err, rows) => {
                                console.log(rows)
                            })
                        })

                    });
                }).on("error", (err) => {
                    error(err)
                })
            }
        })
    }
}



const greeting = chalk.white.bold("welcome to silly dokkan!");
const commandslist = chalk.white.bold(`
--commands :3 😗--

| gencards - generates cards                                   
| execute   [path to file] - executes an sql file and generates cards after
| watch     [list, remove, add]
    list   - shows a list of all watching sql files
    remove - removes an sql file from watch event
    add    - watches an sql file, executes it, and generates cards after
`)
const boxenOptions = {
    padding: '0.5',
    margin: 0,
    backgroundColor: "#000000"
};
const msgBox = boxen(greeting, boxenOptions);
const msgBox2 = boxen(commandslist, boxenOptions)
console.log(msgBox);
console.log(msgBox2)

process.stdin.on('data', function (text) {
    var text = text.toString().trim()
    var wordsarray = text.split(' ')
    if (wordsarray[0] in commands) {
        commands[wordsarray[0]](text)
    } else {
        if (["help", "commands", "??"].includes(text)) {
            console.log(msgBox2)
        } else {
            console.log("that command does not exist")
        }

    }
});


// process.stdin.on("keypress",)