import {Navigation} from 'react-native-navigation';
import {Platform} from 'react-native';
import help from './help';

let reactNativeNavigation = {
    initRoute(routes) {
        for (let key in routes) {
            Navigation.registerComponent(key, () => routes[key]);
        }
    },
    initApp(indexPage) {
        return Navigation.startSingleScreenApp({
            screen: {
                screen: indexPage,
                navigatorStyle: {navBarHidden: true},
            },
        });
    },
    initNavbar(navBar) {
        global.help = new help(navBar);
    },
    initAppByTab(tab, tabBarStyle) {
        let tabs = [];
        for (let i = 0; i < tab.length; i++) {
            tabs.push(
                {
                    label: tab[i].label,
                    screen: tab[i].screen,
                    icon: tab[i].icon,
                    navigatorStyle: {
                        navBarHidden: true
                    }
                }
            );
        }

        return Navigation.startTabBasedApp({
            tabs,
            animationType: Platform.OS === 'ios' ? 'slide-down' : 'fade',
            tabsStyle: tabBarStyle,
            appStyle: tabBarStyle

        });
    }
};

export default reactNativeNavigation;

