// importing required packages
const http = require('http');
const fs = require('fs');
const mime = require('mime-types');

// Setting port
const PORT = process.env.PORT || 3000;

// Creating a server on 127.0.0.1 to listen
const server = http.createServer( async (req, res) => {

    // setting some variables
    let url = req.url;
    let method = req.method;
    // log the request in console
    console.log("A request was made to 127.0.0.1:" + url);
    // if correct method and url then serve html
    if (method === "GET" && url === "/") {

        res.statusCode = 200;
        let headers = new Map([["Content-Type", "text/html"], ["Access-Control-Allow-Origin", "*"]])
        res.setHeaders(headers)
        res.write(fs.readFileSync('public/index.html'));
        res.end();

    } else if (method === "GET" && url === "/styles.css") {

        res.statusCode = 200;
        let headers = new Map([["Content-Type", "text/css"], ["Access-Control-Allow-Origin", "*"]])
        res.setHeaders(headers)
        res.write(fs.readFileSync('public/styles.css'));
        res.end();

    } else if (method === "GET" && url === "/favicon.ico") {

        res.statusCode = 200;
        let headers = new Map([["Content-Type", "image/png"], ["Access-Control-Allow-Origin", "*"]])
        res.setHeaders(headers)
        res.write(fs.readFileSync('public/favicon.png'));
        res.end();

    } else if (method === "GET" && url === "/api") {
        const auth = btoa("klpilcher35711@gmail.com:MusicOfTheSkiesProject10")
        const response = await fetch("https://opensky-network.org/api/states/all", {
            headers: {
                "Authorization": `Basic ${auth}`
            }
        });
        const data = await response.json();
        res.writeHead(200, { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json"});
        res.write(JSON.stringify(data));
        res.end();
        return;
    } else if (method === "GET") {

        let testUrl = "public" + url;

        if (fs.existsSync(testUrl)) {

            let mimetype = mime.lookup(testUrl);

            res.statusCode = 200;
            let headers = new Map([["Content-Type", mimetype], ["Access-Control-Allow-Origin", "*"]])
            res.setHeaders(headers)
            res.write(fs.readFileSync(testUrl));
            res.end();

        } else {

            let parsedUrl = url.slice(1).replaceAll("%20", " ");

            if (fs.existsSync(parsedUrl)) {

                let mimetype = mime.lookup(parsedUrl);
                console.log(mimetype)

                res.statusCode = 200;
                let headers = new Map([["Content-Type", mimetype], ["Access-Control-Allow-Origin", "*"]])
                res.setHeaders(headers)
                res.write(fs.readFileSync(parsedUrl));
                res.end();

            }

        }

    }

})

// if the listening runs properly then print message to console
if (server.listen(PORT, "127.0.0.1")) {
    console.log("Listening for http requests on port " + PORT);
}