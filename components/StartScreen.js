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
    Button,
    AsyncStorage,
    Alert,
    Platform
} from 'react-native';
import KeyBoardSpacer from "react-native-keyboard-spacer";
import {NavigationActions} from 'react-navigation';
import {Config} from "../Config.js";
import {Utils} from "../Utils.js";

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

    register(username, email, password) {
        var details = {
            'displayName': username,
            'password': password,
            'email': email
        };

        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        fetch(Config.SERVER_URL + 'signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: formBody
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Register succesfull");
                    this.login(username, email, password);
                }
                else {
                    console.log(err);
                }
            }).catch((err) => {
            console.log(err);
        });
    }

    login(username, email, password) {
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
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: formBody
        }).then(response => {
            return response.json().then((data) => {
                if (response.ok) {
                    console.log("Login succesful, saving to db");

                    //console.log( data.key + "," + data.keyCreationTime );

                    try {
                        tokenP = AsyncStorage.setItem('@app_db:token', data.key);
                        tokenTimeP = AsyncStorage.setItem('@app_db:tokenTime', "" + data.keyCreationTime);
                        tokenClientKeyP = AsyncStorage.setItem('@app_db:clientKey', "" + data.extendedInformation);
                        publickKeyP = AsyncStorage.setItem('@app_db:publicKey', publicKey);
                        privateKeyP = AsyncStorage.setItem('@app_db:privateKey', privateKey);
                        keyPairP = AsyncStorage.setItem('@app_db:keyPair', keyPair);
                        usernameP = AsyncStorage.setItem('@app_db:username', username);

                        Promise.all([tokenP, tokenTimeP, tokenClientKeyP, usernameP]).then(() => {
                            console.log("Switching scenes");
                            this.goToOverviewScreen();
                        }).catch(function (error) {
                            console.log(error);
                        });


                    } catch (error) {
                        console.log(error);
                    }
                }
                else {
                    console.log(response);
                    Alert.alert('Failed to login',
                        'An unexpected error occured, please try again',
                        [{
                            text: 'OK', onPress: () => {
                            }
                        }],
                        {cancelable: false});
                }
            });
        })
            .catch((err) => {
                console.log(err);
            });
    }

    testToken = async () => {
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
                NavigationActions.navigate({routeName: 'Overview'})
            ]
        })
        this.props.navigation.dispatch(resetAction);
    }

    render() {

        return (
            <View style={styles.container}>
                <Image style={styles.logo}
                           source={require('../res/icon_light_name.png')}/>
                <View style={styles.buttonContainer}>
                <View style={styles.item} >
                <Button title="Register"
                        onPress={() => this.props.navigation.navigate("RegisterScreen")}/>
                </View>
                <View style={styles.item} >
                <Button title="Login" onPress={() => {
                    this.props.navigation.navigate("LoginScreen")
                }}/>
                </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flex: 1,
        backgroundColor: 'rgb(250,250,250)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        width: "50%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    rowContainer: {
        width: "100%",
        flex: 1,
        flexDirection: 'row',
        justifyContent: "center"
    },
    header: {
        fontWeight: 'bold',
        justifyContent: "center"
    },
    item: {
        flex: 1,
        padding: 10,
        width: 150
    },
    logo: {
        width: "70%",
        height: 300,
        marginBottom: 75
    }

});