const SQLite = require("better-sqlite3");
const sqlPush = new SQLite('./.data/push.sqlite');

// Создать таблицу, если её нет
let table = sqlPush.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'pushes';").get();
if (!table['count(*)']) {
	sqlPush.prepare("CREATE TABLE pushes (p256dh TEXT, auth TEXT, endpoint TEXT, primary key (p256dh, auth));").run();
	sqlPush.pragma("synchronous = 1");
	sqlPush.pragma("journal_mode = wal");
}

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