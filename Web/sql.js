const SQLite = require("better-sqlite3");
const sqlPush = new SQLite('./.data/push.sqlite');

module.exports = {
	addNotification: (data) => {
		sqlPush.prepare("INSERT OR REPLACE INTO pushes (p256dh, auth, endpoint) VALUES (@p256dh, @auth, @endpoint);").run(data)
	},

	delNotification: (auth, p256dh) => {
		sqlPush.prepare("DELETE FROM pushes WHERE auth = ? AND p256dh = ?").run(auth, p256dh)
	},

	getAllNotifications: () => {
		return sqlPush.prepare("SELECT * FROM pushes").all()
	}
}