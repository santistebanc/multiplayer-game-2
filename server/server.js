const express = require('express')
const http = require('http')
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const app = express()
const server = http.createServer(app)
const port = 1444
const Game = require('./game').default

new Game(server);

app.use(cors())
app.use(compression())

app.use('/', express.static(path.join(__dirname, '../dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

server.listen(port, () => {
  console.log('Express is listening on http://localhost:' + port)
})
