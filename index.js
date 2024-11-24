const open = require("open")
const express = require("express")
const ws = require("ws")

const port = 1595
const wss = new ws.WebSocketServer({
    port: port+1
})
const app = express()

app.use("/", express.static(__dirname + "/public"))


app.listen(port, () => {
    console.log("App listening on port " + port)
    open.default(`http://localhost:${port}`)
})

wss.on('connection', function connection(ws) {
    ws.on('error', console.error)

    ws.on("message", function message(data) {
        console.log("recieved: %s", data)
    })

})