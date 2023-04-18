const SQLite = require("better-sqlite3");
const sqlPush = new SQLite('./.data/push.sqlite');

module.exports = {
	add: (data) => {
		sqlPush.prepare("INSERT OR REPLACE INTO pushes (p256dh, auth, endpoint) VALUES (@p256dh, @auth, @endpoint);").run(data)
	},

	remove: (auth, p256dh) => {
		sqlPush.prepare("DELETE FROM pushes WHERE auth = ? AND p256dh = ?").run(auth, p256dh)
	},

	getAll: () => {
		return sqlPush.prepare("SELECT * FROM pushes").all()
	}
}