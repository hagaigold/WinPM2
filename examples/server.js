const http = require('http')

const port = process.env.PORT || 3000

const app = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    })

    if (req.url.startsWith('/h')) {
        res.write(`Hi :)`)
    }
    else {
        res.write(`Hello, World! [ url: ${req.url}]\n`)
    }

    res.end()
})

app.listen(
    port, 
    () =>  {
        console.log(`Server running at http://localhost:${port}`) 
    }
)
