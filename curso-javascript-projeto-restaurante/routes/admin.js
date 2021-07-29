var conn = require('./../inc/db')
var express = require('express');
var router = express.Router();
var users = require('./../inc/users');
var contacts = require('./../inc/contact');
var emails = require('./../inc/emails');
const admin = require('../inc/admin');
var getDataHelper = require('./../inc/getDataHelper')
var reservations = require('./../inc/reservations')
var Pagination = require('./../inc/pagination')
var moment = require('moment')




module.exports = (io) => {

    moment.locale("pt-br")

    router.use(function (req, res, next) {

        if (req.url !== '/login' && !req.session.user) {

            console.log(req.session.user, req.url, (req.url !== '/login'))



            res.redirect("/admin/login")
        } else {

            next()

        }
        // console.log("Middleware:", req.url)
        // console.log(['/login'].indexOf(req.url), !req.session.user)

        // console.log(['/login'].indexOf(req.url), !req.session.user, req.url)
    })

    router.use(function (req, res, next) {

        req.menus = admin.getMenus(req)

        next()

    })

    router.get('/logout', function (req, res, next) {


        delete req.session.user

        res.redirect("/admin/login")

        console.log(req.session.user)



    });

    router.get('/', function (req, res, next) {

        admin.dashboard().then(data => {

            res.render("admin/index", admin.getParams(req, {

                data

            }))

            console.log(data)
        }).catch(err => {

            console.error(err)

        })


    });

    router.get('/dashboard', function (req, res, next) {

        reservations.dashboard().then(data => {

            res.send(data)

        })

    });


    router.post('/login', function (req, res, next) {

        console.log(res)

        if (!req.body.email) {
            users.render(req, res, "Preencha o campo e-mail")
        } else if (!req.body.password) {

            users.render(req, res, "Preencha o campo senha")

        } else {

            users.login(req.body.email, req.body.password).then(user => {

                req.session.user = user

                res.redirect("/admin")

            }).catch(err => {

                users.render(req, res, err.message)

            })

        }



    });

    router.get('/login', function (req, res, next) {



        users.render(req, res, null)
    });

    router.get('/contacts', function (req, res, next) {

        contacts.getContacts().then(data => {

            res.render("admin/contacts", admin.getParams(req, {

                data

            }))

            console.log(data)


        }).catch(err => {

            console.log(data)

        })


    });

    router.delete('/contacts/:id', function (req, res, next) {

        contacts.delete(req.params.id, io).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })

    });

    router.get('/emails', function (req, res, next) {

        emails.getEmails().then(data => {

            res.render("admin/emails", admin.getParams(req, {

                data

            }))

            console.log(data)


        }).catch(err => {

            console.log(data)

        })


    });

    router.post('/emails', (req, res, next) => {

        emails.save(req.fields, req.files).then(results => {

            res.send(results)

        }).catch(err => {

            res.send(err)

        })


    })

    router.delete('/emails/:id', function (req, res, next) {

        emails.delete(req.params.id).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })

    });




    router.get('/menus', function (req, res, next) {

        getDataHelper.getMenus().then(data => {

            res.render("admin/menus", admin.getParams(req, {

                data

            }))

            console.log(data)


        }).catch(err => {

            console.log(data)

        })


    });

    router.post('/menus', (req, res, next) => {

        getDataHelper.save(req.fields, req.files).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })


    })

    router.delete('/menus/:id', (req, res, next) => {

        getDataHelper.delete(req.params.id).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })

    })

    router.get('/reservations', function (req, res, next) {

        let start = (req.query.start) ? req.query.start : moment().subtract(1, "year").format("YYYY-MM-DD")
        let end = (req.query.end) ? req.query.end : moment().format("YYYY-MM-DD")

        reservations.getReservations(req
        ).then(pag => {

            res.render("admin/reservations", admin.getParams(req, {

                date: {
                    start,
                    end,
                },
                data: pag.data,
                moment,
                links: pag.links

            }))




        }).catch(err => {

            console.log(err)

        })
    });

    router.post('/reservations', (req, res, next) => {

        reservations.save(req.fields, req.files).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })


    })

    router.delete('/reservations/:id', (req, res, next) => {

        reservations.delete(req.params.id).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })

    })


    router.get('/users', function (req, res, next) {

        users.getUsers().then(data => {

            res.render("admin/users", admin.getParams(req, {

                data

            }))

            console.log(data)


        }).catch(err => {

            console.log(data)

        })

    });


    router.post('/users', function (req, res, next) {

        users.save(req.fields, req.files).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })

    });

    router.post('/users/password-change', function (req, res, next) {

        users.changePassword(req).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })

    });


    router.delete('/users/:id', function (req, res, next) {

        users.delete(req.params.id).then(results => {

            res.send(results)
            io.emit('dashboard update')

        }).catch(err => {

            res.send(err)

        })

    });

    router.get('/reservations/chart', (req, res, next) => {

        req.query.start = (req.query.start) ? req.query.start : moment().subtract(1, "year").format("YYYY-MM-DD")
        req.query.end = (req.query.end) ? req.query.end : moment().format("YYYY-MM-DD")

        reservations.chart(req).then(chartData => {

            res.send(chartData)

        })

    })




    return router

}