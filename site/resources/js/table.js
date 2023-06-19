(function() {
	function GenerateGroupChoose()
	{
		let all_groups = []

		Object.keys(raspisanie[Object.keys(raspisanie)[0]]).forEach(k => {
			all_groups.push(k)
		})

		all_groups.sort((a,b) => a.localeCompare(b))

		let saved_last_group = localStorage.getItem("last_group")

		all_groups.forEach(gr => {
			var opt = document.createElement('option');
			opt.value = gr;
			opt.innerHTML = gr;
			document.getElementById("group").appendChild(opt);

			if(saved_last_group == gr && all_groups.includes(saved_last_group))
			{
				opt.selected = true

				const event = new Event('change');
				document.getElementById("group").dispatchEvent(event)
			}
		})
	}
	window.GenerateGroupChoose = GenerateGroupChoose

	function GeneratePrepodRaspisanie(prepods)
	{
		prepodRaspisanie = {}
		Object.keys(raspisanie).forEach(day => {
			for (const [group, paras] of Object.entries(raspisanie[day])) {
				for(let i = 0; i < paras.length; i++)
				{
					let para = paras[i]
					if (!para) continue
					if (Array.isArray(para))
					{
						if (para[0].prepod)
						{
							prepodRaspisanie[day] = prepodRaspisanie[day] || {}
							prepodRaspisanie[day][para[0].prepod] = prepodRaspisanie[day][para[0].prepod] || []
							prepodRaspisanie[day][para[0].prepod][i] = para[0]

							para[0].group = group
						}
						if (para[1].prepod)
						{
							prepodRaspisanie[day] = prepodRaspisanie[day] || {}
							prepodRaspisanie[day][para[1].prepod] = prepodRaspisanie[day][para[1].prepod] || []
							prepodRaspisanie[day][para[1].prepod][i] = para[1]

							para[1].group = group
						}
						continue
					}
					if (!para.prepod) continue

					prepodRaspisanie[day] = prepodRaspisanie[day] || {}
					prepodRaspisanie[day][para.prepod] = prepodRaspisanie[day][para.prepod] || []
					prepodRaspisanie[day][para.prepod][i] = para

					para.group = group
				}
			}
		})
	}

	function GeneratePrepodChoose()
	{
		let all_prepods = []

		Object.keys(raspisanie).forEach(day => {
			Object.values(raspisanie[day]).forEach(paras => {
				paras.forEach(para => {
					if (!para) return
					if (Array.isArray(para))
					{
						if (para[0].prepod && !all_prepods.includes(para[0].prepod)) all_prepods.push(para[0].prepod)
						if (para[1].prepod && !all_prepods.includes(para[1].prepod)) all_prepods.push(para[1].prepod)
						return
					}
					if (!para.prepod) return
					if (all_prepods.includes(para.prepod)) return
	
					all_prepods.push(para.prepod)
				})
			})
		})
		all_prepods.sort((a,b) => a.localeCompare(b))

		GeneratePrepodRaspisanie(all_prepods)
		let saved_last_prepod = localStorage.getItem("last_prepod")

		all_prepods.forEach(gr => {
			var opt = document.createElement('option');
			opt.value = gr;
			opt.innerHTML = gr;
			document.getElementById("prepod").appendChild(opt);

			if(saved_last_prepod == gr && all_prepods.includes(saved_last_prepod))
			{
				opt.selected = true

				const event = new Event('change');
				document.getElementById("prepod").dispatchEvent(event)
			}
		})
	}
	window.GeneratePrepodChoose = GeneratePrepodChoose

	const text_of_week = [
		"Воскресение",
		"Понедельник",
		"Вторник",
		"Среда",
		"Четверг",
		"Пятница",
		"Суббота"
	]
	const zvonki = [
		"8:30 - 10:10",
		"10:20 - 12:00",
		"12:30 - 14:10",
		"14:20 - 16:00",
		"16:10 - 17:50"
	]
	function makeTableContentGroup(group)
	{
		document.getElementById("cards").innerHTML = ""

		localStorage.setItem("last_group", group)
		localStorage.removeItem("last_prepod")

		Object.entries(raspisanie).forEach(([date, data]) => {
			let dateParts = date.split(".");
			let parsed_data = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
			let day_of_week = parsed_data.getDay()

			let card_html = `<div class="card bg-dark text-white mt-3">
			<div class="card-body">
				<h5 class="card-title">${date}</h5>
				<h6 class="card-subtitle mb-2 text-muted">${text_of_week[day_of_week]}</h6>`

			if(!data[group] || data[group].filter(p => p).length == 0) // Нет пар
			{
				card_html += "<p>Выходной"
			}
			else
			{
				let hasGroupParas = (data[group].filter(para => Array.isArray(para)).length > 0)
				card_html +=	`<div class="overflow-auto"><table class="table table-dark table-bordered">
									<thead>
										<tr>
											<th scope="col">№</th>
											${hasGroupParas ? '<th scope="col">Подгруппа</th>' : ""}
											<th scope="col">Время</th>
											<th scope="col">Кабинет</th>
											<th scope="col">Предмет</th>
											<th scope="col">Преподаватель</th>
										</tr>
									</thead>
									<tbody>`

				for(let para = 0; para < data[group].length; para++)
				{
					let predm_data = data[group][para]
					if(!predm_data)
						continue

					// Предмет с делением на группы
					if(Array.isArray(predm_data))
					{
						card_html +=	`<tr class="border-bottom-0">
											<th scope="row">${para+1}</th>
											<td>1</td>
											<td>${zvonki[para]}</td>
											<td>${predm_data[0].cabinet || ""}</td>
											<td>${predm_data[0].predmet || ""}</td>
											<td>${predm_data[0].prepod || ""}</td>
										</tr>`

						card_html +=	`<tr class="border-top-0">
											<th></th>
											<td class="border-top-1">2</td>
											<td></td>
											<td>${predm_data[1].cabinet || ""}</td>
											<td>${predm_data[1].predmet || ""}</td>
											<td>${predm_data[1].prepod || ""}</td>
										</tr>`
					}
					else
					{
						card_html +=	`<tr>
											<th scope="row">${para+1}</th>
											${hasGroupParas ? "<td>Все</td>" : ""}
											<td>${zvonki[para]}</td>
											<td>${predm_data.cabinet || ""}</td>
											<td>${predm_data.predmet || ""}</td>
											<td>${predm_data.prepod || ""}</td>
										</tr>`
					}
				}

				card_html += `</tbody></table></div>`
			}

			card_html += `</div></div>`

			document.getElementById("cards").innerHTML += card_html
		})
	}
	function makeTableContentPrepod(prepod)
	{
		document.getElementById("cards").innerHTML = ""

		localStorage.removeItem("last_group")
		localStorage.setItem("last_prepod", prepod)

		Object.entries(prepodRaspisanie).forEach(([date, data]) => {
			let dateParts = date.split(".");
			let parsed_data = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
			let day_of_week = parsed_data.getDay()

			let card_html = `<div class="card bg-dark text-white mt-3">
			<div class="card-body">
				<h5 class="card-title">${date}</h5>
				<h6 class="card-subtitle mb-2 text-muted">${text_of_week[day_of_week]}</h6>`

			if(!data[prepod] || data[prepod].filter(p => p).length == 0) // Нет пар
			{
				card_html += "<p>Нет пар"
			}
			else
			{
				card_html +=	`<div class="overflow-auto"><table class="table table-dark table-bordered">
									<thead>
										<tr>
											<th scope="col">№</th>
											<th scope="col">Время</th>
											<th scope="col">Группа</th>
											<th scope="col">Предмет</th>
											<th scope="col">Кабинет</th>
										</tr>
									</thead>
									<tbody>`

				for(let para = 0; para < data[prepod].length; para++)
				{
					let predm_data = data[prepod][para]
					if(!predm_data)
						continue

					card_html +=	`<tr>
										<th scope="row">${para+1}</th>
										<td>${zvonki[para]}</td>
										<td>${predm_data.group || ""}</td>
										<td>${predm_data.predmet || ""}</td>
										<td>${predm_data.cabinet || ""}</td>
									</tr>`
				}

				card_html += `</tbody></table></div>`
			}

			card_html += `</div></div>`

			document.getElementById("cards").innerHTML += card_html
		})
	}

	document.getElementById("group").addEventListener("change", () => {
		const group = document.getElementById("group").value
		if(group == "none")
			return alert("Выберите группу!")

		document.getElementById("group_title").innerText = `группы ${group}`;
		makeTableContentGroup(group)
		document.getElementById("rasp_block").style.display = "block";
	})

	document.getElementById("prepod").addEventListener("change", () => {
		const prepod = document.getElementById("prepod").value
		if(prepod == "none")
			return alert("Выберите преподавателя!")

		document.getElementById("group_title").innerText = `преподавателя ${prepod.replace(/\.$/, "")}`;
		makeTableContentPrepod(prepod)
		document.getElementById("rasp_block").style.display = "block";
	})
})();