var conn = require('./db')
const Pagination = require('./pagination')
var moment = require('moment')
const { dashboard } = require('./admin')

module.exports = {

  getReservations(req) {

    return new Promise((s, f) => {

      let page = req.query.page
      let dtstart = req.query.start
      let dtend = req.query.end

      if (!page) {
        page = 1
      }

      let params = []

      if (dtstart && dtend) {
        params.push(dtstart, dtend)
      }

      let pag = new Pagination(

        `
                 SELECT SQL_CALC_FOUND_ROWS *
                  FROM tb_reservations
                 ${(dtstart && dtend) ? 'WHERE date BETWEEN ? AND ?' : ''}
                  ORDER BY name LIMIT ?, ?
        `,

        params


      );

      pag.getPage(page).then(data => {

        s({

          data,
          links: pag.getNavigation(req.query)

        })

      }).catch(err => {

        console.error(err)

      })

    })



  },

  render(req, res, error, success) {

    res.render('reservation', {
      title: 'Restaurante Saboroso',
      background: 'images/img_bg_2.jpg',
      h1: 'Reserve uma mesaaaaa!',
      body: req.body,
      error,
      success
    })

    console.log(error)


  },

  save(fields) {

    return new Promise((s, f) => {

      if (fields.date.indexOf('/') > -1) {
        let date = fields.date.split('/')

        fields.date = `${date[2]}-${date[1]}-${date[0]}`
      }



      let query, params = [fields.name, fields.email, fields.people, fields.date, fields.time]

      if (parseInt(fields.id) > 0) {
        query = `
                UPDATE tb_reservations
                SET
                name =?,
                email =?,
                people =?,
                date= ?,
                time = ?,
                WHERE id = ?
                
                `;

        params.push(fileds.id)

      } else {

        query = `
                INSERT INTO tb_reservations (name, email, people, date, time) VALUES (?, ?, ?, ?, ?)
                `
      }

      conn.query(query, params,

        (err, results) => {

          if (err) {
            f(err)
          }

          s(results)


        }
      )


    })


  },

  delete(id) {

    return new Promise((s, f) => {

      conn.query(`
            DELETE FROM tb_reservations WHERE id = ?
          `, [
        id
      ], (err, results) => {

        if (err) {
          f(err)
        } else {
          s(results)
        }

      })


    })

  },

  chart(req) {

    return new Promise((s, f) => {

      conn.query(`
      SELECT CONCAT(YEAR(date), '-', MONTH(date)) AS date, COUNT(*) AS total, SUM(people) / COUNT(*) AS avg_people FROM tb_reservations WHERE date BETWEEN ? AND ? GROUP BY YEAR(date) DESC, MONTH(date) DESC ORDER BY YEAR(date) DESC, MONTH(date) DESC;
      `, [

        req.query.start,
        req.query.end

      ], (err, results) => {

        if (err) {
          f(err)
        } else {

          let months = []
          let values = []

          results.map(row => {

            months.push(moment(row.date).format('MMM-YYYY'))
            values.push(row.total)

          })

          s({

            months,
            values

          })
        }

      })

    })

  },

  dashboard() {

    return new Promise((s, f) => {


      conn.query(`
      (SELECT COUNT(*) FROM tb_contacts) AS nrcontacts,
      (SELECT COUNT(*) FROM tb_menus) AS nrmenus,
      (SELECT COUNT(*) FROM tb_rteservations) AS nrreservations,
      (SELECT COUNT(*) FROM tb_users) AS nrusers,

  `, (err, results) => {

        if (err) {
          f(err)
        } else {

          s(results[0])

        }

      })


    })

  }


}