const express = require('express');
const request = require('request');
const { config } = require('dotenv');

const app = express();

const port = parseInt(process.env.FRONT_END_PORT);
const restApiUrl = process.env.URL;

app.get('/', function(req, res) {
    request(
        restApiUrl, {
            method: "GET",
        },
        function(err, resp, body) {
            if (!err && resp.statusCode === 200) {
                var objData = JSON.parse(body);
                var c_cap = objData.data;
                var responseString = `
                    <style>
                        table {
                            border-collapse: collapse;
                            width: 50%;
                            margin: auto; /* Center-align the table */
                        }
                        th, td {
                            padding: 10px;
                            text-align: left;
                            border: 1px solid #ddd;
                        }
                        th {
                            background-color: #f2f2f2; /* Grey background for headers */
                        }
                    </style>
                    <table>
                        <tr>
                            <th>Movie</th>
                            <th>Actor</th>
                        </tr>`;

                for (var i = 0; i < c_cap.length; i++)
                    responseString += `
                        <tr>
                            <td>${c_cap[i].movie}</td>
                            <td>${c_cap[i].hero}</td>
                        </tr>`;

                responseString += `</table>`;
                res.send(responseString);
            } else {
                console.log(err);
            }
        });
});

app.listen(port, () => console.log(`Frontend app listening on port ${port}!`))
