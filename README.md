# RightMove Scraper

## How to use

First place your firebase configuration that you can obtain from the webapp project's parameter page and place it in `firebase.config.json`. Install node dependencies using `npm install` and then launch via `npm start`.

You can edit the starting URL in the `.env` file.

To make this project run automatically everyday on a linux machine, edit your crontab config using, `crontab -e`. Then copy the line you find in the `scheduler.cron` file into the cron config. To customize the frequency of work, refer to any article you find on crontab there is extensive literature. Check using `crontab -l` that your task is listed.
