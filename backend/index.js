const express = require("express");
const { Pool, Client } = require("pg");
const app = express();
const port = 3001;

const pool = new Pool({
  connectionString: "postgres://admin:zxPaZx2LvYu@127.0.0.0:3306/movie_database",
});

app.get("/data", function (req, res) {
  pool.query("SELECT movie, hero from movie_hero", [], (err, result) => {
    if (err) {
      return res.status(405).jsonp({
        error: err,
      });
    }

    return res.status(200).jsonp({
      data: result.rows,
    });
  });
});

app.listen(port, () =>
  console.log(`Backend rest api listening on port ${port}!`)
);
