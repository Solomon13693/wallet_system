const app = require('./app')

const port = process.env.PORT || 8000

app.listen(port, () => console.log(`Wallet system listening on port ${port}!`))