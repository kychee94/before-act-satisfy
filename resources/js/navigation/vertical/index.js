// import appsAndPages from './apps-and-pages'
// import charts from './charts'
// import dashboard from './dashboard'
// import forms from './forms'
// import others from './others'
// import uiElements from './ui-elements'

// export default [...dashboard, ...appsAndPages, ...uiElements, ...forms, ...charts, ...others]
import { createI18n } from 'vue-i18n';
import { usePage } from '@inertiajs/vue3'

const i18n = createI18n({
  legacy: false, // This is required for Vue 3
  locale: 'en', // Set the default language
  messages: {
    en,
    zh,
    ms
  }
})

// Import translation files
import en from '/resources/lang/en.json'
import zh from '/resources/lang/zh.json'
import ms from '/resources/lang/ms.json'

export default computed(() => {

	const { notifications } = usePage().props;
  const orderCount = notifications.order

  return [
		{
			title: i18n.global.t('Dashboard'),
			icon: { icon: 'tabler-layout-dashboard' },
			children: [
			  {
			    title: i18n.global.t('Dashboard'),
			    to: { name: 'admin.dashboard'},
			  },
			],
		},
		{ heading: i18n.global.t('Users') },
		{
			title: i18n.global.t('Agent'),
			icon: { icon: 'tabler-user-scan' },
	    permission: ['agent'],
			children: [
			  {
			    title: i18n.global.t('Agent'),
			    to: { name: 'admin.agent.index'},
			    permission: 'agent',
			    level: 1,
			  },
			  {
			    title: i18n.global.t('Wallet Transaction'),
			    to: { name: 'admin.transaction.agent'},
			    permission: 'agent',
			    level: 1,
			  },
			],
		},
		{
			title: i18n.global.t('Member'),
			icon: { icon: 'tabler-users' },
	    permission: ['member'],
			children: [
			  {
			    title: i18n.global.t('Member'),
			    to: { name: 'admin.member.index'},
			    permission: 'member',
			    level: 1,
			  },
			  {
			    title: i18n.global.t('Wallet Transaction'),
			    to: { name: 'admin.transaction.member'},
			    permission: 'member',
			    level: 1,
			  },
			  {
			    title: i18n.global.t('Exchange'),
			    to: { name: 'admin.exchange'},
			    permission: 'member',
			    level: 1,
			  },
			],
		},
		{ heading: i18n.global.t('Features') },
		{
			title: i18n.global.t('Store'),
			icon: { icon: 'tabler-building-store' },
	    permission: ['product'],
			children: [
			  {
			    title: i18n.global.t('Product'),
			    to: { name: 'admin.product.index'},
	        permission: 'product',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Category'),
			    to: { name: 'admin.category.index'},
	        permission: 'product',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Brand'),
			    to: { name: 'admin.brand.index'},
	        permission: 'product',
	        level: 1,
			  },
			],
		},
		// {
		// 	title: i18n.global.t('Orders'),
		// 	icon: { icon: 'tabler-truck-delivery' },
	  //   permission: ['order'],
		// 	children: [
		// 	  {
		// 	    title: i18n.global.t('Order'),
		// 	    to: { name: 'admin.order.index'},
	  //       permission: 'order',
	  //       level: 1,
	  //       notification: 'order', // notification name must same with @stores/admin/notification.js & NotificationService.php
		//       badgeContent: orderCount,
		// 	    badgeClass: 'bg-error',
		// 	  },
		// 	],
    //   notification: 'order', // notification name must same with @stores/admin/notification.js & NotificationService.php
    //   badgeContent: orderCount,
	  //   badgeClass: 'bg-error',
		// },
		// {
		// 	title: i18n.global.t('Voucher'),
		// 	icon: { icon: 'tabler-gift-card' },
	  //   permission: ['voucher'],
		// 	children: [
		// 	  {
		// 	    title: i18n.global.t('Setting'),
		// 	    to: { name: 'admin.voucher.index'},
	  //       permission: 'spin',
	  //       level: 1,
		// 	  },
		// 	  {
		// 	    title: i18n.global.t('Transaction'),
		// 	    to: { name: 'admin.transaction.voucher'},
	  //       permission: 'spin',
	  //       level: 1,
		// 	  },
		// 	],
		// },
		{
			title: i18n.global.t('Spinwheel'),
			icon: { icon: 'tabler-wheel' },
	    permission: ['spin'],
			children: [
			  {
			    title: i18n.global.t('Setting'),
			    to: { name: 'admin.spin.index'},
	        permission: 'spin',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Transaction'),
			    to: { name: 'admin.transaction.spin'},
	        permission: 'spin',
	        level: 1,
			  },
			],
		},
		{
			title: i18n.global.t('Chest'),
			icon: { icon: 'mdi-treasure-chest' },
	    permission: ['chest'],
			children: [
			  {
			    title: i18n.global.t('Setting'),
			    to: { name: 'admin.chest.index'},
	        permission: 'chest',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Transaction'),
			    to: { name: 'admin.transaction.chest'},
	        permission: 'chest',
	        level: 1,
			  },
			],
		},
		{
			title: i18n.global.t('Smash'),
			icon: { icon: 'mdi-gavel' },
	    permission: ['smash'],
			children: [
			  {
			    title: i18n.global.t('Setting'),
			    to: { name: 'admin.smash.index'},
	        permission: 'smash',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Transaction'),
			    to: { name: 'admin.transaction.smash'},
	        permission: 'smash',
	        level: 1,
			  },
			],
		},
		{
			title: i18n.global.t('Scratch Card'),
			icon: { icon: 'mdi-cards-playing-heart-outline' },
	    permission: ['scratch_card'],
			children: [
			  {
			    title: i18n.global.t('Setting'),
			    to: { name: 'admin.scratchcard.index'},
	        permission: 'scratch_card',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Transaction'),
			    to: { name: 'admin.transaction.scratchcard'},
	        permission: 'scratch_card',
	        level: 1,
			  },
			],
		},
		{
			title: i18n.global.t('Checkin'),
			icon: { icon: 'mdi-calendar-check' },
	    permission: ['checkin'],
			children: [
			  {
			    title: i18n.global.t('Setting'),
			    to: { name: 'admin.checkin.index'},
	        permission: 'checkin',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Member'),
			    to: { name: 'admin.checkin.member'},
	        permission: 'checkin',
	        level: 1,
			  },
			  {
			    title: i18n.global.t('Transaction'),
			    to: { name: 'admin.transaction.checkin'},
	        permission: 'checkin',
	        level: 1,
			  },
			],
		},
		{ heading: i18n.global.t('Settings') },
		{
			title: i18n.global.t('Admin'),
			icon: { icon: 'tabler-user-cog' },
			permission: ['user', 'set_role'],
			children: [
			  	{
				    title: i18n.global.t('Admin'),
				    to: {name: 'admin.user.index'},
		        permission: 'user',
		        level: 1,
			  	},
			  	{
				    title: i18n.global.t('Role'),
				    to: {name: 'admin.role.index'},
		        permission: 'set_role',
		        level: 1,
			  	},
			 ]
		},
		{
			title: i18n.global.t('Settings'),
			icon: { icon: 'tabler-settings' },
			permission: ['email', 'marketing', 'layout_setting', 'setting', 'log'],
			children: [
			  	{
				    title: i18n.global.t('Email'),
				    to: {name: 'admin.setting.email.index'},
		        permission: 'email',
		        level: 1,
			  	},
			  	{
				    title: i18n.global.t('Marketing'),
				    to: {name: 'admin.setting.marketing.index'},
		        permission: 'marketing',
		        level: 1,
			  	},
			  	{
				    title: i18n.global.t('Layout'),
				    to: {name: 'admin.setting.layout.index'},
		        permission: 'layout_setting',
		        level: 1,
			  	},
			  	{
				    title: i18n.global.t('Design'),
				    to: {name: 'admin.setting.design.index'},
		        permission: 'layout_setting',
		        level: 1,
			  	},
			  	{
				    title: i18n.global.t('Page'),
				    to: {name: 'admin.setting.page.index'},
		        permission: 'layout_setting',
		        level: 1,
			  	},
			  	{
				    title: i18n.global.t('Slideshow'),
				    to: {name: 'admin.setting.slideshow.index'},
		        permission: 'layout_setting',
		        level: 1,
			  	},
			  	// {
				  //   title: i18n.global.t('System'),
				  //   to: {name: 'admin.setting.system.index'},
		      //   permission: 'setting',
		      //   level: 1,
			  	// },
			  	// {
				  //   title: 'API',
				  //   to: {name: 'admin.setting.api'},
		      //   permission: 'setting',
		      //   level: 1,
			  	// },
			  	{
				    title: i18n.global.t('IP Blocked'),
				    to: {name: 'admin.setting.ip_blocked.index'},
		        permission: 'setting',
		        level: 1,
			  	},
			  	{
				    title: i18n.global.t('Log', {name: i18n.global.t('System')}),
				    to: {name: 'admin.setting.log.index'},
		        permission: 'log',
		        level: 1,
			  	},
			  	// {
				  //   title: i18n.global.t('Log', {name: 'API'}),
				  //   to: { name: 'admin.setting.apilog'},
		      //   permission: 'log',
		      //   level: 1,
			  	// },
			 ]
		}
	]
})
