const XLSX = require("xlsx");
const fetch = require('node-fetch')

let is_started = false
let raspisanie = {}
let parsed = {}
async function ParseRaspisanie(sql, webPush)
{
	try {
		let free = true
		let res = await fetch('https://politech-nsk.ru/index.php/studentam');
		let links = await res.text()

		links = links && [...links.matchAll(/"\/images\/Files\/Raspisanie\/.*?"/g)] || []
		links.forEach(async l => {
			// Уже пропарсено
			if(parsed[l[0].replace(/"/g, "")])
				return;
			if(free) {
				console.log('Обновили расписание!')
				raspisanie = {}
				free = false

				const pushes = sql.getAllNotifications()
				pushes.forEach(p => {
					const subscription = {
						endpoint: p.endpoint,
						expirationTime: null,
						keys: {
							p256dh: p.p256dh,
							auth: p.auth
						}
					}

					webPush.sendNotification(subscription, "")
						.catch(error => {
							console.error(error)
							if(error.body == "push subscription has unsubscribed or expired.\n")
							{
								sql.delNotification(p.auth, p.p256dh)
							}
						});
				})
			}

			try {
				const res2 = await fetch(`https://politech-nsk.ru${encodeURI(l[0].replace(/"/g, ""))}`);
				const XLSXdata = await res2.arrayBuffer();

				const jObj = XLSX.read(XLSXdata, {type: 'array'})

				const dataWS = jObj.Sheets[jObj.SheetNames[0]]
				const data = XLSX.utils.sheet_to_json(dataWS, {header: 1})

				let groups = {}
				for(let i = 5; i < data[5].length; i+=5) {
					if(data[5][i])
						groups[data[5][i]] = i
				}

				let para_count = 5;
				for(let i = 8; i < 17; i++) {
					if(data[i][0])
					{
						para_count = (i-7)/2
						break;
					}
				}

				Object.entries(groups).forEach(([group, group_pos]) => {
					for(let day_ind = 0; day_ind < 60; day_ind += (para_count*2)) {
						let day = data[7 + day_ind]
						if(!day || !day[0]) 
							break

						day = day[0].split("  ")[0] // Получаем дату из дня

						// Формируем объект расписания
						raspisanie[day] = raspisanie[day] || {}
						raspisanie[day][group] = raspisanie[day][group] || []

						for(let i = 7 + day_ind; i < ((para_count*2 + 6) + day_ind); i += 2)
						{
							let predmet = data[i][group_pos]
							let prepod = data[i+1][group_pos]
							let cabinet = data[i][group_pos+3]

							if(!predmet) {
								raspisanie[day][group].push(false)
								continue
							}

							if(data[i][group_pos+1]) {
								// Если предмет поделён на две группы
								let ind = raspisanie[day][group].push([]) - 1

								// Пушим первую группу
								cabinet = data[i][group_pos+1]
								raspisanie[day][group][ind].push({
									predmet,
									prepod,
									cabinet,
									group: 1
								})

								// Пушим вторую группу
								predmet = data[i][group_pos+2]
								prepod = data[i+1][group_pos+2]
								cabinet = data[i][group_pos+3]

								raspisanie[day][group][ind].push({
									predmet,
									prepod,
									cabinet,
									group: 2
								})
							} else {
								// Одна группа и не паримся
								raspisanie[day][group].push({
									predmet,
									prepod,
									cabinet
								})
							}
						}
					}
				})

				parsed[l[0].replace(/"/g, "")] = true
			} catch(e) {
				console.error(e)
			}
		})
	} catch(e) {
		console.error(e)
	}
}

module.exports = {
	start: (sql, webPush) => {
		if(is_started)
			throw "Парсер расписания уже запущен!"

		ParseRaspisanie(sql, webPush)
		setInterval(ParseRaspisanie, 1000 * 60 * 15)

		is_started = true
	},
	get: () => raspisanie
}