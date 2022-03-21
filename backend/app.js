//initial server and db
var config = require('./app/helpers/config')
var r = require('rethinkdb')
var express = require('express')
var app = express()

var server = require('http').createServer(app)
var io = require('socket.io')(server)

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var connection;

//connect rethink with socket io
r.connect(config, (err, conn) => {
    if (err) throw err
    connection = conn

    r.db('databse_noval').table('list_employee')
        .changes()
        .run(connection, (err, cursor) => {
            if (err) throw err
            io.sockets.on('connection', (socket) => {
                cursor.each((err, row) => {
                    if (err) throw err
                    io.sockets.emit('employee_update', row)
                })
            })
        })
})

app.get('/', (req, res) => {
    res.send(config)
})

server.listen(5000)