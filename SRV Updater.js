require('dotenv').config();

const AutoGitUpdate = require('auto-git-update');
const config = {
	repository: process.env.GIT_URL,
	tempLocation: '../RaspisanieAutoUpd/',
	branch: process.env.GIT_BRANCH,
	ignoreFiles: [],
	executeOnComplete: 'npm run start',
	exitOnComplete: true,
	token: process.env.GIT_TOKEN,
}

const updater = new AutoGitUpdate(config);
updater.autoUpdate();