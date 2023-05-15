import dayjs from "dayjs";
import { db } from "../database/database.js";

export async function getRentals(req, res) {

    const { customerId, gameId, order, desc, status, startDate } = req.query;

    try {

        let queryString = `
        SELECT rentals.*, games.id AS "idGame", games.name AS "gameName", customers.id AS "idCustomer", customers.name AS "customerName"
        FROM rentals
        JOIN customers
            ON rentals."customerId" = customers.id  
        JOIN games
            ON rentals."gameId" = games.id
        `;

        const filters = [];

        if (customerId) {
            filters.push(`"customerId"=$${filters.length + 1}`);
        }
        if (gameId) {
            filters.push(`"gameId"=$${filters.length + 1}`);
        }
        if (status === "open") {
            filters.push(`"returnDate" IS NULL`);
        }
        if (status === "closed") {
            filters.push(`"returnDate" IS NOT NULL`);
        }
        if (startDate) {
            filters.push(`"rentDate" >= $${filters.length + 1}`);
        }

        queryString += filters.length > 0 ? ` WHERE ${filters.join(' AND ')}` : '';

        if (order) {
            queryString += ` ORDER BY "${order}"`;
            if (desc && desc.toLowerCase() === "true") {
                queryString += ` DESC`;
            }
        }

        const params = [customerId, gameId, startDate];

        const rental = await db.query(queryString, params.filter(Boolean));

        const formattedRental = rental.rows.map((item) => ({
            id: item.id,
            customerId: item.idCustomer,
            gameId: item.idGame,
            rentDate: item.rentDate,
            daysRented: item.daysRented,
            returnDate: item.returnDate,
            originalPrice: item.originalPrice,
            delayFee: item.delayFee,
            customer: { id: item.idCustomer, name: item.customerName },
            game: { id: item.idGame, name: item.gameName },
        }));

        res.send(formattedRental);

    } catch (err) {
        res.status(500).send(err.message);
    }

}

export async function postRentals(req, res) {

    const { customerId, gameId, daysRented } = req.body;

    const date = dayjs();
    const rentDate = date.format("YYYY-MM-DD");
    const returnDate = null;
    const delayFee = null;

    try {

        const priceDay = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId]);
        const originalPrice = daysRented * (priceDay.rows[0].pricePerDay);

        const rentalQuery = await db.query(`
            INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "returnDate", "originalPrice", "delayFee") 
                SELECT $1, $2, $3, $4, $5, $6, $7
                FROM customers 
                JOIN games ON customers.id = $1 AND games.id = $2
                WHERE games."stockTotal" > (
                    SELECT COUNT(*)
                    FROM rentals
                    WHERE id = $2 AND "returnDate" IS NULL
                );
                `, [customerId, gameId, daysRented, rentDate, returnDate, originalPrice, delayFee]);

        if (rentalQuery.rowCount === 0) return res.sendStatus(400);

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }

}

export async function postRentalsById(req, res) {

    const { id } = req.params;

    const date = dayjs();
    const returnDate = date.format("YYYY-MM-DD");

    if (!id) return res.status(400).send("The id parameter is mandatory");

    try {

        const returnDateQuery = await db.query(`
        SELECT "returnDate" 
        FROM rentals
        WHERE id = $1;
        `,
            [id]);

        if (returnDateQuery.rows.length === 0) return res.sendStatus(404);
        if (returnDateQuery.rows[0].returnDate !== null) return res.sendStatus(400);


        await db.query(`
        UPDATE rentals AS r     
        SET "returnDate" = $1::date, "delayFee" = (
            CASE
            WHEN $1 > (r."rentDate" + r."daysRented" * INTERVAL '1 day') THEN (
                DATE_PART('day', $1::date - (r."rentDate" + r."daysRented" * INTERVAL '1 day')) * (
                  SELECT g."pricePerDay"
                  FROM games AS g
                  WHERE r."gameId" = g.id
                )
              )
                ELSE 0
            END
        )
        WHERE r.id = $2
        ;`, [returnDate, id]);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }

}

export async function deleteRentals(req, res) {

    const { id } = req.params;

    if (!id) return res.status(400).send("The id parameter is mandatory");

    try {

        const existingRental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
        if (existingRental.rows.length === 0) return res.sendStatus(404);

        const finishedRental = await db.query(`SELECT * FROM rentals WHERE id = $1 AND "returnDate" IS NULL;`, [id]);
        if (finishedRental.rowCount > 0) return res.sendStatus(400);

        await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }

}