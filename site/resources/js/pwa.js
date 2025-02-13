document.addEventListener('DOMContentLoaded', init, false);

function init() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.addEventListener('message', function(event) {
			if(event.data == "upd_rasp")
				navigation.reload()
		});

		navigator.serviceWorker.register('/service-worker.js')
			.then((reg) => {
				console.log('Service worker registered -->', reg);

				if('permissions' in navigator)
				{
					navigator.permissions.query({name:'notifications'}).then(perm => {
						if(perm.state == "granted" || localStorage.getItem("disable_notification", "0") == "1")
							return document.getElementById("btns").remove()
						
						document.getElementById("notify_btn").addEventListener("click", () => {
							pushNotifications(reg).then(() => {
								document.getElementById("btns").remove()
							}).catch(error => console.error(error));	
						})

						document.getElementById("disable_btn").addEventListener("click", () => {
							localStorage.setItem("disable_notification", "1")
							document.getElementById("btns").remove()
						})
					})
				}
			}, (err) => {
				console.error('Service worker not registered -->', err);
			});
	}
}


function urlBase64ToUint8Array(base64String) {
	var padding = '='.repeat((4 - base64String.length % 4) % 4);
	var base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	var rawData = window.atob(base64);
	var outputArray = new Uint8Array(rawData.length);

	for (var i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

const publicVapidKey = 'BDjVam9sBWm14YSQupkL_weSTGiGDmvcF7agulVX967thMzSNMZy0xzB7rOlMdwqmTBjegtPvBrad8WN2h9jiNM';
async function pushNotifications(registration) {
	try {
		console.log('Registering push');
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
		});
		console.log('Registered push');

		console.log('Sending push');
		await fetch('/subscribe', {
			method: 'POST',
			body: JSON.stringify(subscription),
			headers: {
				'content-type': 'application/json'
			}
		});
		console.log('Sent push');
	} catch(e) {
		console.log("Push isn't registered")
	}
}