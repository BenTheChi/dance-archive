const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const competitionRouter = require('./routers/competition')
const categoryRouter = require('./routers/category')
const battleRouter = require('./routers/battle')
const seriesRouter = require('./routers/series')
const searchRouter = require('./routers/search')


const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter, competitionRouter, categoryRouter, battleRouter, seriesRouter, searchRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
