const XLSX = require("xlsx");
const fetch = require('node-fetch')

let is_started = false
let raspisanie = {}
let parsed = {}
async function ParseRaspisanie(notifications, webPush)
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

				try
				{
					const pushes = notifications.getAll && notifications.getAll() || []
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
									notifications.remove(p.auth, p.p256dh)
								}
							});
					})
				}
				catch(e)
				{
					console.log('Не удалось разослать оповещения.')
				}
			}

			try {
				const res2 = await fetch(`https://politech-nsk.ru${encodeURI(l[0].replace(/"/g, ""))}`);
				const XLSXdata = await res2.arrayBuffer();

				const jObj = XLSX.read(XLSXdata, {type: 'array'})

				const dataWS = jObj.Sheets[jObj.SheetNames[0]]
				const data = XLSX.utils.sheet_to_json(dataWS, {header: 1})

				let y_start = 0
				for(let i = 0; i < 10; i++)
				{
					if(data[i][1] == "№")
					y_start = i
				}

				let groups = {}
				for(let i = 5; i < data[y_start].length; i+=5) {
					if(data[y_start][i])
						groups[data[y_start][i]] = i
				}

				let para_count = 5;
				for(let i = y_start + 3; i < y_start + 12; i++) {
					if(data[i][0])
					{
						para_count = (i-7)/2
						break;
					}
				}

				Object.entries(groups).forEach(([group, group_pos]) => {
					for(let day_ind = 0; day_ind < 60; day_ind += (para_count*2)) {
						let day = data[y_start + 2 + day_ind]
						if(!day || !day[0]) 
							break

						day = day[0].match(`(0[1-9]|[1-2][0-9]|3[0-1])\.(0[1-9]|1[0-2])\.[0-9]{4}`)[0] // Получаем дату из дня

						// Формируем объект расписания
						raspisanie[day] = raspisanie[day] || {}
						raspisanie[day][group] = raspisanie[day][group] || []

						for(let i = 0; i < (para_count * 2); i += 2)
						{
							let y = y_start + 2 + day_ind + i
							let predmet = data[y][group_pos]
							let prepod = data[y + 1][group_pos]
							let cabinet = data[y][group_pos+3]

							if(!predmet && !data[y][group_pos+2]) {
								raspisanie[day][group].push(false)
								continue
							}

							if(data[y][group_pos+1]) {
								// Если предмет поделён на две группы
								let ind = raspisanie[day][group].push([]) - 1

								// Пушим первую группу
								if(predmet)
								{
									cabinet = data[y][group_pos+1]
									raspisanie[day][group][ind].push({
										predmet,
										prepod,
										cabinet,
										group: 1
									})
								}

								// Пушим вторую группу
								predmet = data[y][group_pos+2]
								prepod = data[y + 1][group_pos+2]
								cabinet = data[y][group_pos+3]

								if(predmet)
								{
									raspisanie[day][group][ind].push({
										predmet,
										prepod,
										cabinet,
										group: 2
									})
								}
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
	start: (notifications, webPush) => {
		if(is_started)
			throw "Парсер расписания уже запущен!"

		ParseRaspisanie(notifications, webPush)
		setInterval(ParseRaspisanie, 1000 * 60 * 15)

		is_started = true
	},
	get: () => raspisanie
}