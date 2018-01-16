import Vue from 'vue';
import Router from 'vue-router';

import OverviewTab from '../components/OverviewTab.vue';
import GraphTab from '../components/GraphTab.vue';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'OverviewTab',
            component: OverviewTab,
			props: true
        },
		{
			path: '/graph/:dataType/',
			name: 'GraphTab',
			component: GraphTab,
			props: true
		}
    ]
});
