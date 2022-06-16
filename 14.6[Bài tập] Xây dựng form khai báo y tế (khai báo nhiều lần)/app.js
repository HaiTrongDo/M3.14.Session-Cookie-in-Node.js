const http = require('http')
const fs = require("fs");
const qs = require('qs')
const cookie = require("cookie");
const url = require("url");


const server = http.createServer((req, res) => {
    if (req.method=== 'GET' && req.url === '/appointment'){
        loadAppointmentForm(res);
    } else if (req.method=== 'POST' && req.url === '/appointment'){
        let loadedData =''
        req.on('data', chunk => {
            loadedData +=chunk;
        })
        req.on('end', ()=>{
            loadedData = qs.parse(loadedData)
            fs.writeFile('./token/dataFromForm',JSON.stringify(loadedData), err => {
                if (err){
                throw err;
                }
                res.setHeader('Set-Cookie', cookie.serialize('appointment', JSON.stringify(loadedData), {
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                }));
                res.statusCode = 302;
                res.setHeader('Location', req.headers.referer || '/');
                res.end();
            })
        })
        req.on('error',(err)=>{
            console.log(err.message);
        })
    }
}).listen(5000,()=>{
    console.log("server is listening on port 5000")
})


function loadAppointmentForm(res) {
    fs.readFile('./appointment-form.html', "utf-8", (err, data) => {
        // if (err) {
        //     console.log(err.message)
        // }
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write(data)
        res.end()
    })
}