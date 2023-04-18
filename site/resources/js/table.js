(function() {
	function gen_group_choose()
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
	window.gen_group_choose = gen_group_choose

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
	function make_table_content(group)
	{
		document.getElementById("cards").innerHTML = ""

		localStorage.setItem("last_group", group)

		Object.entries(raspisanie).forEach(([date, data]) => {
			let dateParts = date.split(".");
			let parsed_data = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
			let day_of_week = parsed_data.getDay()

			let card_html = `<div class="card bg-dark text-white mt-3">
			<div class="card-body">
				<h5 class="card-title">${date}</h5>
				<h6 class="card-subtitle mb-2 text-muted">${text_of_week[day_of_week]}</h6>`

			if(data[group].filter(p => p).length == 0) // Нет пар
			{
				card_html += "<p>Выходной"
			}
			else
			{
				card_html +=	`<div class="overflow-auto"><table class="table table-dark table-bordered">
									<thead>
										<tr>
											<th scope="col">№</th>
											<th scope="col">Подгруппа</th>
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
						card_html +=	`<tr>
											<th scope="row">${para+1}</th>
											<td>1</td>
											<td>${zvonki[para]}</td>
											<td>${predm_data[0].cabinet}</td>
											<td>${predm_data[0].predmet}</td>
											<td>${predm_data[0].prepod}</td>
										</tr>`

						card_html +=	`<tr>
											<th scope="row">${para+1}</th>
											<td>2</td>
											<td>${zvonki[para]}</td>
											<td>${predm_data[1].cabinet}</td>
											<td>${predm_data[1].predmet}</td>
											<td>${predm_data[1].prepod}</td>
										</tr>`
					}
					else
					{
						card_html +=	`<tr>
											<th scope="row">${para+1}</th>
											<td>Все</td>
											<td>${zvonki[para]}</td>
											<td>${predm_data.cabinet}</td>
											<td>${predm_data.predmet}</td>
											<td>${predm_data.prepod}</td>
										</tr>`
					}
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

		document.getElementById("group_title").innerText = group;
		make_table_content(group)
		document.getElementById("rasp_block").style.display = "block";
	})
})();