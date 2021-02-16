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

const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const userMiddleware = require('../middleware/users.js');

rtr.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
    pool.query(
        `SELECT * FROM users WHERE LOWER(username) = LOWER(${pool.escape(
            req.body.username
        )});`,
        (err, result) => {
            if (result.length) {
                return res.status(409).send({
                    msg: 'This username is already in use!'
                });
            } else {
                // username is available
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).send({
                            msg: err
                        });
                    } else {
                        // has hashed pw => add to database
                        pool.query(
                            `INSERT INTO users (id, username, password, registered) VALUES ('${uuid.v4()}', ${pool.escape(
                                req.body.username
                                //ignorise SQL injection
                            )}, ${pool.escape(hash)}, now())`,
                            (err, result) => {
                                if (err) {
                                    throw err;
                                    return res.status(400).send({
                                        msg: err
                                    });
                                }
                                return res.status(201).send({
                                    msg: 'Registered!'
                                });
                            }
                        );
                    }
                });
            }
        }
    );
});

rtr.post('/login', (req, res, next) => {
    pool.query(
        `SELECT * FROM users WHERE username = ${pool.escape(req.body.username)};`,
        (err, result) => {
            // user does not exists
            if (err) {
                throw err;
                return res.status(400).send({
                    msg: err
                });
            }
            if (!result.length) {
                return res.status(401).send({
                    msg: 'Username or password is incorrect!'
                });
            }
            // check password
            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    // wrong password
                    if (bErr) {
                        throw bErr;
                        return res.status(401).send({
                            msg: 'Username or password is incorrect!'
                        });
                    }
                    if (bResult) {
                        const token = jwt.sign({
                            //informacije koje stavljamo u JWT token
                                username: result[0].username,
                                userId: result[0].id
                            },
                            'SECRETKEY', {
                                expiresIn: '7d'
                            }
                        );
                        pool.query(
                            `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
                        );
                        return res.status(200).send({
                            msg: 'Logged in!',
                            token,
                            user: result[0]
                        });
                    }
                    return res.status(401).send({
                        msg: 'Username or password is incorrect!'
                    });
                }
            );
        }
    );
});

rtr.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData);
    res.send('This is the secret content. Only logged in users can see that!');
});

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