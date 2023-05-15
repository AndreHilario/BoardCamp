import { db } from "../database/database.js";

export async function getGames(req, res) {

    const { name, order, desc } = req.query;

    try {
        let queryString = `SELECT * FROM games`;

        const filters = [];
        const params = [];

        if (name) {
            filters.push(`name ILIKE $${filters.length + 1}`);
            params.push(`${name}%`);
        }

        if (filters.length > 0) {
            queryString += ` WHERE ${filters.join(' AND ')}`;
        }

        if (order) {
            queryString += ` ORDER BY "${order}"`;
            if (desc && desc.toLowerCase() === "true") {
                queryString += ` DESC`;
            }
        }

        if (limit) {
            queryString += ` LIMIT ${limit}`;
        }

        if (offset) {
            queryString += ` OFFSET ${offset}`;
        }

        const games = await db.query(queryString, params);


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