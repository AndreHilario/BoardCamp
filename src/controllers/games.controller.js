import { db } from "../database/database.js";

export async function getGames(req, res) {

    const { name, order, desc } = req.query;

    try {
        let games;
        let queryString = `SELECT * FROM games`;

        if (name) {
            queryString += ` WHERE name ILIKE $1`;
            if (order) {
                queryString += ` ORDER BY ${order}`;
                if (desc && desc.toLowerCase() === "true") {
                    queryString += ` DESC`;
                }
            }
            games = await db.query(queryString, [`${name}%`]);
        } else {
            if (order) {
                queryString += ` ORDER BY ${order}`;
                if (desc && desc.toLowerCase() === "true") {
                    queryString += ` DESC`;
                }
            }
            games = await db.query(queryString);
        }

        res.send(games.rows);

    } catch (err) {
        res.status(500).send(err.message);
    }

};

export async function postGames(req, res) {

    const { name, image, stockTotal, pricePerDay } = req.body;

    try {

        const existingGame = await db.query(`SELECT name FROM games WHERE name = $1;`, [name]);

        if (existingGame.rowCount > 0) return res.status(409).send("Name already exist");


        await db.query(`INSERT INTO games ("name", "image", "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);`, [name, image, stockTotal, pricePerDay]);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }

};