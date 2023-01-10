const dayjs = require("dayjs")
const fs = require("fs")
const Index = require("./start")
const { PythonShell } = require("python-shell")
var forAsync = require('for-async');
var sqlite3 = require('@journeyapps/sqlcipher').verbose();
const chalk = require("chalk");
const boxen = require("boxen");
const path = require("path");
var childproc = require("child_process")
const JSONStream = require('pixl-json-stream');
var cliProgress = require("cli-progress")
function parsejson(json) {
    var replacecmds = {
        "./": `${Index.fulladdress}/`,
        '".currentdate"': dayjs().unix(),
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
        // console.log(typeof(json))
        // var okai = check(json)
        var newton = check(json)
        Object.keys(replacecmds).forEach((rmnd) => {
            newton = newton.replaceAll(rmnd, replacecmds[rmnd])
        })
        return JSON.parse(newton)
    } catch (err) {
        console.error(`${json} does not exist`);
    }
}

function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function getAssetVersion() {
    const versions = fs.readdirSync(`${Index.rootDir}/public/assets`)
    let biggestNumber = 0;
    for (const number of versions) {
        const intNumber = parseInt(number, 10);
        if (intNumber > biggestNumber) {
            biggestNumber = intNumber;
        }
    }
    return biggestNumber
}

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

var ServerStart = function ServerStart(app) {

    var userjson = {
        "user": {
            "id": 0,
            "name": "",
            "is_ondemand": false,
            "rank": 999,
            "exp": 99999999,
            "act": 250,
            "boost_point": 0,
            "act_max": 250,
            "act_at": 1668127304,
            "boost_at": 0,
            "wallpaper_item_id": 0,
            "achievement_id": null,
            "mainpage_card_id": null,
            "mainpage_user_card_id": null,
            "mydata_subpage_visible": true,
            "card_capacity": 7777,
            "total_card_capacity": 7777,
            "friends_capacity": 50,
            "support_item_capacity": 4,
            "is_support_item_capacity_extended": true,
            "battle_energy": {
                "energy": 0,
                "recover_point_with_stone": 1,
                "battle_at": 0,
                "seconds_per_cure": 10800,
                "max_recovery_count": 5,
                "recovered_count": 0
            },
            "zeni": 999999999,
            "gasha_point": 999999,
            "exchange_point": 999999,
            "stone": 77777,
            "tutorial": {
                "progress": 999999,
                "is_finished": true,
                "contents_lv": 500
            },
            "is_potential_releaseable": true,
            "processed_at": 1668735348
        }
    }

    app.get("/ping", (req, res) => {
        res.send(
            {
                "ping_info": {
                    "host": Index.ipaddress,
                    "port": 443,
                    "port_str": 443,
                    "cf_uri_prefix": "https://cf.ishin-global.com/"
                }
            }
        )
    })

    app.post("/auth/sign_up", (req, res) => {
        console.log(req.body)
        res.send({
            "identifiers": "V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n", // V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n
            "user": {
                "name": userjson.user.name,
                "user_id": userjson.user.id
            }
        })
    })

    app.put("/auth/link_codes/:code", (req, res) => {
        console.log(req.params.code)
        userjson.user.name = `[Silly] ${req.params.code}`
        res.send({
            "identifiers": "V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n", // V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n
            "user": {
                "name": userjson.user.name,
                "user_id": userjson.user.id
            }
        })
    })

    app.post("/captcha/inquiry", (req, res) => {
        res.send({
            "inquiry": 147336251
        })
    })

    app.post("/auth/link_codes/:code/validate", (req, res) => {
        console.log(req.params.code)
        userjson.user.name = `[Silly] ${req.params.code}`
        res.send({
            "is_platform_difference": false,
            "name": userjson.user.name,
            "rank": userjson.user.rank,
            "user_id": 0
        })
    })

    app.post("/auth/sign_in", (req, res) => {
        console.log(req.headers)
        console.log(req.body)
        res.send({
            "access_token": "bun",
            "token_type": "mac",
            "secret": "g76Hc8z0giY4abXlazVg1+cSnRIhqguRcIRT2RI3+VC0u/sPmb1aLfuCVJOMbYt63OWY4WuWpSaKTbiN90ruWA==", // g76Hc8z0giY4abXlazVg1+cSnRIhqguRcIRT2RI3+VC0u/sPmb1aLfuCVJOMbYt63OWY4WuWpSaKTbiN90ruWA==
            "algorithm": "hmac-sha-256",
            "expires_in": 3600,
            "captcha_result": "success",
            "message": "Verification completed."
        })
    })

    app.get("/user", (req, res) => {
        var currentdate = dayjs().unix()
        // console.log(currentdate)
        userjson.user.processed_at = currentdate
        // var unixcurrentdate = dayjs()
        res.send(userjson)
    });

    app.put("/user", (req, res) => {
        var currentdate = dayjs().unix()
        // console.log(currentdate)
        userjson.user.processed_at = currentdate
        // var unixcurrentdate = dayjs()
        res.send(userjson)
    })

    app.get("/user/succeeds", (req, res) => {
        res.send({
            "external_links": {
                "facebook": "unserved",
                "game_center": "unserved",
                "google": "unserved",
                "apple": "unserved",
                "link_code": "unlinked"
            },
            "updated_at": dayjs().unix()
        })
    })

    app.get("/tutorial/assets", (req, res) => {
        fs.readFile(`${Index.rootDir}/public/tutorial/assets.json`, (err, data) => {
            if (err) {
                error(`generating asset json for public/tutorial`)
                const options = JSON.stringify({ "function": 'hashes', "source": `public/tutorial` })
                childproc.execFile(path.join(Index.rootDir, "bin", "hash.exe"), [options], (err, stdout, stderr) => {
                    if (err) {
                        error(err)
                    } else {
                        successmessage("tutorial asset json has been created")
                        fs.writeFileSync(`${Index.rootDir}/public/tutorial/assets.json`, JSON.stringify(JSON.parse(stdout), null, 4))
                        stdout = parsejson(stdout)
                        res.send({ "assets0": stdout })
                    }
                })  
            } else {
                successmessage("existing tutorial asset json found")
                var assets = parsejson(data.toString('utf-8'))
                res.send({ "assets0": assets })
            }
        })
    })

    app.get("/gashas", (req, res) => {
        var gashasjson = parsejson("local/gashas.json")
        res.send(gashasjson)
    })

    app.get("/gashas/:id/featured_cards", (req, res) => {
        var gashaid = req.params["id"]
        var featuredjson = parsejson(`local/gashas/${gashaid}/featured_cards.json`)
        res.send(featuredjson)
    })

    app.post("/gashas/1/courses/2/draw", (req, res) => {

        const gasha_items = []


        res.send({
            "gasha_items": [
                {
                    "item_id": 1000770,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 1000750,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 3000280,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 3000220,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 1000670,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 1003730,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 1001910,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 1002630,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 1001890,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                },
                {
                    "item_id": 1000771,
                    "item_type": "Card",
                    "card_exp_init": 0,
                    "quantity": 1
                }
            ],
            "user_items": {
                "item_cards": [
                    {
                        "id": 11093738,
                        "card_id": 1002630,
                        "quantity": 6
                    }
                ],
                "cards": [
                    {
                        "id": 1597142315,
                        "card_id": 1000770,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142316,
                        "card_id": 1000750,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142317,
                        "card_id": 3000280,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142318,
                        "card_id": 3000220,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142319,
                        "card_id": 1000670,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142320,
                        "card_id": 1003730,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142321,
                        "card_id": 1001910,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142322,
                        "card_id": 1001890,
                        "exp": 0,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    },
                    {
                        "id": 1597142323,
                        "card_id": 1000771,
                        "exp": 7555,
                        "skill_lv": 1,
                        "is_favorite": false,
                        "awakening_route_id": null,
                        "is_released_potential": false,
                        "released_rate": 0.0,
                        "optimal_awakening_step": null,
                        "card_decoration_id": null,
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [],
                        "updated_at": 1672049475,
                        "created_at": 1672049475,
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": []
                    }
                ]
            },
            "is_reviewable": false,
            "assets": {},
            "movie": {
                "type": 3,
                "flags": [
                    "SSR",
                    "LR_SEED",
                    "UNACQUIRED_LR_SEED_OR_LIMITED"
                ],
                "limited_cards": [],
                "carnival_only_cards": [],
                "lr_seed_cards": [
                    1003730
                ]
            },
            "missions": [
                {
                    "id": 1202554929,
                    "current_value": 1,
                    "mission_id": 6006,
                    "completed_at": 1672049475,
                    "accepted_reward_at": null
                },
                {
                    "id": 1202554930,
                    "current_value": 1,
                    "mission_id": 15531,
                    "completed_at": 1672049475,
                    "accepted_reward_at": null
                }
            ]
        })
    })

    app.post("/ondemand_assets", (req, res) => {
        cardtosend = {
            "cards": [],
            "battle_character": [],
            "card_bgs": []
        }
        res.send(cardtosend)
    })

    app.get("/client_assets/database", (req, res) => {
        var versionsjson = JSON.parse(fs.readFileSync(`${Index.rootDir}/local/versions.json`))
        res.send({
            "url": `${Index.fulladdress}/database.db`,
            "file_path": "sqlite/current/en/database.db",
            "algorithm": "version",
            "hash": versionsjson["database"],
            "version": versionsjson["database"]
        })
    })

    app.get("/cards", (req, res) => {
        var loginjson = parsejson(`${Index.rootDir}/local/resources/login.json`)
        // res.send({
        //     "cards": [],
        //     "user_card_id_updates": {}
        // })
        // res.send(parsejsonfile("local/cards.json"))
        res.send({
            "cards": loginjson["cards"],
            "user_card_id_updates": loginjson["user_card_id_updates"]
        })
    })

    app.get("/client_assets", (req, res) => {
        clientversion = Number(req.headers["x-assetversion"]) || 0
        var serverassetversion = getAssetVersion()
        if (clientversion > serverassetversion) {
            clientversion = 0
        }
        // console.log(clientversion, serverassetversion)
        between = range(clientversion, serverassetversion)
        between.shift()
        // console.log(between)
        var master = []
        forAsync(between, function (item, idx) {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    fs.readFile(`${Index.rootDir}/public/assets/${item}/assets.json`, (err, data) => {
                        if (err) {
                            const options = JSON.stringify({
                                "function": 'hashes',
                                "source": `public/assets/${item}`,
                                "version": item
                            })

                            error(`asset json for version ${item} not found, will attempt to create one (depending on the amount of files in the directory it may take long)`)
                            // const ls = childproc.spawn(path.join(Index.rootDir, "bin", "hash.exe"), [options], { stdio: ['pipe', 'pipe', 'pipe'] })
                            const ls = childproc.spawn("python", ["hash.py", options], { stdio: ['pipe', 'pipe', 'pipe'] })
                            let stream = new JSONStream(ls.stdout, ls.stdin);
                            var localmaster = []
                            var bar;
                            
                            stream.on("text", (text) => {
                                if (!bar) {
                                    bar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
                                    bar.start(Number(text))
                                }
                            })  

                            stream.on('json', function (data) {
                                master.push(parsejson(data))
                                bar.increment()
                                
                                localmaster.push(data)
                            });
                            ls.stderr.on("data", (chunk) => {
                                error(chunk.toString())
                            })
                            ls.stdout.on("close", () => {
                                bar.stop()
                                successmessage(`asset json for version ${item} has been created`)
                                // console.log(master)
                                fs.writeFileSync(`${Index.rootDir}/public/assets/${item}/assets.json`, JSON.stringify(localmaster, null, 4))
                                resolve()
                            })
                        } else {
                            // var fixdata = JSON.parse(data.toString('utf8').replaceAll("./", `${Index.fulladdress}/`))
                            successmessage(`asset json has been found for version ${item}`)
                            var fixdata = parsejson(data.toString('utf-8'))
                            master = master.concat(fixdata)
                            resolve();// <-- signals that this iteration is complete
                        }
                    })
                }, 25);// delay 25 ms to make async
            })
        })
            .then(function () {
                // var wra
                var wrath = {}
                for (var i = 0; i < master.length; i++) {
                    var currentindex = master[i]
                    for (var o = 0; o < master.length; o++) {
                        var currentindex2 = master[o]
                        if (currentindex["file_path"] == currentindex2["file_path"]) {
                            if (currentindex["assetversion"] != currentindex2["assetversion"]) {
                                if (currentindex["assetversion"] > currentindex2["assetversion"]) {
                                    wrath[currentindex["file_path"]] = currentindex
                                }
                            }
                        }
                    }
                }
                var chamber = Object.keys(wrath)
                const filtered = master.filter((dict) => {
                    if (!chamber.includes(dict["file_path"])) {
                        return dict
                    }
                })
                chamber.forEach((newdict) => {
                    filtered.push(wrath[newdict])
                })
                res.send({ "assets": filtered, "latest_version": serverassetversion })
            })

    })

    app.get("/title/banners", (req, res) => {
        // res.send({})
        res.send({
            "banners": [
                {
                    "id": 1,
                    "image": `${Index.fulladdress}/banner.png`,
                    "link_to": "https://www.instagram.com/dragon_ball_z_dokkan_battle/",
                    "description": "Visit our official Instagram!",
                    "start_at": 1590733802,
                    "end_at": 1924991999
                }],
            "treasure_item_switching_banners": []
        })
    })

    app.get("/item_reverse_resolutions/achievements", (req, res) => {
        res.send(parsejson("local/item_reverse_resolutions/achievements.json"))
    })

    app.get("//user/mydata", (req, res) => {
        res.send({
            "id": 0,
            "name": "username",
            "rank": 999,
            "leader": {
                "id": 1022771,
                "card_id": 1022771,
                "exp": 5000000,
                "skill_lv": 1,
                "awakening_route_id": null,
                "is_favorite": true,
                "is_released_potential": false,
                "released_rate": 0.0,
                "optimal_awakening_step": null,
                "awakenings": [],
                "unlocked_square_statuses": [
                    2,
                    2,
                    2,
                    2
                ],
                "created_at": 1669582597,
                "card_decoration_id": null,
                "exchangeable_item_id": null,
                "potential_parameters": [],
                "equipment_skill_items": [],
                "link_skill_lvs": []
            },
            "achievement_id": null,
            "mainpage_card_id": null,
            "mainpage_user_card_id": null,
            "num_friends": 0,
            "max_friends": 50,
            "score": {
                "total_score": 130,
                "quest_clears": 3,
                "dokkan_awakenings": 1,
                "max_link_skill_lvs": 0,
                "potential_squares": 0
            },
            "dot_character": {
                "id": 1009,
                "point": 11
            },
            "subpage_visible": true,
            "achievement_ids": [
                {
                    "achievement_id": 504,
                    "received_at": 1669537464
                },
                {
                    "achievement_id": 526,
                    "received_at": 1669537448
                }
            ],
            "sortie_character_counts": [
                {
                    "card_unique_info_id": 3,
                    "sortie_count": 1,
                    "last_card_id": 1022771
                },
                {
                    "card_unique_info_id": 35,
                    "sortie_count": 1,
                    "last_card_id": 1001090
                }
            ],
            "quest_cleared_counts": [
                {
                    "area_category": 9000,
                    "cleared_count": 3
                }
            ]
        })
    })

    app.get("/resources/:type", (req, res) => {
        var type = req.params["type"]
        var requestheaders = req.headers
        var versionsjson = JSON.parse(fs.readFileSync(`${Index.rootDir}/local/versions.json`))
        var assetversion = requestheaders['x-assetversion']
        var databaseversion = requestheaders['x-databaseversion']
        var serverassetversion = getAssetVersion()
        var serverdatabaseversion = versionsjson["database"]
        console.log(`clients asset version: ${assetversion}`, `clients db version: ${databaseversion}`)
        console.log(`servers asset version: ${serverassetversion}`, `servers db version: ${serverdatabaseversion}`)
        // res.send(JSON.parse(fs.readFileSync((`local/resources/${type}.json`))))
        // return
        if (serverdatabaseversion != databaseversion) {
            console.log("download database")
            // res.status = 400
            res.statusCode = 400
            res.send({
                "error": {
                    "code": "client_database/new_version_exists"
                }
            })
            // return true
        } else if (serverassetversion != assetversion) {
            console.log("download assets")
            // return true
            res.statusCode = 400
            res.send({
                "error": {
                    "code": "client_assets/new_version_exists"
                }
            })
        } else {
            console.log("no need to download new files")
            res.send(parsejson(`${Index.rootDir}/local/resources/${type}.json`))
        }
    })

    app.get("/shops/:type/items", (req, res) => {
        var type = req.params["type"]
        if (type == "treasure") {
            res.send({
                "error": "not available yet"
            })
            res.statusCode = 400
        }
        res.send(parsejson(`${Index.rootDir}/local/shops/${type}/items.json`))
    })

    app.get("/treasure_items", (req, res) => {
        res.send({
            "user_treasure_items": []
        })
    })

    app.post("/missions/put_forward", (req, res) => {
        res.send({
            "missions": []
        })
    })

    app.get("//missions/mission_board_campaigns/:id", (req, res) => {
        res.send({})
    })

    app.post("/missions/accept", (req, res) => {
        console.log(req.body)
        res.send({})
    })

    app.get("/gifts", (req, res) => {
        res.send({
            "gifts": []
        })
    })

    app.get("/chain_battles", (req, res) => {
        res.send({
            "expire_at": 1668834000
        })
    })

    app.get("/iap_rails/googleplay_products", (req, res) => {
        res.send({
            "products": [],
            "daily_reset_at": dayjs().unix(),
            "expire_at": dayjs().unix(),
            "processed_at": dayjs().unix()
        })
        // res.send(JSON.parse(fs.readFileSync(path.join("local", "iap_rails", "googleplay_products.json"))))
    })

    app.get("/db_stories", (req, res) => {
        res.send({
            "db_stories": []
        })
    })

    app.put("/advertisement/id", (req, res) => {
        res.send({})
    })

    app.get("/announcements", (req, res) => {
        console.log("single")
        if (req.query["display"] == "home") {
            res.send(parsejson(`${Index.rootDir}/local/announcements.json`))
        }
    })

    app.get("/announcements/:route", (req, res) => {
        var pathez = req.params.route

        if (pathez == "notify") {
            res.send({
                "announcement_is_new": true
            })
        } else {

            try {
                res.send(parsejson(`${Index.rootDir}/local/nnoucements/${pathez}.json`))
            } catch (err) {
                res.statusCode = 200
                res.send({})
            }
        }

    })

    app.get("/cooperation_campaigns", (req, res) => {
        res.send({
            "expire_at": 1669176000
        })
    })

    app.get("/sd/battle", (req, res) => {
        res.send({
            "id": 1,
            "start_at": 1999999999,
            "end_at": 1999999999,
            "result_end_at": 1999999999,
            "sd_map_id": 1,
            "tutorial": {
                "is_opening_finished": true,
                "progress": 255
            },
            "expires_at": 1999999999
        })
    })
    app.get("/dragonball_sets", (req, res) => {
        res.send({ "dragonball_sets": [] })

    })
    app.get("/special_items", (req, res) => {
        res.send({
            "special_items": []
        })
    })
    app.get("/sd/packs", (req, res) => {
        res.send({ "sd_packs": [] })
    })
    app.get("/joint_campaigns", (req, res) => {
        res.send({
            "expire_at": 1669176000
        })
    })
    app.post("/joint_campaigns/accept", (req, res) => {
        res.send({
            "joint_campaign_events": []
        })
    })

    app.post("/teams", (req, res) => {
        console.log(req.body)
        currentlead = req.body["user_card_teams"][0]["user_card_ids"][0]

        login = parsejson(`${Index.rootDir}/local/resources/login.json`)

        login["teams"]["selected_team_num"] = req.body["selected_team_num"]
        login["teams"]["user_card_teams"][Number(req.body["selected_team_num"]) - 1] = req.body["user_card_teams"][0]

        fs.writeFileSync(`${Index.rootDir}/local/resources/login.json`, JSON.stringify(login, null, 4))

        // req.body["selected_team_num"]
        res.send({
            "selected_team_num": req.body["selected_team_num"],
            "user_card_teams": req.body["user_card_teams"],
            "missions": []
        })
    })

    app.get("/user_areas", (req, res) => {
        var eventsjson = parsejson(`${Index.rootDir}/local/events.json`)
        var user_areas = {
            "user_areas": [],
            "user_z_battles": []
        }
        var db = new sqlite3.Database('public/database.db', (err) => {
            if (err) {
                error(`database does not exist in "public" folder`)
            } else {
                db.run("PRAGMA key='9bf9c6ed9d537c399a6c4513e92ab24717e1a488381e3338593abd923fc8a13b'")
                db.run("PRAGMA cipher_compatibility = 3")

                var quests = new Promise((resolve) => {
                    db.all("select sugoroku_maps.id as sugoroku_map_id, sugoroku_maps.difficulty as difficulty, quests.id as questid, areas.id as areaid from quests join areas on quests.area_id == areas.id join sugoroku_maps on quests.id == sugoroku_maps.quest_id", (err, rows) => {
                        resolve(rows)
                    })
                })
                quests.then((rows) => {
                    eventsjson["events"].forEach((ev, index, array) => {
                        var sugorokus = rows.filter(dict => dict["areaid"] == ev["id"])
                        var currentarea = {
                            "area_id": ev["id"],
                            "is_cleared_normal": true,
                            "is_cleared_hard": true,
                            "is_cleared_very_hard": true,
                            "is_cleared_super_hard1": true,
                            "is_cleared_super_hard2": true,
                            "is_cleared_super_hard3": true,
                            "user_sugoroku_maps": []
                        }
                        sugorokus.forEach((dict) => {
                            currentarea.user_sugoroku_maps.push({
                                "sugoroku_map_id": dict["sugoroku_map_id"],
                                "visited_count": 1,
                                "cleared_count": 1,
                                "challenge_label": null
                            })
                        })
                        user_areas.user_areas.push(currentarea)
                        if (index == array.length - 1) {
                            res.send(user_areas)
                        }
                    })
                })
                db.close()
            }
        });

        // res.send(parsejson(`${Index.rootDir}/local/user_areas.json`))
    })

    app.get("/events", (req, res) => {
        res.send(parsejson(`${Index.rootDir}/local/events.json`))
    })

    app.get("/quests/:eventid/briefing", (req, res) => {
        var eventid = req.params["eventid"]
        // var briefingjson = JSON.parse(fs.readFileSync(path.join("local", "quests", "403001", "briefing.json")))
        var login = parsejson(`${Index.rootDir}/local/resources/login.json`)
        console.log(`selected team: ${req.query["team_num"]}`)

        if (login["teams"]["user_card_teams"][Number(req.query["team_num"]) - 1]["user_card_ids"][0]) { // if team leader exists
            var teamleader = login["cards"].filter((Card) => Card["card_id"] == login["teams"]["user_card_teams"][Number(req.query["team_num"]) - 1]["user_card_ids"][0])[0]
            console.log(teamleader)
            res.send({
                "supporters": [],
                "cpu_supporters": [
                    {
                        "id": 1,
                        "name": "Auto detect",
                        "leader": teamleader,
                        "achievement_id": 490,
                        "rank": 999,
                        "is_friend": true,
                        "is_dummy": false,
                        "login_at": 1669538939,
                        "gasha_point": 0,
                        "is_cpu_supporter": true,
                        "is_cooperation_inviter": false
                    }
                ],
                "teaming_power_weight": {
                    "attack": 1.2,
                    "defense": 1.5,
                    "hp": 1,
                    "link_skill": 500,
                    "energy": 10000,
                    "skill_lv": 100
                },
                "ranking_enabled": true,
                "last_deck_cards": [],
                "is_cpu_only": false
            })
        } else {
            res.send({
                "supporters": [],
                "cpu_supporters": [
                    {
                        "id": 1,
                        "name": "Select Team Leader",
                        "leader": {
                            "id": 1000011,
                            "card_id": 1000011,
                            "exp": 30000000,
                            "skill_lv": 10,
                            "is_favorite": true,
                            "awakening_route_id": null,
                            "is_released_potential": true,
                            "released_rate": 100,
                            "optimal_awakening_step": null,
                            "card_decoration_id": null,
                            "exchangeable_item_id": null,
                            "awakenings": [],
                            "unlocked_square_statuses": [
                                0,
                                0,
                                0,
                                0
                            ],
                            "updated_at": 1672105448,
                            "created_at": 1672105448,
                            "potential_parameters": [],
                            "equipment_skill_items": [],
                            "link_skill_lvs": []
                        },
                        "achievement_id": 490,
                        "rank": 999,
                        "is_friend": true,
                        "is_dummy": false,
                        "login_at": 1669538939,
                        "gasha_point": 0,
                        "is_cpu_supporter": true,
                        "is_cooperation_inviter": false
                    }
                ],
                "teaming_power_weight": {
                    "attack": 1.2,
                    "defense": 1.5,
                    "hp": 1,
                    "link_skill": 500,
                    "energy": 10000,
                    "skill_lv": 100
                },
                "ranking_enabled": true,
                "last_deck_cards": [],
                "is_cpu_only": false
            })
        }
    })

    app.post("/quests/:eventid/sugoroku_maps/start", (req, res) => {
        var startjson = parsejson(`${Index.rootDir}/local/quests/955003/sugoroku_maps/start.json`)
        startjson["user"] = userjson
        res.send(startjson)
        // var userjson = JSON.parse(fs.readFileSync())
        // console.log(user)
        // const options = {
        //     args: JSON.stringify({
        //         "function": "decryptsign",
        //         "sign": JSON.parse(fs.readFileSync("local/quests/403001/sugoroku_maps/start.json"))["sign"],
        //         "isGlobal": true
        //     })
        // }
        // PythonShell.run("hash.py", options, (err, results) => {
        //     if (err) throw err
        //     console.log(results)
        //     res.send(JSON.parse(results[0]))
        // })
    })

    app.post("/quests/:eventid/sugoroku_maps/continue_info", (req, res) => {
        res.send({})
    })

    app.post("/quests/:eventid/sugoroku_maps/continue", (req, res) => {
        res.send({})
    })

    app.post("/quests/:eventid/sugoroku_maps/finish", (req, res) => {
        console.log(req.body)
        var finishjson = parsejson(`${Index.rootDir}/local/quests/403001/sugoroku_maps/finish.json`)
        // var yolo = decryptsign('E4/uXDnTDYjVgmF1IH6jZ5YlJ6VqU3XKJ7SZS9N4LAPFctaKhl7D7iv4+3O6bKXwWk0BbuVCrl83QwF3Ggjh43FQIsabwwZojlgtBifmRKjnSCJh0ZWMWJvfJTvss0JQ7alleDfoW1fhIF1DgHezVJh26udHHx1THyy/3OiDJBVTfzdYtuT+zgACg753rIh6HbCWLoHE/3xRweoQpx0oxQN/BdLMHEsBXffCUnYEVWWAfT169oTPIGEJZefPvP9jaQOgTxKsqyDGXjHbS1/qOb3SqDBZNJtLARV/JX24ymyKLsphUxW/dAVM1iP8bRe9fFwZOAAmSLHfvX4m3U2t7qthlw4Wzy6fQQyk6EZf8RAPSGhiIYjq6KD8QzXOik9+Flip+w/Wr7POHmmqoYXO0qhPMng1gGT8fjsobSQ4IbZh1ez4GNmRslkfNJ0TdqtR/wAvggP4+wYK6l2lGquvW1wQhEy1M59+it0G+NosdisfVO3rSzq2wtRnWQVXGDbIKzwsncRu8FpoU7b9EVOEhhZ4yEIKC3I8lVGTgGlyN9tzttqGlURTm8SVw8A12ScnLYlBiWMMPn2jTgJOiVbuPeZ7izDm5wbu5SXsTSd4LtsfbyINa5RahColi1sjbypdVAvXF17CXg3YPjcqkCt0fYKoJ1GJFN31gaQMO+FASNeaWoCfTfb30UN7GUi7WuBVQvba/G4v0AnEebINyGcdNhg1EzzHjZKv70mWb+faTCfnptm6wSb1hORZwQJ98hOl+wTaalSEYrhdjFss8Ww0fIqoIgAu/U5TMMiMKykQWUSQtTzgkmooA1KZvbHxTeH3HxkN0yxC6hMYuYV/+A0PI+6JunApfAOep8DVQXpyCVcom1zAKkYtCqH8DM4eqygopVqDsppyqdlFPE4qcctnVQLH3Fiv0UyMSwnp1t/aNfUBTK1EUPXMcg==')
        // console.log(yolo)
        finishjson["user"] = userjson
        res.send(finishjson)
        // const options = {
        //     args: JSON.stringify({
        //         "function": "encryptsign",
        //         "sign": JSON.stringify(finishjson),
        //         "isGlobal": true
        //     })
        // }
        // PythonShell.run("hash.py", options, (err, results) => {
        //     if (err) throw err
        //     console.log(results)
        //     res.send({
        //         "sign": results[0]
        //     })
        // })
    })

    app.get("*", (req, res) => {
        console.log(`${req.path} does not exist`)
        res.send({})
    })
}

module.exports = {
    ServerStart: ServerStart
}