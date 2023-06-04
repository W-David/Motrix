import VueI18Next from '@panter/vue-i18next'
import axios from 'axios'
import {ipcRenderer} from 'electron'
import is from 'electron-is'
import Element, {Loading, Message} from 'element-ui'
import Vue from 'vue'
import {sync} from 'vuex-router-sync'

import {commands} from '@/components/CommandManager/instance'
import Icon from '@/components/Icons/Icon'
import {getLocaleManager} from '@/components/Locale'
import Msg from '@/components/Msg'
import router from '@/router'
import store from '@/store'
import TrayWorker from '@/workers/tray.worker'
import App from './App'

import '@/components/Theme/Index.scss'

const updateTray = is.renderer()
	? async payload => {
			const {tray} = payload
			if (!tray) {
				return
			}

			const ab = await tray.arrayBuffer()
			ipcRenderer.send('command', 'application:update-tray', ab)
	  }
	: () => {}

function initTrayWorker() {
	const worker = new TrayWorker()

	worker.addEventListener('message', event => {
		const {type, payload} = event.data

		switch (type) {
			case 'initialized':
			case 'log':
				console.log('[Motrix] Log from Tray Worker: ', payload)
				break
			case 'tray:drawed':
				updateTray(payload)
				break
			default:
				console.warn('[Motrix] Tray Worker unhandled message type:', type, payload)
		}
	})

	return worker
}

function init(config) {
	if (is.renderer()) {
		Vue.use(require('vue-electron'))
	}

	Vue.http = Vue.prototype.$http = axios
	Vue.config.productionTip = false

	const {locale} = config
	const localeManager = getLocaleManager()
	localeManager.changeLanguageByLocale(locale)

	Vue.use(VueI18Next)
	const i18n = new VueI18Next(localeManager.getI18n())
	Vue.use(Element, {
		size: 'mini',
		i18n: (key, value) => i18n.t(key, value)
	})
	Vue.use(Msg, Message, {
		showClose: true
	})
	Vue.component('mo-icon', Icon)

	const loading = Loading.service({
		fullscreen: true,
		background: 'rgba(0, 0, 0, 0.1)'
	})

	sync(store, router)

	/* eslint-disable no-new */
	global.app = new Vue({
		components: {App},
		router,
		store,
		i18n,
		template: '<App/>'
	}).$mount('#app')

	global.app.commands = commands
	require('./commands')

	global.app.trayWorker = initTrayWorker()

	setTimeout(() => {
		loading.close()
	}, 400)
}

store
	.dispatch('preference/fetchPreference')
	.then(config => {
		console.info('[Motrix] load preference:', config)
		init(config)
	})
	.catch(err => {
		alert(err)
	})
