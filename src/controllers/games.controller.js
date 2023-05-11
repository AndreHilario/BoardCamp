import { db } from "../database/database.js";

export async function getGames(req, res) {

    const { query, order, desc } = req.query;

    try {
        let games;

        if (query && order) {
            games = await db.query(`SELECT * FROM games WHERE name ILIKE $1 ORDEY BY $2;`, [`${query}%`, order]);
        } else if (query && order && desc) {
            games = await db.query(`SELECT * FROM games WHERE name ILIKE $1 ORDEY BY $2 DESC;`, [`${query}%`, order]);
        } else if (query) {
            games = await db.query(`SELECT * FROM games WHERE name ILIKE $1;`, [`${query}%`]);
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