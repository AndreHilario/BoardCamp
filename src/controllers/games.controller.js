import { db } from "../database/database.js";

export async function getGames(req, res) {

    const { name, order, desc } = req.query;

    try {
        let games;

        if (name && order) {
            games = await db.query(`SELECT * FROM games WHERE name ILIKE $1 ORDER BY $2;`, [`${name}%`, order]);
        } else if (name && order && desc) {
            games = await db.query(`SELECT * FROM games WHERE name ILIKE $1 ORDER BY $2 DESC;`, [`${name}%`, order]);
        } else if (name) {
            games = await db.query(`SELECT * FROM games WHERE name ILIKE $1;`, [`${name}%`]);
        } else {
            games = await db.query(`SELECT * FROM games;`);
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