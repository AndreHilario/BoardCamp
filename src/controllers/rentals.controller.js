import dayjs from "dayjs";
import { db } from "../database/database.js";

export async function getRentals(req, res) {

};

export async function postRentals(req, res) {

    const { customerId, gameId, daysRented } = req.body;

    const date = dayjs();
    const rentDate = date.format("YYYY-MM-DD");
    const returnDate = null;
    const delayFee = null;

    try {

        const customerExists = await db.query(`SELECT * FROM customers WHERE id = $1;`, [customerId]);
        if (customerExists.rows.length === 0) return res.sendStatus(400);


        const gameExists = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId]);
        if (gameExists.rows.length === 0) return res.sendStatus(400);


        const priceDay = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId]);
        const originalPrice = daysRented * (priceDay.rows[0].pricePerDay);

        await db.query(`INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "returnDate", "originalPrice", "delayFee") 
            VALUES ($1, $2, $3, $4, $5, $6, $7);
            `, [customerId, gameId, daysRented, rentDate, returnDate, originalPrice, delayFee]);

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }

};

export async function postRentalsById(req, res) {

};

export async function deleteRentals(req, res) {

    const { id } = req.params;

    if (!id) return res.status(400).send("The id parameter is mandatory");

    try {

        const existingRental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
        if (existingRental.rows.length === 0) return res.sendStatus(404);

        const finishedRental = await db.query(`SELECT * FROM rentals WHERE id = $1 AND returnDate IS NULL;`, [id]);
        if (finishedRental.rowCount > 0) return res.sendStatus(400);

        await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }

};