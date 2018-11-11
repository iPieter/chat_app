import React from 'react';
import {NavigationActions} from 'react-navigation';
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
    TouchableOpacity
} from 'react-native';
import KeyBoardSpacer from "react-native-keyboard-spacer";
import {AsyncStorage, Alert} from 'react-native';
import {Config} from "../Config.js";
import MessageHandler from "../MessageHandler";

export default class OverviewScreen extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: 'Channels',
            headerRight: (<Button title="Log out" onPress={() => {
                console.log("Logging out");

                AsyncStorage.getItem("@app_db:token").then((result) => {
                    var details = {
                        'token': result
                    };

                    var formBody = [];
                    for (var property in details) {
                        var encodedKey = encodeURIComponent(property);
                        var encodedValue = encodeURIComponent(details[property]);
                        formBody.push(encodedKey + "=" + encodedValue);
                    }
                    formBody = formBody.join("&");

                    fetch(Config.SERVER_URL + 'clients/logout', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: formBody
                    }).then((response) => {
                        console.log(response);

                        AsyncStorage.clear();

                        console.log("Cleared storage");

                        //TODO delete client from server here
                        const resetAction = NavigationActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({routeName: 'Start'})
                            ]
                        });

                        console.log("Changing scene");
                        navigation.dispatch(resetAction);

                    }).catch((err) => {
                        console.log(err);
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
            }/>)
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            channels: [],
            refreshing: false,
            formBody: ""
        };

        //this.loadChannels();
    }

    loadChannels = async function () {
        console.log("Loading channels");
        var details = {
            'token': await AsyncStorage.getItem("@app_db:token")
        };

        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        this.setState({formBody: formBody});

        fetch(Config.SERVER_URL + 'channels/all', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: formBody
        }).then((response) => response.json())
            .then(async (response) => {
                promises = [];

                lastIDs = {};

                for (var i = 0; i < response.length; i++) {
                    const KEY = i;
                    p = AsyncStorage.getItem("@app_db:" + response[i].key + "_" + "LAST_MESSAGE").then((res) => {
                        console.log(response[KEY].name + ":" + res);
                        response[KEY].lastMsg = JSON.parse(res).msg;
                    }).catch((err) => {
                        console.log(err);
                        response[KEY].lastMsg = "";
                    });

                    promises.push(p);
                }

                Promise.all(promises).then(() => {
                    this.setState({channels: response});
                    this.setState({refreshing: false});
                    console.log("Loaded channels");
                });

            }).catch((err) => {
            this.setState({refreshing: false});
            console.log(err);
            Alert.alert('Failed to fetch channels',
                'An unexpected error occured, please try again',
                [{
                    text: 'OK', onPress: () => {
                    }
                }],
                {cancelable: false});
        });
    };

    componentWillMount() {
        MessageHandler.getInstance().init();
        this.loadChannels();
    }

    componentWillUnmount() {
        MessageHandler.getInstance().close();
    }

    onRefresh = () => {
        this.setState({refreshing: true});
        this.loadChannels();
    };

    render() {
        var formBody = this.state.formBody;

        return (
            <View style={styles.container}>

                <FlatList style={styles.container}
                          data={this.state.channels}
                          ListHeaderComponent={this.renderHeader}
                          extraData={this.state.channels}
                          renderItem={({item}) => this.renderItem(item, formBody)}


                          refreshing={this.state.refreshing}
                          onRefresh={this.onRefresh}
                />

            </View>
        );
    }

    limitSentence(sentence) {
        if (sentence.length > 30) {
            return <Text>{sentence.replace(/^(.{30}[^\s]*).*/, "$1") + " ..."}</Text>;
        }

        if (sentence.length == 0) {
            return <Text style={{color: "#95a5a6"}}>No recent messages.</Text>;
        }

        return <Text>{sentence}</Text>;
    }

    renderItem = (item, formBody) => {
        if (item.channelType === "DIRECT") {
            return <TouchableOpacity onPress={() => this.props.navigation.navigate('Chat', {
                channelName: item.name,
                channelKey: item.key,
                channelType: item.channelType
            })}>
                <View style={styles.item}>
                    <Image style={styles.profile_img} source={{
                        uri: Config.SERVER_URL + "channels/" + item.key + "/users/other/image",
                        method: "POST",
                        headers: {
                            Pragma: "no-cache"
                        },
                        body: formBody
                    }}/>
                    <View style={styles.message}>
                        <View style={styles.metadata}>
                            <Text style={styles.sender}>{item.name}</Text>
                        </View>
                        {this.limitSentence(item.lastMsg)}
                    </View>
                </View>
            </TouchableOpacity>
        }

        return <TouchableOpacity onPress={() => this.props.navigation.navigate('Chat', {
            channelName: item.name,
            channelKey: item.key,
            channelType: item.channelType
        })}>
            <View style={styles.item}>
                <Image style={styles.profile_img} source={require('../res/group_focus.png')}/>
                <View style={styles.message}>
                    <View style={styles.metadata}>
                        <Text style={styles.sender}>{item.name}</Text>
                    </View>
                    {this.limitSentence(item.lastMsg)}
                </View>
            </View>
        </TouchableOpacity>
    };

    renderHeader = () => {
        return <View style={styles.header}>
            <View style={styles.button} >
                <Button title="New DM"
                        onPress={() => this.props.navigation.navigate("CreatePrivateChat")}/>
            </View>
            <View style={styles.button} >
            <Button style={styles.button} title="New group" onPress={() => {
                this.props.navigation.navigate("CreateGroupChat")
            }}/>
            </View>
        </View>
    };
}

const styles = StyleSheet.create({

    container: {
        backgroundColor: 'rgb(250,250,250)',
        flexDirection: 'column',
        flex: 1
    },
    header: {
        flexDirection: "row"
    },
    profile_img: {
        width: 40,
        height: 40,
        marginRight: 10,
        borderColor: '#bdc3c7',
        borderWidth: 1,
        borderRadius: 20
    },
    item: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: "#ecf0f1",
    },
    message: {
        flexWrap: 'wrap',
        flex: 0.99
    },
    msgContent: {
        color: 'rgb(10,10,10)',
        lineHeight: 23
    },
    metadata: {
        flexDirection: 'row',
    },
    sender: {
        fontWeight: 'bold'
    },
    date: {
        fontSize: 10,
        marginLeft: 5,
        marginTop: 3,
        textAlignVertical: 'center',
        color: '#95a5a6'
    },
    msgInput: {
        width: "70%",
        //height : "50%"
        paddingLeft: 5,
        paddingRight: 5
    },
    button: {
        width: "50%"
    },
    msgInputContainer: {
        //flex:1,
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        borderTopColor: "#ecf0f1",
        borderTopWidth: 1,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    capture: {
        flex: 0,
        borderWidth: 2,
        borderRadius: 50,
        borderColor: "rgba(255, 255, 255, 0.6)",
        backgroundColor: "rgba(169, 169, 169, 0.3)",
        padding: 7,
    }
});