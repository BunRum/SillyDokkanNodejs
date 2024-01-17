const express = require("express");
var fs = require("fs")
const path = require('path')
const dayjs = require("dayjs");
const miscfunctions = require("./miscfunctions");
var JSONStream = require("pixl-json-stream")
var childprocess = require("child_process")
const { parsejson } = require("./miscfunctions");
const dbfunctions = require("./uifunctions")
const uuid = require('uuid');
require("dotenv").config()
var sqlite3 = require('@journeyapps/sqlcipher').verbose();
// var datadb = new sqlite3.Database('data.db', (err) => {
//     // console.log(err);
//     if (err) {
//         error(`database does not exist in "public" folder`)
//     }
// });
// const port = 3000
// const rootDir = (process.pkg) ? process.cwd() : __dirname;
const app = express();

// console.log(process.env.DEBUG)
// if (process.env.DEBUG === "true") {
//     https.createServer({
//         key: fs.readFileSync("localhost+1-key.pem"),
//         cert: fs.readFileSync("localhost+1.pem"),
//     }, app).listen(process.env.DEBUG_PORT, () => {
//         console.log(`server is runing at port ${process.env.DEBUG_PORT}`)
//     });
// }
app.listen(process.env.PORT)

app.use(express.text())
app.use(express.json())
app.use(express.static('assets'))
app.use(express.static('public'))
app.disable('etag')
app.use(function (req, res, next) {
    // console.log(req);

    console.log(`${req.method} - ${req.url} `)
    console.log(req.body)

    console.log(req.headers)

    // console.log(res.headers["connect-src"])
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

var compression = require('compression');
app.use(compression());

var userjson = {
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

app.get("/", function (req, res) {
    res.send("<h1>Hello there.</h1>")
})

app.get("/ping", function (req, res) {
    res.send(
        {
            "ping_info": {
                "host": req.headers.host,
                "port": 443,
                "port_str": 443,
                "cf_uri_prefix": "https://cf.ishin-global.com/"
            }
        }
    )
})

app.post("/auth/sign_up", function (req, res) {
    const userId = uuid.v4();
    console.log(typeof (userId))

    const allUsers = new Promise((resolve, reject) => {
        datadb.run(`insert into users ("name", "uuid") values ("demo", "${userId}")`, (err, rows) => {
            if (err) throw (err);
            // console.log("done")
            resolve(rows)
        })
    }).then((rows) => {
        res.send({
            "identifiers": userId,
            // "identifiers": "V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n", // V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n
            "user": {
                "name": "",
                "user_id": userjson.id
            }
        })
    })
})

// sqlite3.run(`INSERT INTO "main"."users" ("id", "name", "uuid") VALUES (${}, '', '');`)


app.put("/auth/link_codes/:code", function (req, res) {
    console.log(req.params.code)
    userjson.name = `[Silly] ${req.params.code}`
    res.send({
        "identifiers": "V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n", // V1VoSFBHWWNlUTRhdkZmNEFyeDJDdnQ4a0VjckMzZE8xSlUzeHZlSjNLUTlh\nM1NHOVpjTEhyb0c3MWlxRWlRdHQ1SURSUm5QcGlXd0NhMkRoZWRvZ1c9PTp4\ndzBOem5mVU00Q3hVZG5hZVoxbkROPT0=\n
        "user": {
            "name": userjson.name,
            "user_id": userjson.id
        }
    })
})

app.post("/captcha/inquiry", function (req, res) {
    res.send({
        "inquiry": 147336251    
    })
})

app.post("/auth/link_codes/:code/validate", function (req, res) {
    console.log(req.params.code)
    userjson.name = `[Silly] ${req.params.code}`
    res.send({
        "is_platform_difference": false,
        "name": userjson.name,
        "rank": userjson.rank,
        "user_id": 0
    })
})

app.post("/auth/sign_in", function (req, res) {
    console.log(req.headers)
    // console.log(req.body)
    res.send({
        "access_token": "bun",
        "token_type": "mac",
        "secret": "king",
        // "secret": "g76Hc8z0giY4abXlazVg1+cSnRIhqguRcIRT2RI3+VC0u/sPmb1aLfuCVJOMbYt63OWY4WuWpSaKTbiN90ruWA==", // g76Hc8z0giY4abXlazVg1+cSnRIhqguRcIRT2RI3+VC0u/sPmb1aLfuCVJOMbYt63OWY4WuWpSaKTbiN90ruWA==
        "algorithm": "hmac-sha-256",
        "expires_in": 3600,
        "captcha_result": "success",
        "message": "Verification completed."
    })
})

app.get("/user", function (req, res) {
    // console.log(currentdate)
    userjson.processed_at = dayjs().unix()
    // var unixcurrentdate = dayjs()
    res.send({ "user": userjson })
});

app.put("/user", function (req, res) {
    // console.log(currentdate)
    userjson.processed_at = dayjs().unix()
    // var unixcurrentdate = dayjs()
    res.send({ "user": userjson })
})

app.get("/user/succeeds", function (req, res) {
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

app.get("/tutorial/assets", function (req, res) {
    // res.json({ "assets0": [] })
    res.json({"assets0": parsejson("tutorial.json")})
    // const start = Date.now();

    // let clientAssetVersion = 0;
    // if (req.headers['x-assetversion']) {
    //     clientAssetVersion = parseInt(req.headers['x-assetversion']) * 1000;
    // }
    // console.log(clientAssetVersion, start)

    // let tutorialtime = miscfunctions.parsejson("info.json")["tutorial"]
    // console.log(tutorialtime)
    // const timeAssets = miscfunctions.GetFilesTimed(new Date(tutorialtime), "./tutorial");
    // console.log(timeAssets.length)
    // if (timeAssets.length === 0) {
    //     res.json({ "assets0": miscfunctions.parsejson("tutorial.json") })
    // } else {
    //     const options = JSON.stringify({
    //         "function": 'hashes',
    //         "source": `./tutorial`
    //     })

    //     const ls = childprocess.spawn(path.join("dist", "hash", "hash.exe"), [options], { stdio: ['pipe', 'pipe', 'pipe'] })
    //     let stream = new JSONStream(ls.stdout, ls.stdin);
    //     var localmaster = []

    //     stream.on("text", (text) => {
    //         //            console.log(text)
    //     })

    //     stream.on('json', function (data) {
    //         //            console.log(data)
    //         localmaster.push(data)
    //     });

    //     ls.stdout.on("close", () => {
    //         console.log("process closed")
    //         fs.writeFileSync(`tutorial.json`, JSON.stringify(localmaster, null, 4))
    //         res.json({ "assets0": parsejson(localmaster) })
    //         let infojson = miscfunctions.parsejson("info.json")
    //         infojson["tutorial"] = Date.now()
    //         fs.writeFileSync("info.json", JSON.stringify(infojson, null, 4))
    //     })
    // }
})

app.get("/gashas", function (req, res) {
    var gashasjson = miscfunctions.parsejson("local/gashas.json")
    res.send(gashasjson)
})

app.get("/gashas/:id/featured_cards", function (req, res) {
    var gashaid = req.params["id"]
    var featuredjson = miscfunctions.parsejson(`local/gashas/${gashaid}/featured_cards.json`)
    res.send(featuredjson)
})

app.post("/gashas/1/courses/2/draw", function (req, res) {

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
        }
    })
})

app.post("/ondemand_assets", function (req, res) {
    cardtosend = {
        "cards": [],
        "battle_character": [],
        "card_bgs": []
    }
    res.send(cardtosend)
})

app.get("/client_assets/database", function (req, res) {
    const dbversion = parsejson("info.json")["database"]
    res.send({
        "url": `${process.env.STORAGE_BUCKET_URL}/sqlite/current/en/database.db`,
        "file_path": "sqlite/current/en/database.db",
        "algorithm": "version",
        "hash": dbversion,
        "version": dbversion
    })

})

app.get("/cards", function (req, res) {
    var loginjson = miscfunctions.parsejson(`local/resources/login.json`)
    // res.send({
    //     "cards": [],
    //     "user_card_id_updates": {}
    // })
    // res.send(miscfunctions.parsejsonfile("local/cards.json"))
    res.send({
        "cards": loginjson["cards"],
        "user_card_id_updates": loginjson["user_card_id_updates"]
    })
    // res.send({"cards": [], "usercard"})
})
app.get('/client_assets', (req, res) => {
    // const storage = new Storage()
    // const bucket = storage.bucket(process.env.STORAGE_BUCKET)
    // const filesStream = bucket.getFilesStream();
    // const files = []
    // console.log("red")
    // filesStream
    //     .on('data', (file) => {
    //         files.push(file.metadata)
    //     })
    //     .on('error', (err) => {
    //         console.error('Error occurred:', err);
    //     })
    //     .on('end', () => {
    //         console.log('File listing completed.');
    //         let result = files.map(a => a["metadata"]);
    //         res.send({ "assets": parsejson(result), "latest_version": Date.now() })
    //     });
    const assetsjson = miscfunctions.parsejson("assets.json")
    res.send({ "assets": assetsjson, "latest_version": Date.now() })
});



app.get("/title/banners", function (req, res) {
    // res.send({})
    res.send(parsejson({
        "banners": [
            {
                "id": 1,
                "image": `./banner.png`,
                "link_to": "https://www.instagram.com/dragon_ball_z_dokkan_battle/",
                "description": "Visit our official Instagram!",
                "start_at": 1590733802,
                "end_at": 1924991999
            }],
        "treasure_item_switching_banners": []
    }))
})

app.get("/item_reverse_resolutions/achievements", function (req, res) {
    res.send(miscfunctions.parsejson("local/item_reverse_resolutions/achievements.json"))
})

app.get("//user/mydata", function (req, res) {
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
app.get("/test", async function (req, res) {
    let infojson = miscfunctions.parsejson("info.json")
    miscfunctions.GetFilesTimedCloud(new Date(infojson["client_assets"])).then((files) => {
        infojson["client_assets"] = Date.now()
        fs.writeFileSync("info.json", JSON.stringify(infojson, null, 4))
        res.send(files)
    })

})

app.get('/resources/:type', (req, res) => {
    const ResourceType = req.params.type || 'login';
    let clientAssetVersion = 0;
    let clientDbVersion = 0;

    if (req.headers['x-assetversion']) {
        clientAssetVersion = parseInt(req.headers['x-assetversion']);
    }
    if (req.headers['x-databaseversion']) {
        clientDbVersion = parseInt(req.headers['x-databaseversion']);
    }

    switch (ResourceType) {
        case 'login':
            let infojson = parsejson("info.json");

            if (clientDbVersion !== infojson["database"]) {
                res.statusCode = 400;
                res.json({ error: { code: "client_database/new_version_exists" } });
                break;
            }

            if (clientAssetVersion !== infojson["client_assets"]) {
                var assets = miscfunctions.GetFilesTimed(new Date(infojson["client_assets"]), "./assets");
                if (clientAssetVersion < infojson["client_assets"] || assets.length !== 0) {
                    res.statusCode = 400;
                    res.json({ error: { code: 'client_assets/new_version_exists' } });
                }
                break;
            }
            res.json({})
            // res.json(miscfunctions.parsejson("local/resources/login.json"));
            // res.json(miscfunctions.parsejson("local/resources/login.json"));
            break;

        case 'home':
            res.json(miscfunctions.parsejson("local/resources/home.json"));
            break;

        default:
            res.send();
            break;
    }
});


app.get("/shops/:type/items", function (req, res) {
    var type = req.params["type"]
    if (type === "treasure") {
        res.send({
            "error": "not available yet"
        })
        res.statusCode = 400
    }
    res.send(miscfunctions.parsejson(`local/shops/${type}/items.json`))
})

app.get("/treasure_items", function (req, res) {
    res.send({
        "user_treasure_items": []
    })
})

app.post("/missions/put_forward", function (req, res) {
    res.send({
        "missions": []
    })
})

app.get("//missions/mission_board_campaigns/:id", function (req, res) {
    res.send({})
})

app.post("/missions/accept", function (req, res) {
    console.log(req.body)
    res.send({})
})

app.get("/gifts", function (req, res) {
    res.send({
        "gifts": []
    })
})

app.get("/chain_battles", function (req, res) {
    res.send({
        "expire_at": 1668834000
    })
})

app.get("/iap_rails/googleplay_products", function (req, res) {
    res.send({
        "products": [],
        "daily_reset_at": dayjs().unix(),
        "expire_at": dayjs().unix(),
        "processed_at": dayjs().unix()
    })
    // res.send(JSON.parse(fs.readFileSync(path.join("local", "iap_rails", "googleplay_products.json"))))
})

app.get("/db_stories", function (req, res) {
    res.send({
        "db_stories": []
    })
})

app.put("/advertisement/id", function (req, res) {
    res.send({})
})

app.get("/announcements", function (req, res) {
    console.log("single")
    if (req.query["display"] === "home") {
        res.send(miscfunctions.parsejson(`local/announcements.json`))
    }
})

app.get("/announcements/:route", function (req, res) {
    var pathez = req.params.route

    if (pathez === "notify") {
        res.send({
            "announcement_is_new": true
        })
    } else {

        try {
            res.send(miscfunctions.parsejson(`local/annoucements/${pathez}.json`))
        } catch (err) {
            res.statusCode = 200
            res.send({})
        }
    }

})

app.get("/cooperation_campaigns", function (req, res) {
    res.send({
        "expire_at": 1669176000
    })
})

app.get("/sd/battle", function (req, res) {
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
app.get("/dragonball_sets", function (req, res) {
    res.send({ "dragonball_sets": [] })

})
app.get("/special_items", function (req, res) {
    res.send({
        "special_items": []
    })
})
app.get("/sd/packs", function (req, res) {
    res.send({ "sd_packs": [] })
})
app.get("/joint_campaigns", function (req, res) {
    res.send({
        "expire_at": 1669176000
    })
})
app.post("/joint_campaigns/accept", function (req, res) {
    res.send({
        "joint_campaign_events": []
    })
})

app.post("/teams", function (req, res) {
    console.log(req.body)
    currentlead = req.body["user_card_teams"][0]["user_card_ids"][0]

    login = miscfunctions.parsejson(`local/resources/login.json`)

    login["teams"]["selected_team_num"] = req.body["selected_team_num"]
    login["teams"]["user_card_teams"][Number(req.body["selected_team_num"]) - 1] = req.body["user_card_teams"][0]

    fs.writeFileSync(`local/resources/login.json`, JSON.stringify(login, null, 4))

    // req.body["selected_team_num"]
    res.send({
        "selected_team_num": req.body["selected_team_num"],
        "user_card_teams": req.body["user_card_teams"],
        "missions": []
    })
})

app.get("/user_areas", function (req, res) {
    var eventsjson = miscfunctions.parsejson("local/events.json");
    var user_areas = {
        "user_areas": [],
        "user_z_battles": []
    };
    var db = new sqlite3.Database('database.db', (err) => {
        if (err) {
            error("database does not exist in 'public' folder");
        } else {
            db.run("PRAGMA key='9bf9c6ed9d537c399a6c4513e92ab24717e1a488381e3338593abd923fc8a13b'");
            db.run("PRAGMA cipher_compatibility = 3");

            var quests = new Promise((resolve) => {
                db.all("select sugoroku_maps.id as sugoroku_map_id, sugoroku_maps.difficulty as difficulty, quests.id as questid, areas.id as areaid from quests join areas on quests.area_id = areas.id join sugoroku_maps on quests.id = sugoroku_maps.quest_id", (err, rows) => {
                    resolve(rows);
                });
            });

            quests.then((rows) => {
                eventsjson["events"].forEach((ev, index, array) => {
                    console.log(rows);
                    var sugorokus = rows.filter(dict => dict["areaid"] === ev["id"]);
                    var currentarea = {
                        "area_id": ev["id"],
                        "is_cleared_normal": true,
                        "is_cleared_hard": true,
                        "is_cleared_very_hard": true,
                        "is_cleared_super_hard1": true,
                        "is_cleared_super_hard2": true,
                        "is_cleared_super_hard3": true,
                        "user_sugoroku_maps": []
                    };
                    sugorokus.forEach((dict) => {
                        currentarea.user_sugoroku_maps.push({
                            "sugoroku_map_id": dict["sugoroku_map_id"],
                            "visited_count": 1,
                            "cleared_count": 1,
                            "challenge_label": null
                        });
                    });
                    user_areas.user_areas.push(currentarea);
                    if (index === array.length - 1) {
                        res.send(user_areas);
                    }
                });
            });

            db.close();
        }
    });
});


app.get("/events", function (req, res) {
    res.send(miscfunctions.parsejson(`local/events.json`))
})

app.get("/quests/:eventid/briefing", function (req, res) {
    var eventid = req.params["eventid"]
    // var briefingjson = JSON.parse(fs.readFileSync(path.join("local", "quests", "403001", "briefing.json")))
    var login = miscfunctions.parsejson(`local/resources/login.json`)
    console.log(`selected team: ${req.query["team_num"]}`)

    if (login["teams"]["user_card_teams"][Number(req.query["team_num"]) - 1]["user_card_ids"][0]) { // if team leader exists
        var teamleader = login["cards"].filter((Card) => Card["card_id"] === login["teams"]["user_card_teams"][Number(req.query["team_num"]) - 1]["user_card_ids"][0])[0]
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

app.post("/quests/:eventid/sugoroku_maps/start", function (req, res) {
    var startjson = miscfunctions.parsejson(`local/quests/955003/sugoroku_maps/start.json`)
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

app.post("/quests/:eventid/sugoroku_maps/continue_info", function (req, res) {
    res.send({})
})

app.post("/quests/:eventid/sugoroku_maps/continue", function (req, res) {
    res.send({})
})

app.post("/quests/:eventid/sugoroku_maps/finish", function (req, res) {
    console.log(req.body)
    var finishjson = miscfunctions.parsejson(`local/quests/403001/sugoroku_maps/finish.json`)
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

app.get("/user_cards/:cardid/potentials", function (req, res) {
    var cardid = req.params["cardid"];
    if (fs.existsSync(`local/user_cards/${cardid}/potentials.json`)) {
        console.log("that exists")
        res.send(JSON.parse(fs.readFileSync(`local/user_cards/${cardid}/potentials.json`)));
    } else {
        master = { "user_card_potential_squares": [] };
        var loginjson = parsejson("local/resources/login.json");
        var cardjson = loginjson["cards"].filter(row => row["card_id"] === cardid)[0];

        if (cardjson) {
            var db = new sqlite3.Database('database.db', function (err) {
                if (err) {
                    error(`database does not exist in "public" folder`);
                } else {
                    db.run("PRAGMA key='9bf9c6ed9d537c399a6c4513e92ab24717e1a488381e3338593abd923fc8a13b'");
                    db.run("PRAGMA cipher_compatibility = 3");
                    db.all(`select potential_squares.id as potential_squares_id, potential_squares.route,potential_events.id as potential_events_id, potential_events.type, potential_events.currency_id, potential_events.additional_value, potential_squares.potential_board_id,potential_boards.comment
            from potential_squares
            join potential_events on potential_squares.event_id = potential_events.id
            join potential_boards on potential_squares.potential_board_id = potential_boards.id;`, function (err, rows) {
                        if (err) {
                            // Handle the error
                            console.error(err);
                            res.status(500).send("Internal Server Error");
                            return;
                        }

                        var potential_routes_ids = rows.filter(row => row["potential_board_id"] === cardjson["potential_board_id"] && row["route"] != null)
                            .map(dict => dict["potential_squares_id"]);

                        potential_routes_ids.forEach(function (value) {
                            if (!master["user_card_potential_squares"].find(r => r["potential_square_id"] === value)) {
                                master["user_card_potential_squares"].push({
                                    "potential_square_id": value,
                                    "status": 1,
                                    "event_selection_id": null
                                });
                            }
                        });
                        console.log("amek that file")
                        miscfunctions.WriteFileSyncRecursive(`local/user_cards/${cardid}/potentials.json`, JSON.stringify(master, null, 4));
                        res.send(master);
                    });
                }
            });
        } else {
            // Handle the case when cardjson is undefined
            res.status(404).send("Card not found");
        }
    }
});


app.post("/user_cards/:cardid/potentials/release", function (req, res) {
    var cardid = Number(req.params["cardid"])
    console.log(cardid);
    var loginjson = JSON.parse(fs.readFileSync(`local/resources/login.json`))
    // var
    var potential_squares = req.body["potential_squares"]
    var master = fs.existsSync(`local/user_cards/${cardid}/potentials/release.json`) ? JSON.parse(fs.readFileSync(`local/user_cards/${cardid}/potentials/release.json`)) : {
        "card": {},
        "user_card_potential_squares": JSON.parse(fs.readFileSync(`local/user_cards/${cardid}/potentials.json`))["user_card_potential_squares"],
        "user_card_potential_parameters": [],
        "user_potential_items": [],
        "missions": []
    }
    var cardjson = loginjson["cards"].filter(row => row["card_id"] === cardid)[0]

    var db = new sqlite3.Database('database.db', async function (err) {
        if (err) {
            error(`database does not exist in "public" folder`)
        } else {
            db.run("PRAGMA key='9bf9c6ed9d537c399a6c4513e92ab24717e1a488381e3338593abd923fc8a13b'")
            db.run("PRAGMA cipher_compatibility = 3")

            const potential_selections = await new Promise(function (Resolve, Reject) {
                db.all(`select potential_event_selections.id, potential_events.type,  potential_skills.name, potential_events.currency_id, potential_events.additional_value
                from potential_event_selections
                join potential_events on potential_event_selections.event_id = potential_events.id
                join potential_skills on potential_events.currency_id = potential_skills.id;`, function (err, rows) {
                    if (err) {
                        Reject(err)
                    } else {
                        Resolve(rows)
                    }
                })
            })
            // console.log(potential_selections);

            const db_potential_squares = await new Promise(function (Resolve) {
                db.all(`select potential_squares.id as potential_squares_id, potential_squares.route,potential_events.id as potential_events_id, potential_events.type, potential_events.currency_id, potential_events.additional_value, potential_squares.potential_board_id,potential_boards.comment
                    from potential_squares
                    join potential_events on potential_squares.event_id = potential_events.id
                    join potential_boards on potential_squares.potential_board_id = potential_boards.id;`, function (err, rows) {
                    Resolve(rows)
                })
            })

            var potential_routes_ids = db_potential_squares.filter(row => row["potential_board_id"] === cardjson["potential_board_id"] && row["route"] != null).map(dict => dict["potential_squares_id"])

            for (let index = 0; index < potential_squares.length; index++) {
                const potential_square_id = potential_squares[index]["potential_square_id"];
                const event_selection_id = potential_squares[index]["event_selection_id"]
                if (potential_routes_ids.includes(potential_square_id)) {
                    cardjson["unlocked_square_statuses"][potential_routes_ids.indexOf(potential_square_id)] = 0
                }
                var potentialrow
                if (event_selection_id) {
                    var row = potential_selections.find(dict => dict["id"] === event_selection_id)
                    row["potential_squares_id"] = potential_square_id
                    console.log(row)
                    potentialrow = row
                } else {
                    potentialrow = db_potential_squares.filter(dict => dict["potential_squares_id"] === potential_square_id)[0]
                }
                var type = potentialrow["type"].substring(potentialrow["type"].lastIndexOf(":") + 1)

                var ExistingPotentialSquare = master["user_card_potential_squares"].find(row => row["potential_square_id"] === potential_square_id)
                if (!ExistingPotentialSquare) {
                    master["user_card_potential_squares"].push({
                        "potential_square_id": potential_square_id,
                        "status": 0,
                        "event_selection_id": event_selection_id
                    })
                } else {
                    ExistingPotentialSquare["status"] = 0
                }
                var ExistingPotentialParameter = cardjson["potential_parameters"].find(dict => dict["parameter_type"] === type && dict["parameter_id"] === potentialrow["currency_id"])
                if (ExistingPotentialParameter) {
                    ExistingPotentialParameter["total_value"] = ExistingPotentialParameter["total_value"] + potentialrow["additional_value"]
                } else {
                    var pushfor = {
                        "parameter_type": type,
                        "parameter_id": potentialrow["currency_id"],
                        "total_value": potentialrow["additional_value"]
                    }
                    cardjson["potential_parameters"].push(pushfor)
                    // console.log(cardjson["potential_parameters"]);
                }
                // }
                if (index === potential_squares.length - 1) {
                    master["card"] = cardjson
                    master["user_card_potential_parameters"] = cardjson["potential_parameters"]
                    res.send(master)
                    fs.writeFileSync(`local/resources/login.json`, JSON.stringify(loginjson, null, 4))
                    fs.writeFileSync(`local/user_cards/${cardid}/potentials/release.json`, JSON.stringify(master, null, 4))
                    fs.writeFileSync(`local/user_cards/${cardid}/potentials.json`, JSON.stringify({
                        "user_card_potential_squares": master["user_card_potential_squares"]
                    }, null, 4))
                }
            }

        }
    })

})

app.post("/user_cards/:cardid/potentials/:nodeid/unrelease", function (req, res) {
    res.send({
        "card": {
            "id": 1615903547,
            "card_id": 1022771,
            "exp": 5000000,
            "skill_lv": 10,
            "is_favorite": true,
            "awakening_route_id": null,
            "is_released_potential": true,
            "released_rate": 74.25149700598801,
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
            "updated_at": 1674345742,
            "created_at": 1674254241,
            "potential_parameters": [
                {
                    "parameter_type": "Atk",
                    "parameter_id": null,
                    "total_value": 2645
                },
                {
                    "parameter_type": "Defense",
                    "parameter_id": null,
                    "total_value": 2700
                },
                {
                    "parameter_type": "Hp",
                    "parameter_id": null,
                    "total_value": 2950
                },
                {
                    "parameter_type": "Skill",
                    "parameter_id": 6,
                    "total_value": 7
                },
                {
                    "parameter_type": "Skill",
                    "parameter_id": 1,
                    "total_value": 5
                },
                {
                    "parameter_type": "Skill",
                    "parameter_id": 4,
                    "total_value": 13
                },
                {
                    "parameter_type": "Skill",
                    "parameter_id": 7,
                    "total_value": 8
                },
                {
                    "parameter_type": "Skill",
                    "parameter_id": 5,
                    "total_value": 13
                },
                {
                    "parameter_type": "Skill",
                    "parameter_id": 2,
                    "total_value": 6
                }
            ],
            "equipment_skill_items": [
                {
                    "grade": "gold",
                    "slot": 0,
                    "equipment_skill_item_id": 1207
                }
            ],
            "link_skill_lvs": [
                {
                    "id": 23,
                    "skill_lv": 10
                },
                {
                    "id": 30,
                    "skill_lv": 10
                },
                {
                    "id": 34,
                    "skill_lv": 10
                },
                {
                    "id": 45,
                    "skill_lv": 10
                },
                {
                    "id": 47,
                    "skill_lv": 10
                },
                {
                    "id": 118,
                    "skill_lv": 9
                }
            ]
        },
        "user_card_potential_parameter": {
            "parameter_type": "Skill",
            "parameter_id": 1,
            "total_value": 5
        },
        "user": {
            "zeni": 233905321,
            "gasha_point": 92750,
            "exchange_point": 5000,
            "stone": 4378
        }
    })
})

app.post("/cards/:cardid/equip", function (req, res) {
    var cardid = Number(req.params["cardid"])
    var body = req.body
    console.log(body);
    var loginjson = JSON.parse(fs.readFileSync(`local/resources/login.json`))
    // loginjson["cards"]
    var Card = loginjson["cards"].find(dict => dict["card_id"] == cardid)
    var CardEquipmentCondition = Card["equipment_skill_items"].find(dict => dict["grade"] == body["grade"])
    if (CardEquipmentCondition) {
        CardEquipmentCondition = body
    } else {
        Card["equipment_skill_items"].push(body)
    }
    console.log(Card["equipment_skill_items"]);
    var ads = {
        "card": Card,
        "equipment_skill_items": loginjson["equipment_skill_items"]
    }
    // console.log(ads);
    res.send(ads)
    fs.writeFileSync(`local/resources/login.json`, JSON.stringify(loginjson, null, 4))
})

app.all("*", function (req, res) {
    console.log(`${req.method} ${req.path} does not exist`)
    if (req.method === "POST") {
        console.log(req.body)
    }
    res.send({})
})
