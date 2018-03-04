# README

This repo is for the frontend of the app that authenticated practitioners and staff will use to manage their clinics.

## Getting Started

### Components Used

We use several libraries and frameworks for our front-end, the more important ones are:

1. [Vue.js](https://vuejs.org/) - UI framework
1. [vue-router](https://router.vuejs.org/en/) - Browser navigation plugin for Vue.js
1. [vuex](https://vuex.vuejs.org/en/intro.html) - State management library for Vue.js
1. [Bulma](https://bulma.io/) - CSS framework for styling
1. [Buefy](https://buefy.github.io/#/documentation/start) - Vue.js plugin which turns Bulma components into Vue.js components
1. [Font Awesome](https://fontawesome.com/how-to-use/svg-with-js) - Icon library

### Prerequisites
You will need to install:
1. Node.js 8.9.1

### Setup
1. Edit the `apiEndpoint` key in `src/config/config.js` so that it points to backend server.

1. Install dependencies with `npm install`

1. Serve with hot reload at localhost:8080 with `npm run dev`

### Running on Mobile
To view the site on your mobile, you will need to follow several steps:

1. Before the `npm run dev` step, you will need to set the `HOST` environment variable to `0.0.0.0` so that the app runs on all interfaces. Do this by running `export HOST=0.0.0.0`
1. Get your mobile's local IP address for the wifi network (this will look something like 192.168.x.x). You can find this in your phone's settings.
1. Update your Ubuntu firewall to allow access to your machine  from your mobile's IP to the port the site is running on. The command will be something like `sudo ufw allow from 192.168.1.104 to any port 8081`. Make sure you replace the IP with your mobile's IP, and the port with the port the site is running on.

### Production Build
``` bash
# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## Troubleshooting

- Frontend can't make requests to the backend (console shows red warning about CORS and Access-Control-Allow-Origin header):
  - In the Sails.js backend, edit config/security.js and the IP:port where your frontend is being served from. So if your laptops IP is 192.168.2.2, and the frontend app is being served on port 8081, add that just like the existing entries.

## Code Guidelines
