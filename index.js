module.exports = { run: () => {
const sql = require('./sql')

require('dotenv').config();

const express = require('express');
const app = express();
const https = require('https');
const opt_cert = {
	key: process.env.SSL_PRIVKEY,
	cert: process.env.SSL_FULLCHAIN
};
const server = https.createServer(opt_cert, app);
const webPush = require('web-push');
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails('https://'+process.env.URL, publicVapidKey, privateVapidKey);

const RaspisanieParser = require('./parser');
RaspisanieParser.start(sql, webPush)

app.use(express.json());

// Подключение Helmet для увеличения безопасносности
const helmet = require('helmet')
const helmet_settings = {
	contentSecurityPolicy: false,
	crossOriginEmbedderPolicy: false,
	crossOriginResourcePolicy: false,
}
app.use(helmet(helmet_settings));

// Базовые настройки
app.set('view engine', 'ejs');
app.set('views', './site/pages')

// Защита от обращений по IP
app.all("*", (req, res, next) => {
	if(req.headers.host == process.env.URL)
		return next();

	res.sendStatus(403);
})


app.use(express.static('./site/resources'));

app.get('/api/get', (req, res, next) => {
	res.json(RaspisanieParser.get())
})

app.post('/subscribe', (req, res) => {
	const subscription = req.body

	sql.addNotification({
		"p256dh": subscription.keys.p256dh,
		"auth": subscription.keys.auth,
		"endpoint": subscription.endpoint
	})
  
	res.status(201).json({});
});
  
const port = process.env.PORT || 443
server.listen(port, () => {
	console.log(`Сайт запущен на порте ${port}`)
});

}}