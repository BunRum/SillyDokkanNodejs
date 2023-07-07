var fs = require("fs")
const path = require('path')
// var sqlite3 = require('@journeyapps/sqlcipher').verbose();


// var db = new sqlite3.Database('public/database.db', (err) => {
//     if (err) {
//         error(`database does not exist in "public" folder`)
//     }
// });

var Gencards = function GenCards() {
    db.run("PRAGMA key='9bf9c6ed9d537c399a6c4513e92ab24717e1a488381e3338593abd923fc8a13b'")
    db.run("PRAGMA cipher_compatibility = 3")
    loginjson = JSON.parse(fs.readFileSync("local/resources/login.json"))
    loginjson["cards"] = []
    loginjson["user_card_id_updates"] = {}
    db.all(fs.readFileSync("local/cards.sql").toString(), (err, rows) => {
        if (err) throw err
        let cardsjson = []
        let cardupdatesjson = {}

        var filteredcards = rows.filter(card => card["potential_board_id"] != null)

        // fs.writeFileSync("local/this.json", JSON.stringify(allcards, null, 4))
        var maxamount = filteredcards.length
        // console.log(maxamount)
        const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar1.start(maxamount - 1, 0);
        for (var i = 0; i < maxamount; i++) {
            // console.log(`${i + 1}/${maxamount}`)
            let curcard = filteredcards[i]
            var linkskills  = [curcard["link_skill1_id"], curcard["link_skill2_id"], curcard["link_skill3_id"], curcard["link_skill4_id"], curcard["link_skill5_id"], curcard["link_skill6_id"], curcard["link_skill7_id"]].filter(link => link != null)
            cardupdatesjson[curcard["id"].toString()] = Number(curcard["updated_at"])
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
                "unlocked_square_statuses": [0, 0, 0, 0],
                "updated_at": Number(curcard["updated_at"]),
                "created_at": Number(curcard["created_at"]),
                "potential_parameters": [],
                "equipment_skill_items": [],
                "link_skill_lvs": []
            }
            linkskills.forEach((link) => {
                card.link_skill_lvs.push({
                    "id": link,
                    "skill_lv": 10
                })
            })
            cardsjson.push(card)
            bar1.update(i)
            if (i == maxamount - 1) {
                bar1.stop()
                loginjson["cards"] = cardsjson
                loginjson["user_card_id_updates"] = cardupdatesjson
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
                }
                fs.writeFileSync("local/resources/login.json", JSON.stringify(loginjson, null, 4))
                successmessage("cards have been generated.")
            }
        }
    })
}

var executesql = function executesql(sql) {
    db.run("PRAGMA key='9bf9c6ed9d537c399a6c4513e92ab24717e1a488381e3338593abd923fc8a13b'")
    db.run("PRAGMA cipher_compatibility = 3")
    db.exec(sql, (err) => {
        if (err) {
            error(err)
        } else {
            successmessage("sql has been successfully executed.")

            parsedData = JSON.parse(fs.readFileSync(path.join("local", "versions.json")))
            parsedData["database"]++
            // console.log()
            fs.writeFileSync(path.join("local", "versions.json"), JSON.stringify(parsedData, null, 3))
            Gencards()
        }
    })
}

module.exports = {
    Gencards: Gencards,
    executesql: executesql
}