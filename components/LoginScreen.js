import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View, Image, ScrollView, TextInput, Button, AsyncStorage, Alert, Platform } from 'react-native';
import KeyBoardSpacer from "react-native-keyboard-spacer";
import { NavigationActions } from 'react-navigation';
import { Config } from "../Config.js";
import { Utils } from "../Utils.js";

//import { LibSignalModule } from "../LibSignalModule";

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        header: null
    }

    constructor() {
        super();

        this.testToken();

        //AsyncStorage.clear();

        /*
        LibSignalModule.generatePreKeys(0, 5).then( (result) => {
          console.log(result);
        });
  
        AsyncStorage.getItem("@app_db:keyPair").then( (keyPair) => {
            LibSignalModule.generateSignedPreKey( keyPair, 0 ).then( (result) => {
              console.log(result);
            }).catch( (err) => {
              console.log( err );
            });  
        });
        */
    }
    
    login(email, password) {
        console.log("Login");
    
        var keyPair = "test";//await LibSignalModule.generateIdentityKeyPair();
        var publicKey = "test";//await LibSignalModule.getPublicKey(keyPair);
        var privateKey = "test";//await LibSignalModule.getPrivateKey(keyPair);
    
        var details = {
            'password': password,
            'email': email,
            'identityKey': publicKey
        };
    
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
    
        fetch(Config.SERVER_URL + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody
        }).then(response => {
            return response.json().then( (data) => {
                if( response.ok )
                {
                    console.log("Login succesful, saving to db");
                
                    console.log( data.key);
                    console.log( data.keyCreationTime);
                    console.log( data.extendedInformation);
                    console.log( data.key);

                    tokenP = AsyncStorage.setItem('@app_db:token', data.key );
                    tokenTimeP =  AsyncStorage.setItem('@app_db:tokenTime', "" +data.keyCreationTime );
                    tokenClientKeyP =  AsyncStorage.setItem('@app_db:clientKey', data.extendedInformation );
                    publickKeyP = AsyncStorage.setItem('@app_db:publicKey', publicKey );
                    privateKeyP = AsyncStorage.setItem('@app_db:privateKey', privateKey );
                    keyPairP = AsyncStorage.setItem('@app_db:keyPair', keyPair );
                    usernameP = AsyncStorage.setItem('@app_db:username', "Anton" );

                    Promise.all([tokenP, tokenTimeP, tokenClientKeyP, usernameP ]).then( () => {
                        console.log("Switching scenes");
                        this.goToOverviewScreen();                    
                    }).catch( function( error ) 
                    {
                        console.log( error );
                    });
                }
                else
                {
                    console.log(response);
                    Alert.alert( 'Failed to login', 
                        'An unexpected error occured, please try again', 
                        [ {text: 'OK', onPress: () => {} } ], 
                        { cancelable: false } );
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }
    
    testToken = async() => {
        console.log("testing token");
        try {
            const token = await AsyncStorage.getItem('@app_db:token');
            if (token !== null) {
                this.goToOverviewScreen();
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    goToOverviewScreen() {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Overview' })
            ]
        })
        this.props.navigation.dispatch(resetAction);
    }


    render() {

        return (
            <View style={styles.container}>

                <Image style={styles.logo}
                       source={require('../res/login.png')}/>

                <TextInput placeholder="john.appleseed@apple.com" autoCapitalize = "none" style={styles.input} onChangeText={(email) => this.setState({ email })} />

                <TextInput placeholder="Password" style={styles.inputLast} onChangeText={(password) => this.setState({ password })} secureTextEntry={true} />

                <Button
                    style={styles.button}
                    title="Login"
                    onPress={() => this.login( this.state.email, this.state.password)}
                />
                {Platform.OS !== "android" && <KeyBoardSpacer/>}
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(250,250,250)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },

    button: {
        marginTop: 30
    },
    input: {
        padding: 10,
        borderTopColor: '#ecf0f1',
        borderTopWidth: 1,
        height: 40,
        width: "100%",
    },
    inputLast: {
        padding: 10,
        borderTopColor: '#ecf0f1',
        borderTopWidth: 1,
        borderBottomColor: '#ecf0f1',
        borderBottomWidth: 1,
        height: 40,
        width: "100%",
    },
    logo: {
        width: "70%",
        height: 100,
        marginBottom: 20,
        resizeMode: "contain",
    }
});