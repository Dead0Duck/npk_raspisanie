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
			}, (err) => {
				console.error('Service worker not registered -->', err);
			});
	}

	if('permissions' in navigator)
	{
		navigator.permissions.query({name:'notifications'}).then(perm => {
			if(perm.state == "granted")
			{
				document.getElementById("notify_btn").remove()
			}
			else
			{
				document.getElementById("notify_btn").addEventListener("click", () => {
					pushNotifications(reg).catch(error => console.error(error));	
				})
			}
		})
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

const publicVapidKey = 'BJNK4Y5DyVxvRlUWBsLM6BC3mpNvGyfwkSB4LzadBZnqm3wJLogVcOWuqjG_YO5w-9nTANFTCJ6dxydAdPT0-Zs';
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