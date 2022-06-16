const http = require('http')
const fs = require("fs");
const qs = require('qs')
const cookie = require("cookie");
const url = require("url");
let handlers = {};


handlers.home = (req, res) => {
    fs.readFile("./views/index.html", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    })
}
handlers.login = function (rep, res) {
    let cookies = JSON.parse(cookie.parse(rep.headers.cookie).register);
    let tokenData = JSON.parse(fs.readFileSync('./token/dataFromForm','utf-8'));
    let checkName = cookies['First name'] === tokenData['First name'] && cookies['Last Name'] === tokenData['Last Name'];
    if (checkName){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(`<h1> Welcome ${cookies['First name']} ${cookies['Last Name']}, you are logged in</h1>`);
        return res.end();
    } else {
        fs.readFile('./views/login.html', function (err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            return res.end();
        });
    }

};
handlers.register = (req, res) => {
    if (req.method === 'GET') {
        fs.readFile("./views/register.html", (err, str) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(str);
            return res.end();
        })
    } else {
        let loadedData = ''
        req.on('data', chunk => {
            loadedData += chunk;
        })
        req.on('end', () => {
            loadedData = qs.parse(loadedData)
            fs.writeFile('./token/dataFromForm', JSON.stringify(loadedData), err => {
                if (err) {
                    throw err;
                }
                res.setHeader('Set-Cookie', cookie.serialize('register', JSON.stringify(loadedData), {
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                }));
                res.statusCode = 302;
                res.setHeader('Location',  '/home');
                res.end();
            })
        })
        req.on('error', (err) => {
            console.log(err.message);
        })
    }
}

handlers.notfound = (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    return res.end('<h1>Page not found</h1>');
}


const server = http.createServer((req, res) => {
    let trimPath = req.url.replace(/^\/+|\/+$/g, '')
    let chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
    chosenHandler(req, res);

}).listen(5000, () => {
    console.log("server is listening on port 5000")
})


let router = {
    'login': handlers.login,
    'register': handlers.register,
    'home': handlers.home,
    'notfound': handlers.notfound
}
