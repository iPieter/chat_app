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
    TouchableOpacity,
    TouchableHighlight,
    AsyncStorage,
    Modal,
    Platform
} from 'react-native';
import KeyBoardSpacer from "react-native-keyboard-spacer";
import {StackNavigator} from 'react-navigation';
import webstomp from '../webstomp/webstomp';
import ImagePicker from 'react-native-image-crop-picker';
import {DeviceEventEmitter} from 'react-native';
import {Config} from "../Config.js";
import MessageHandler from "../MessageHandler";
import MapView from 'react-native-maps';

const TIMEOUT = 10000;
const URL = 'notes.ipieter.be:2000';

export default class ChatScreen extends React.Component {
    static navigationOptions = ({navigation}) => {
        if (navigation.state.params.channelType === "DIRECT") {
            return {
                title: navigation.state.params.channelName,
            };
        }

        return {
            title: navigation.state.params.channelName,
            headerRight: (<Button title="Add user" onPress={() => {
                navigation.navigate('AddUserGroupChatScreen', {
                    channelName: navigation.state.params.channelName,
                    channelKey: navigation.state.params.channelKey
                })
            }}/>)
        };
    };

    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            refreshing: false,
            hasImage: false,
            hasLocation: false,
            locationInfo: "",
            imgPath: "",
            text: "",
            clients: [],
            emojis: [],
            users: []
        };
    };

    loadMessages = async () => {
        var channelKey = this.props.navigation.state.params.channelKey;

        try {
            var currentMessageID = await AsyncStorage.getItem("@app_db:" + channelKey + "_" + "LAST_MESSAGE_ID");

            if (currentMessageID === null) {
                await AsyncStorage.setItem("@app_db:" + channelKey + "_" + "LAST_MESSAGE_ID", "" + 0);
            }
            else {
                var index = 0;
                while (index < 50 && (currentMessageID - index) >= 0) {
                    var msg = await AsyncStorage.getItem("@app_db:" + channelKey + "_" + (currentMessageID - index));
                    msg = JSON.parse(msg);

                    if (msg !== null) {
                        msg.key = this.state.messages.length;
                        this.setState(prevState => ({
                            messages: [...prevState.messages, msg]
                        }));
                    }

                    index++;
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    componentWillMount = function () {
        MessageHandler.getInstance().addListener(this.props.navigation.state.params.channelKey, (msg) => {
            this.setState(prevState => ({
                messages: [msg, ...prevState.messages]
            }));
        });

        this.loadMessages();
        this.getClientsFromServer();
        this.getEmojisFromServer();
    };

    getEmojisFromServer = async () => {
        console.log("Fetching emojis.");

        fetch(Config.SERVER_URL + 'emojis/', {
            method: 'GET',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        }).then(response => {
            return response.json().then(async (data) => {
                if (response.ok) {
                    console.log("Fetching emojis: " + data.length + " emojis found.");
                    console.log(data);
                    this.setState(prevState => ({
                        emojis: data,
                    }));
                }
            });
        });
    };

    getClientsFromServer = async () => {
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

        console.log("Fetching data for channel: " + this.props.navigation.state.params.channelKey);

        fetch(Config.SERVER_URL + 'channels/' + this.props.navigation.state.params.channelKey + "/clients", {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: formBody
        }).then(response => {
            return response.json().then(async (data) => {
                if (response.ok) {
                    console.log("Fetching list of clients: " + data.length + " clients found.");
                    console.log(data);

                    for (var i = 0; i < data.length; i++) {
                        const KEY = data[i].identifierKey;
                        fetch(Config.SERVER_URL + 'clients/' + data[i].identifierKey + "/user", {
                            method: 'POST',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            body: formBody
                        }).then(response => {
                            return response.json().then(async (user) => {
                                if (response.ok) {
                                    console.log(user);
                                    console.log(KEY);

                                    this.state.users[KEY] = user;
                                }
                            });
                        });
                    }

                    this.setState(prevState => ({
                        clients: data,
                    }));
                }
            });
        });
    };

    componentWillUnmount() {
        MessageHandler.getInstance().removeListener(this.props.navigation.state.params.channelKey);
    };

    send = async (msg) => {

        var key = this.props.navigation.state.params.channelKey;
        var clients = this.state.clients;


        if (this.state.hasImage) {
            this.setState({hasImage: false});
            const token = await AsyncStorage.getItem("@app_db:token");
            const image = await AsyncStorage.getItem("@app_db:img_info");

            image = JSON.parse(image);

            const data = new FormData();
            data.append('token', token);
            data.append('file', {
                uri: image.path,
                type: image.mime,
                name: 'TEST'
            });
            fetch(Config.SERVER_URL + "images/", {
                method: 'post',
                body: data
            }).then(res => {

                console.log(res);

                if (res.ok) {
                    console.log("Uploaded image, sending message");
                    var info = res.json().then((data) => {
                        var result = {
                            msg: msg,
                            imageIdentifier: data.identifier,
                            mime: data.mediaType,
                            type: Config.MessageType.IMAGE_MESSAGE
                        }
                        MessageHandler.getInstance().sendMessage(result, key, clients);
                    });
                }

            }).catch((err) => {
                console.log(err);
            });
        }
        else if (this.state.hasLocation) {
            this.setState({hasLocation: false});
            console.log("Sending location");
            var result = {
                msg: msg,
                location: JSON.stringify(this.state.location),
                type: Config.MessageType.LOCATION_MESSAGE
            };
            MessageHandler.getInstance().sendMessage(result, key, clients);
        }
        else {
            if (!this.isEmpty(this.state.text)) {
                var result = {
                    msg: msg,
                    type: Config.MessageType.TEXT_MESSAGE
                };
                MessageHandler.getInstance().sendMessage(result, key, clients);
            }
        }


        this.state.text = "";
    };

    isEmpty(text) {
        return text.replace(/\s/g, '').length == 0;
    }

    openCamera() {
        ImagePicker.openCamera({
            cropping: true,
            includeBase64: true
        }).then(async (image) => {
            //console.log(image.data);
            //console.log(image);

            await AsyncStorage.setItem("@app_db:img_info", JSON.stringify(image));

            this.setState({hasImage: true, imgPath: "data:image/jpeg;base64," + image.data});
        });
    }

    addCoordinates() {
        if (this.state.hasLocation) {
            this.setState({hasLocation: false});
        }
        else {
            try {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log(position);
                        //this.setState({text: position});
                        this.setState({hasLocation: true, location: position});
                    },
                    (error) => {
                        console.log(error);
                    },
                    {enableHighAccuracy: true, timeout: 5000, maximumAge: 2000},
                );
            } catch (err) {
                console.log(err);
            }
        }
    }

    renderMessageBody(msg) {

        var codeSplit = this.extractCode(msg);
        var content = [];

        console.log(codeSplit);

        for (var k = 0; k < codeSplit.length; k++) {
            // regex tested for code so only test the start here
            if (codeSplit[k][0] === "%" && codeSplit[k][1] === "%") {
                result = codeSplit[k].substring(2, codeSplit[k].length - 2);
                if (result[0] === "\n") result = result.substring(1, result.length);
                content.push(
                    <View key={content.length} style={styles.code}>
                        <Text style={Platform.OS === 'android' ? {fontFamily: "monospace"} : {fontFamily: "Courier New"}}>{result}
                        </Text>
                    </View>);
                console.log("code");
            }
            else {
                var split = codeSplit[k].split(/(:[\w-]*:)/g);


                var emojisOnly = true;
                var i = 0;
                while (emojisOnly && i < split.length) {
                    var copy = split[i];
                    emojisOnly = split[i].split(":").length > 1 || copy.replace(/\s/g, '').length == 0;
                    i++;
                }

                const size = emojisOnly ? 64 : 20;

                for (var i = 0; i < split.length; i++) {
                    var emoji = split[i].split(":");
                    // Splitpiece contains emoji
                    if (emoji.length > 1 && this.isEmoij(emoji[1])) {
                        content.push(<Image key={content.length} source={
                            {uri: "https://notes.ipieter.be/chat/emojis/" + emoji[1].toLowerCase() + ".png"}}
                                            style={{width: size, height: size}}></Image>);
                    }
                    else {
                        // Splitpiece is text or code, test it

                        content.push(<Text key={content.length} style={styles.msgContent}>{split[i]}</Text>);
                    }
                }
            }
        }

        if (emojisOnly) {
            return (
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {content}
                </View>
            );
        }

        return (
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {content}
            </View>
        );
    }

    extractCode(msg) {
        return msg.split(/(%%\n*.*\n*%%\n?)/g);
    }

    isEmoij(emoji) {
        return existsIgnoreCase(this.state.emojis, emoji);
    }

    render() {
        let pic = {
            uri: 'https://notes.ipieter.be/chat/emojis/bob.png'
        };

        return (
            <View style={styles.container}>
                <FlatList
                    inverted
                    data={this.state.messages}
                    renderItem={
                        ({item}) =>
                            <View style={styles.item}>
                                <Image source={pic} style={styles.profile_img}/>
                                <View style={styles.message}>
                                    <View style={styles.metadata}>
                                        <Text style={styles.sender}>{item.sender}</Text>
                                        <Text style={styles.date}>{item.date}</Text>
                                    </View>
                                    {item.type === Config.MessageType.IMAGE_MESSAGE &&
                                    <Image source={{uri: Config.SERVER_URL + "images/" + item.img_identifier}}
                                           style={{width: 200, height: 200}}></Image>}
                                    {item.type === Config.MessageType.LOCATION_MESSAGE &&
                                    <MapView
                                        initialRegion={{
                                            latitude: item.location.coords.latitude,
                                            longitude: item.location.coords.longitude,
                                            latitudeDelta: 0.09,
                                            longitudeDelta: 0.09,
                                        }}
                                        style={{width: "100%", height: 200}}
                                    >
                                        <MapView.Marker
                                            coordinate={{
                                                latitude: item.location.coords.latitude,
                                                longitude: item.location.coords.longitude
                                            }}
                                            title="Location"
                                            description=""
                                        />
                                    </MapView>}
                                    {this.renderMessageBody(item.msg)}
                                </View>
                            </View>
                    }
                />
                <View style={styles.msgInputContainer}>
                    <TextInput
                        multiline={true}
                        style={styles.msgInput}
                        onChangeText={
                            (text) => this.setState({text})}
                        value={this.state.text}
                        placeholder="Message"/>

                    <TouchableOpacity onPress={() => {
                        if (this.state.hasImage) {
                            this.setState({hasImage: false})
                        } else {
                            this.openCamera()
                        }
                    }}>
                        <Image style={styles.button}
                               source={this.state.hasImage ? require('../res/camera_focus.png') : require('../res/camera_normal.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.addCoordinates()
                    }}>
                        <Image style={styles.button}
                               source={this.state.hasLocation ? require("../res/location_focus.png") : require('../res/location_normal.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.send(this.state.text)
                    }}>
                        <Image style={styles.button}
                               source={(this.isEmpty(this.state.text) && !this.state.hasImage && !this.state.hasLocation) ? require('../res/send_gray.png') : require('../res/send_focus.png')}/>
                    </TouchableOpacity>
                </View>
                {Platform.OS !== "android" && <KeyBoardSpacer/>}
            </View>
        );
    }
}

/**
 * Find the index of a string in an array of string.
 * @param {Array} array
 * @param {String} element
 * @returns {Number} the index of the element in the array or -1 if not found.
 */
function indexOfIgnoreCase(array, element) {
    var ret = -1;
    array.some(function (ele, index, array) {
        if (equalsIgnoreCase(element + ".png", ele)) {
            ret = index;
            return true;
        }
    });
    return ret;
}

/**
 * Test for String equality ignoring case.
 * @param {String} str1
 * @param {String} str2
 * @returns {Boolean} true if both string is equals ignoring case.
 */
function equalsIgnoreCase(str1, str2) {
    return str1.toLowerCase() === str2.toLowerCase();
}

/**
 * Test the existence of a string in an array of string.
 * @param {Array} array
 * @param {String} element
 * @returns {Boolean} true if found and false if not found.
 */
function existsIgnoreCase(array, element) {
    return -1 !== indexOfIgnoreCase(array, element);
}


const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'rgb(250,250,250)',
        },
        profile_img: {
            width: 40,
            height: 40,
            marginRight: 10,
            borderColor: '#bdc3c7',
            borderWidth: 1,
            borderRadius: 3
        },
        item: {
            flex: 1,
            padding: 10,
            flexDirection: 'row'
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
            marginTop: 4,
            marginBottom: 4,
            marginLeft: 4,
            height: 30,
            width: 30,
            opacity: 1,
            resizeMode: "contain"

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
        },
        code: {
            width: "100%",
            padding: 5,
            borderRadius: 3,
            borderWidth: 1,
            borderColor: "#dadedf",
            backgroundColor: "#f4f8f9"
        },
    })
;