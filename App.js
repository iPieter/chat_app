import React from 'react';
import {
    AppRegistry,
    FlatList,
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TextInput,
    Platform,
    StatusBar
} from 'react-native';
import KeyBoardSpacer from "react-native-keyboard-spacer";
import {StackNavigator, TabNavigator, DrawerNavigator} from 'react-navigation';

import StartScreen from "./components/StartScreen";
import ChatScreen from "./components/ChatScreen";
import OverviewScreen from "./components/OverviewScreen";
import CreatePrivateChatScreen from './components/CreatePrivateChatScreen';
import CreateGroupChatScreen from './components/CreateGroupChatScreen';
import AddUserGroupChatScreen from './components/AddUserGroupChatScreen';
import RegisterScreen from './components/RegisterScreen';
import LoginScreen from './components/LoginScreen';

const App = StackNavigator({
        Start: {screen: StartScreen},
        Chat: {screen: ChatScreen},
        Overview: {screen: OverviewScreen},
        CreatePrivateChat: {screen: CreatePrivateChatScreen},
        CreateGroupChat: {screen: CreateGroupChatScreen},
        AddUserGroupChatScreen: {screen: AddUserGroupChatScreen},
        RegisterScreen: {screen: RegisterScreen},
        LoginScreen: {screen: LoginScreen},
    },
    {
        //headerMode: "none"
        headerMode: 'screen',
        cardStyle: {
            paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
        }
    });

export default App;