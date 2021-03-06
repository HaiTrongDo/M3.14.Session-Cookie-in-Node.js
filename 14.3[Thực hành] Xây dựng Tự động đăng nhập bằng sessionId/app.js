const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const localStorage = require('local-storage');

let handlers = {};

handlers.login = function (rep, res) {
    fs.readFile('./views/login.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};

handlers.notfound = function (rep, res) {
    fs.readFile('./views/notfound.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};

handlers.infor = function (req, res) {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        data = qs.parse(data);
        let expires = Date.now() + 1000*60*60;
        let tokenSession = "{\"name\":\""+data.name+"\",\"email\":\""+data.email+"\",\"password\":\""+data.password+"\",\"expires\":"+expires+"}";
        let tokenId = createRandomString(20);
        createTokenSession(tokenId, tokenSession);
        localStorage.set('token', tokenId);
        fs.readFile('./views/infor.html', 'utf8', function (err, datahtml) {
            if (err) {
                console.log(err);
            }
            datahtml = datahtml.replace('{name}', data.name);
            datahtml = datahtml.replace('{email}', data.email);
            datahtml = datahtml.replace('{password}', data.password);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(datahtml);
            return res.end();
        });

    })
    req.on('error', () => {
        console.log('error')
    })
};

let router = {
    'login': handlers.login,
    'infor': handlers.infor,
    'notfound': handlers.notfound
}

handlers.infor = function (req, res) {

    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        data = qs.parse(data);
        let expires = Date.now() + 1000*60*60;
        let tokenSession = "{\"name\":\""+data.name+"\",\"email\":\""+data.email+"\",\"password\":\""+data.password+"\",\"expires\":"+expires+"}";
//- T???o sessionId ng???u nhi??n
        let tokenId = createRandomString(20);
//- Ghi sessionId v??o server
        createTokenSession(tokenId, tokenSession);
//- D??ng localStorage ????? ghi l???i sessionId ph??a client.
        localStorage.set('token', tokenId);
//- Hi???n th??? trang infor
        fs.readFile('./views/infor.html', 'utf8', function (err, str) {
            if (err) {
                console.log(err.message);
            }
            str = str.replace('{name}', data.name);
            str = str.replace('{email}', data.email);
            str = str.replace('{password}', data.password);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(str);
            return res.end();
        });

    })
    req.on('error', () => {
        console.log('error')
    })
};

let createTokenSession = function (fileName, data){
    fileName = './token/' + fileName;
    fs.writeFile(fileName, data, err => {
    });
}


let createRandomString = function (strLength){
    strLength = typeof(strLength) == 'number' && strLength >0 ? strLength:false;
    if (strLength){
        let possibleCharacter = 'abcdefghiklmnopqwerszx1234567890';
        let str='';
        for (let i = 0; i <strLength ; i++) {
            let randomCharacter = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length));
            str+=randomCharacter;
        }
        return str;
    }
}

//l???y d??? li???u t??? local storage, ?????c d??? li???u t??? sessionID

let readSession = function(req, res){
//l???y sessionId t??? local storage
    let tokenID = localStorage.get("token");
    console.log(tokenID);
    if (tokenID){
        let sessionString= "";
        let expires=0;
//?????c file sessionId t????ng ???ng ph??a server
        fs.readFile('./token/'+tokenID, 'utf8' , (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            sessionString = String(data);
// l???y ra th???i gian h???t h???n c???a sessionId
            expires = JSON.parse(sessionString).expires;
// l???y ra th???i gian hi???n t???i
            let now = Date.now();
// so s??nh th???i gian h???t h???n v???i th???i h???n c???a sessionID
            if (expires<now){
//???? ????ng nh???p nh??ng h???t h???n
//Th???c h??nh ????ng nh???p v?? l??u l???i
                let parseUrl = url.parse(req.url, true);
                let path = parseUrl.pathname;
                let trimPath = path.replace(/^\/+|\/+$/g, '');
                let chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
                chosenHandler(req, res);
            }
            else {
// ???? ????ng nh???p v?? ch??a h???t h???n
// chuy???n sang trang dashboard
                fs.readFile('./views/dashboard.html', 'utf8', function (err, datahtml) {
                    if (err) {
                        console.log(err);
                    }
                    datahtml = datahtml.replace('{name}', JSON.parse(sessionString).name);
                    datahtml = datahtml.replace('{email}', JSON.parse(sessionString).email);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(datahtml);
                    return res.end();
                });
            }
        });
    }
    else {
// ch??a ????ng nh???p
        let parseUrl = url.parse(req.url, true);
        let path = parseUrl.pathname;
        let trimPath = path.replace(/^\/+|\/+$/g, '');
        let chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
        chosenHandler(req, res);
    }
}

const server = http.createServer(function (req, res) {
    readSession(req, res);
});
server.listen(8080, function () {
    console.log('server running at localhost:8080 ')
});
