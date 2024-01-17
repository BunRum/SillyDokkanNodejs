var fs = require("fs")
var sqlite3 = require('@journeyapps/sqlcipher').verbose();

var db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error("database failure")
    }
});

var refresh = function refresh() {
    return new Promise((resolve, reject) => {
        db.run("PRAGMA key='9bf9c6ed9d537c399a6c4513e92ab24717e1a488381e3338593abd923fc8a13b'");
        db.run("PRAGMA cipher_compatibility = 3");
        var loginjson = JSON.parse(fs.readFileSync(`local/resources/login.json`));
        loginjson["potential_items"] = { "user_potential_items": [] };
        loginjson["support_items"] = { "items": [] };
        loginjson["support_films"] = [
            {
                "support_film_id": 1,
                "quantity": 9999
            },
            {
                "support_film_id": 2,
                "quantity": 9999
            },
            {
                "support_film_id": 3,
                "quantity": 9999
            },
            {
                "support_film_id": 4,
                "quantity": 9999
            },
            {
                "support_film_id": 5,
                "quantity": 9999
            }
        ];
        loginjson["support_film_max_quantity"] = 10000;
        loginjson["support_memories"] = [];
        loginjson["cards"] = [];
        loginjson["user_card_id_updates"] = {};
        loginjson["equipment_skill_items"] = [];
        loginjson["missions_data"] = {
            "missions": [],
            "mission_categories": [],
            "comeback": {
                "day": null,
                "mission_ids": [],
                "mission_end_at": null,
                "is_boost": false,
                "end_at": null
            },
            "eventkagi_area_ids": [],
            "eventkagi_z_battle_stage_ids": [],
            "daily_refresh_at": 1672185600,
            "processed_at": 1672114258
        };

        const processMissions = new Promise((resolve) => {
            db.all("select * from missions", function (err, rows) {

                for (let index = 0; index < rows.length; index++) {
                    const row = rows[index];
                    loginjson["missions_data"]["missions"].push({
                        "id": row["id"],
                        "current_value": row["target_value"],
                        "mission_id": row["id"],
                        "completed_at": 1672048976,
                        "accepted_reward_at": 1672049067
                    });

                    if (index === rows.length - 1) {
                        resolve();
                    }
                }
            });
        });

        const processEquipmentSkillItems = new Promise((resolve) => {
            db.all("select id from equipment_skill_items", function (err, rows) {

                for (let index = 0; index < rows.length; index++) {
                    const id = rows[index]["id"];
                    loginjson["equipment_skill_items"].push({
                        "equipment_skill_item_id": id,
                        "quantity": 9999
                    });

                    if (index === rows.length - 1) {
                        resolve();
                    }
                }
            });
        });

        const processPotentialItems = new Promise((resolve) => {
            db.all("select id from potential_items", function (err, rows) {
                if (err) {
                    console.log(err)
                }
                for (let index = 0; index < rows.length; index++) {
                    const id = rows[index]["id"];
                    loginjson["potential_items"]["user_potential_items"].push({
                        "potential_item_id": id,
                        "quantity": 9999
                    });

                    if (index === rows.length - 1) {
                        resolve();
                    }
                }
            });
        });

        const processSupportItems = new Promise((resolve) => {
            db.all("select id from support_items", function (err, rows) {

                for (let index = 0; index < rows.length; index++) {
                    const id = rows[index]["id"];
                    loginjson["support_items"]["items"].push({
                        "item_id": id,
                        "quantity": 777
                    });

                    if (index === rows.length - 1) {
                        resolve();
                    }
                }
            });
        });

        const processSupportMemories = new Promise((resolve) => {
            db.all("select id from support_memories", function (err, rows) {
                for (let index = 0; index < rows.length; index++) {
                    const id = rows[index]["id"];
                    loginjson["support_memories"].push({
                        "support_memory_id": id,
                        "quantity": 777
                    });

                    if (index === rows.length - 1) {
                        resolve();
                    }
                }
            });
        });

        const processCards = new Promise((resolve, reject) => {
            db.all(fs.readFileSync("local/cards.sql").toString(), (err, rows) => {
                if (err) reject(err);
                let cardsjson = [];
                let cardupdatesjson = {};

                var filteredcards = rows.filter(card => card["potential_board_id"] != null);

                var maxamount = filteredcards.length;

                for (var i = 0; i < maxamount; i++) {
                    let curcard = filteredcards[i];
                    var linkskills = [curcard["link_skill1_id"], curcard["link_skill2_id"], curcard["link_skill3_id"], curcard["link_skill4_id"], curcard["link_skill5_id"], curcard["link_skill6_id"], curcard["link_skill7_id"]].filter(link => link != null);
                    cardupdatesjson[curcard["id"].toString()] = Number(curcard["updated_at"]);
                    var card = {
                        "id": curcard["id"],
                        "card_id": curcard["id"],
                        "exp": 30000000,
                        "skill_lv": curcard["True_skill_lv"],
                        "is_favorite": true,
                        "awakening_route_id": null,
                        "is_released_potential": true,
                        "released_rate": 100.0,
                        "optimal_awakening_step": curcard["optimal_awakening_step"],
                        "card_decoration_id": curcard["card_deco_id"],
                        "exchangeable_item_id": null,
                        "awakenings": [],
                        "unlocked_square_statuses": [1, 1, 1, 1],
                        "updated_at": Number(curcard["updated_at"]),
                        "created_at": Number(curcard["created_at"]),
                        "potential_parameters": [],
                        "equipment_skill_items": [],
                        "link_skill_lvs": [],
                        "potential_board_id": curcard["potential_board_id"]
                    };
                    linkskills.forEach((link) => {
                        card.link_skill_lvs.push({
                            "id": link,
                            "skill_lv": 10
                        });
                    });
                    cardsjson.push(card);
                    if (i === maxamount - 1) {
                        loginjson["cards"] = cardsjson;
                        loginjson["user_card_id_updates"] = cardupdatesjson;
                        loginjson["teams"] = {
                            "user_card_teams": [
                                {
                                    "num": 1,
                                    "name": null,
                                    "team_bgm_filename": null,
                                    "user_card_ids": [
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0
                                    ]
                                }
                            ],
                            "selected_team_num": 1
                        };
                        fs.writeFileSync("local/resources/login.json", JSON.stringify(loginjson, null, 4));
                        resolve();
                    }
                }
            });
        });

        Promise.all([
            processMissions,
            processEquipmentSkillItems,
            processPotentialItems,
            processSupportItems,
            processSupportMemories,
            processCards
        ])
            .then(() => {
                resolve(loginjson);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

refresh().then((v) => {
    console.log("done")
})