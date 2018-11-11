import React, {Component} from 'react';
import {View, Text, TextInput, Button, AsyncStorage, Alert, StyleSheet, Platform} from 'react-native';
import {Config} from "../Config.js";
import KeyBoardSpacer from "react-native-keyboard-spacer";
import { NavigationActions } from 'react-navigation';

export default class CreateGroupChatScreen extends Component {
    static navigationOptions = {
        title: "Create group chat"
    }

    constructor() {
        super();
        this.users = [];
        this.groupName = "";
    }

    createChat = async(groupName) => {
        
        var details = {
            'token': await AsyncStorage.getItem('@app_db:token'),
            'name': groupName
        };
    
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
    
        fetch(Config.SERVER_URL + 'channels/group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody
        }).then( response => {
            console.log( response );
            return response.json().then( async(data) => {
                console.log( data );
                if( response.ok )
                {
                    await AsyncStorage.setItem(data.name, data.key);
                    const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: 'Overview'})
                        ]
                    })
                    this.props.navigation.dispatch(resetAction);
                }
                else
                {
                    console.log( response.status );
                    Alert.alert( 'Error',
                        "Unable to create channel. You can cry now. We won't judge",
                        [ {text: "I'm crying", onPress: () => {} } ],
                        { cancelable: false } );
                }
            })
        })
            .catch( (err) => {
                console.log( err );
                Alert.alert( 'An error occured',
                    'An unexpected error occured, please try again',
                    [ {text: 'OK', onPress: () => {} } ],
                    { cancelable: false } );
            });
    }

    render() {

        return (
            <View style={styles.container}>
                <TextInput style={styles.input} placeholder="Name of the group"
                           onChangeText={(groupName) => this.setState({groupName})}/>
                <Button title="Create group" onPress={() => this.createChat(this.state.groupName)}/>
                {Platform.OS !== "android" && <KeyBoardSpacer/>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(250,250,250)',
        flexDirection: 'column',
        flex: 1
    },
    input: {
        padding: 10,
        borderBottomColor: '#ecf0f1',
        borderBottomWidth: 1,
        borderTopColor: '#ecf0f1',
        borderTopWidth: 1,
        height: 40
    }
});