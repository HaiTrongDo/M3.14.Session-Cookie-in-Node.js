let cookie = require('cookie');
let escapeHtml = require('escape-html');
let http = require('http');
let url = require('url');



function creatServer(req, res) {
// Parse the query string
    let query = url.parse(req.url, true, true).query;
    if (query && query.remember && query.name) {
// Set a new cookie with the name
        res.setHeader('Set-Cookie', cookie.serialize('name', String(query.name), {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7 // 1 week
        }));
// Redirect back after setting cookie
        res.statusCode = 302;
        res.setHeader('Location', req.headers.referer || '/');
        res.end();
        return;
    }

// Parse the cookies on the request
    let cookies = cookie.parse(req.headers.cookie || '');
// Get the visitor name set in the cookie
    let name = cookies.name;
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    if (name) {
        res.write('<form method="GET">');
        res.write('<p>Welcome back, <b>' + escapeHtml(name) + '</b>!</p>');
        res.write('<input placeholder="enter your name" name="name" value="' + escapeHtml(name) + '"></br>');
        res.write('<input type="checkbox" id="remember" name="remember" value="true">\n' +
            '<label for="vehicle2"> Remember me</label><br>');
        res.write('<input type="submit" value="Set Name">');
        res.end('</form>');
    } else {
        res.write('<form method="GET">');
        res.write('<p>Hello, new visitor!</p>');
        res.write('<input placeholder="enter your name" name="name" value=""></br>');
        res.write('<input type="checkbox" id="remember" name="remember" value="true">\n' +
            '<label for="vehicle2"> Remember me</label><br>');
        res.write('<input type="submit" value="Set Name">');
        res.end('</form>');
    }
}

http.createServer(creatServer).listen(8080);
