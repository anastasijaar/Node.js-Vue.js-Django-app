const express = require('express');
const mysql = require('mysql');
const Joi = require('joi');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    //password: 'password',
    database: 'librarydb'
});

// Sema za validaciju
const sema = Joi.object().keys({
    Name: Joi.string().trim().min(4).max(25).required(),
    Country: Joi.string().trim().min(2).max(25).required(),
    Title: Joi.string().max(512).required()
});

const rtr = express.Router();
rtr.use(express.json());

const readAllBooks = (req, res) => {

    pool.query('select * from library', (err, rows) => {
        if(err)
            res.status(500).send(err.sqlMessage);
        else
            res.send(rows);
    });
}

const createNewRow = (req, res) => {

    // Validiramo podatke koje smo dobili od korisnika
    let { error } = Joi.validate(req.body, sema);
    console.log(req.body);
    console.log(error);
    // Ako su podaci neispravni prijavimo gresku
    if (error)
        res.status(400).send(error.details[0].message);  // Greska zahteva
    else {
        let query = "insert into library (Name, Country, Title) values (?, ?, ?)";
        let formated = mysql.format(query, [req.body.Name, req.body.Country, req.body.Title]);

        // Izvrsimo query
        pool.query(formated, (err, response) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else {
                // Ako nema greske dohvatimo kreirani objekat iz baze i posaljemo ga korisniku
                query = 'select * from library where Id=?';
                formated = mysql.format(query, [response.insertId]);

                pool.query(formated, (err, rows) => {
                    if (err)
                        res.status(500).send(err.sqlMessage);
                    else
                        res.send(rows[0]);
                });
            }
        });
    }
}

const readOneBookByID = (req, res) => {
    let query = 'select * from library where Id=?';
    let formated = mysql.format(query, [req.params.id]);

    pool.query(formated, (err, rows) => {
        if (err)
            res.status(500).send(err.sqlMessage);
        else
            res.send(rows[0]);
    });
}

const updateOneRow = (req, res) => {
    let { error } = Joi.validate(req.body, sema);
    console.log(req.body);
    console.log(error);
    if (error)
        res.status(400).send(error.details[0].message);
    else {
        let query = "update library set Name=?, Country=?, Title=? where Id=?";
        let formated = mysql.format(query, [req.body.Name, req.body.Country, req.body.Title, req.params.id]);

        pool.query(formated, (err, response) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else {
                query = 'select * from library where Id=?';
                formated = mysql.format(query, [req.params.id]);

                pool.query(formated, (err, rows) => {
                    if (err)
                        res.status(500).send(err.sqlMessage);
                    else
                        res.send(rows[0]);
                });
            }
        });
    }

}

const deleteOneRow = (req, res) => {
    let query = 'select * from library where Id=?';
    let formated = mysql.format(query, [req.params.id]);

    pool.query(formated, (err, rows) => {
        if (err)
            res.status(500).send(err.sqlMessage);
        else {
            query = 'delete from library where Id=?';
            formated = mysql.format(query, [req.params.id]);

            pool.query(formated, (err, resp) => {
                if (err)
                    res.status(500).send(err.sqlMessage);
                else
                    res.send(rows[0]);
            });
        }
    });
}

//prikaz svih knjiga
rtr.get('/library', readAllBooks);

//cuvanje novog imena izdavaca, zemlje iz koje je i naziva knjige
rtr.post('/library', createNewRow);

// Prikaz pojedinacne knjige
rtr.get('/book/:id', readOneBookByID);

// Izmena knjige (vraca korisniku ceo red iz baze)
rtr.put('/book/:id', updateOneRow);

// Brisanje poruke (vraca korisniku ceo red iz baze)
rtr.delete('/book/:id', deleteOneRow);

module.exports = rtr;