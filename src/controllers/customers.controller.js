import { db } from "../database/database.js";

export async function getCustomers(req, res) {
    const { cpf, order, desc, limit, offset } = req.query;

    try {
        let queryString = `SELECT * FROM customers`;
        const queryParams = [];

        if (cpf) {
            queryString += ` WHERE cpf LIKE $1`;
            queryParams.push(`${cpf}%`);
        }

        if (order) {
            queryString += ` ORDER BY ${order}`;
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

        const customers = await db.query(queryString, queryParams);


        customers.rows = customers.rows.map(customer => {
            const modifiedCustomer = { ...customer };
            modifiedCustomer.birthday = new Date(modifiedCustomer.birthday).toISOString().split('T')[0];
            return modifiedCustomer;
        });

        res.send(customers.rows);

    } catch (err) {
        res.status(500).send(err.message);
    }
};

export async function getCustomersById(req, res) {

    const { id } = req.params;

    if (!id) return res.status(400).send("The id parameter is mandatory");

    try {

        const customerById = await db.query(`SELECT * FROM customers WHERE id = $1;`, [id]);

        if (customerById.rows.length === 0) return res.sendStatus(404);

        const modifiedCustomer = { ...customerById.rows[0] };
        modifiedCustomer.birthday = new Date(modifiedCustomer.birthday).toISOString().split('T')[0];


        res.send(modifiedCustomer);

    } catch (err) {
        res.status(500).send(err.message);
    }

};

export async function postCustomers(req, res) {

    const { name, phone, cpf, birthday } = req.body;

    try {

        const existingCpf = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf]);

        if (existingCpf.rowCount > 0) return res.status(409).send("CPF already exist");

        await db.query(`INSERT INTO customers ("name", "phone", "cpf", "birthday") VALUES ($1, $2, $3, $4);`, [name, phone, cpf, birthday]);

        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message);
    }

};

export async function editCustomers(req, res) {

    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params;

    if (!id) return res.status(400).send("The id parameter is mandatory");

    try {

        const existingCustomer = await db.query(`SELECT * FROM customers WHERE cpf = $1 AND id <> $2;`, [cpf, id]);
        if (existingCustomer.rowCount > 0) return res.sendStatus(409);


        await db.query(`UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`, [name, phone, cpf, birthday, id]);

        res.sendStatus(200);

    } catch (err) {
        res.status(500).send(err.message);
    }

};