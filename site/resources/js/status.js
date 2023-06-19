document.addEventListener('DOMContentLoaded', init, false);

var raspisanie = {}
function init() {
	let xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/get');
		xhr.send();

		xhr.onload = function() {
			if (xhr.status != 200) {
				alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
			} else {
				// localStorage.setItem('raspisanie_last', xhr.response);
				raspisanie = JSON.parse(xhr.response)
				GenerateGroupChoose()
				GeneratePrepodChoose()
			}
		};

		xhr.onerror = function() {
			alert("Запрос не удался");
		};

	if (!navigator.onLine)
	{
		document.getElementById("offline").style.display = "block";
	}

	if (localStorage.getItem("board", "0") == "1")
	{
		document.getElementById("qr_code").style.display = "block";
	}
}