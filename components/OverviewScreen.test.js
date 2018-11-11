import "react-native";
import React from "react";
import {View, Text, Image} from "react-native";

import renderer from "react-test-renderer";
import OverviewScreen from "./OverviewScreen";

test( "IsEmpty test", () => {
    var overviewScreen = new OverviewScreen();
    expect(overviewScreen.limitSentence("Test")).toBe("Test");
    expect(overviewScreen.limitSentence("Test\n")).toBe("Test");
});