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
    TouchableWithoutFeedback
} from 'react-native';
import KeyBoardSpacer from "react-native-keyboard-spacer";

export default class CreateChannelScreen extends React.Component {
    static navigationOptions = {
        title: 'Create chat',
    }

    render() {
        return (
            <View style={styles.container}>
                <View>
                    <Button title="New DM"
                            onPress={() => this.props.navigation.navigate("CreatePrivateChat")}/>
                    <Button title="New group" onPress={() => {
                        this.props.navigation.navigate("CreateGroupChat")
                    }}/>
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(250,250,250)',
        flexDirection: 'column',
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "space-between"
    },
    header: {
        fontWeight: 'bold',
        justifyContent: "center"
    },
    item: {
        padding: 10,
    }
});