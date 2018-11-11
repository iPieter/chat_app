import React, { Component } from 'react';
import { View, Text, TextInput, Button, AsyncStorage, Alert, Platform, StyleSheet } from 'react-native';
import KeyBoardSpacer from "react-native-keyboard-spacer";
import { NavigationActions } from 'react-navigation';
import {Config} from "../Config.js";

export default class AddUserGroupChatScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title : "Add user to " + navigation.state.params.channelName
        };
    }

    addToChat = async(username) => {
    
        console.log("hallo?");
    
        if(username === null )
            return;
    
        var details = {
            'token': await AsyncStorage.getItem('@app_db:token'),
            'username' : username,
          };
        
          var formBody = [];
          for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
          }
          formBody = formBody.join("&");
        
            fetch( Config.SERVER_URL +  'channels/' + this.props.navigation.state.params.channelKey + '/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            }).then( response => { 
                if( response.ok )
                {
                    console.log("going back");

                    const backAction = NavigationActions.back();
                    this.props.navigation.dispatch(backAction);

                }
                else
                {
                    console.log( response.status );
                    Alert.alert( 'Error', 
                        'User not found, check if the email is correct', 
                        [ {text: 'OK', onPress: () => {} } ], 
                        { cancelable: false } );            
                }
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
                <TextInput style={styles.input} placeholder="username" onChangeText={(username) => this.setState({username})}/>
                <Button title="Invite" onPress={ () => this.addToChat(this.state.username ) }/>
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