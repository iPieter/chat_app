import "react-native";
import React from "react";
import {View, Text, Image} from "react-native";

import renderer from "react-test-renderer";
import ChatScreen from "./ChatScreen";

test( "Emoji parsing test", async() => {
    var chatScreen = new ChatScreen();
    chatScreen.state.emojis = ["no-words-just-wine-and-a-hat.png", "nice.png", "perfection.png", "no-words.png", "marvelous-shirt.png", "more-marvelous-layes-combined-with-nn.png", "upside-down-marvelous.png", "marvelous-head.png", "dafuq.png", "no-words-just-jazz.png", "more-marvelous-things-i-dont-fucking-know-0.png", "more-marvelous-things-i-dont-fucking-know.png", "when-life-goes-according-to-plan-and-you-re-happy-about-the-future-again.png", "chat-backend.png", "nyhhh.png", "being-fucking-overworked.png", "more-marvelous-combined-with-nn.png", "being-productive.png", "more-marvelous-layers.png", "fucking-tired.png", "problem.png", "guess-i-buy.png", "more-marvelous-things-i-dont-fucking-know-2.png", "this-is-fine-frame.png", "alice.png", "being-fucking-tired-and-overworked.png", "oui-more-layers.png", "lasagna.png", "this-is-fine.png", "wtf-1.png", "no-words-just-wine.png", "i-am-proud-of-it.png", "the-scroll-of-truth.png", "kermit-strong-tea.png", "sincerely-shocked.png", "wtf.png", "unacknowledging-the-grim-dark-future.png", "idk-and-at-this-point-i-am-afraid-to-ask.png", "kill-me-plz.png", "more-marvelous-things-i-dont-fucking-know-1.png", "bob.png", "more-layers-kill-me.png", "survival.png"];
    expect( chatScreen.isEmoij("no-words-just-wine-and-a-hat") ).toBe(true);
});

test( "Emoji rendering 1", () => {
    var chatScreen = new ChatScreen();    
    chatScreen.state.emojis = ["no-words-just-wine-and-a-hat.png", "nice.png", "perfection.png", "no-words.png", "marvelous-shirt.png", "more-marvelous-layes-combined-with-nn.png", "upside-down-marvelous.png", "marvelous-head.png", "dafuq.png", "no-words-just-jazz.png", "more-marvelous-things-i-dont-fucking-know-0.png", "more-marvelous-things-i-dont-fucking-know.png", "when-life-goes-according-to-plan-and-you-re-happy-about-the-future-again.png", "chat-backend.png", "nyhhh.png", "being-fucking-overworked.png", "more-marvelous-combined-with-nn.png", "being-productive.png", "more-marvelous-layers.png", "fucking-tired.png", "problem.png", "guess-i-buy.png", "more-marvelous-things-i-dont-fucking-know-2.png", "this-is-fine-frame.png", "alice.png", "being-fucking-tired-and-overworked.png", "oui-more-layers.png", "lasagna.png", "this-is-fine.png", "wtf-1.png", "no-words-just-wine.png", "i-am-proud-of-it.png", "the-scroll-of-truth.png", "kermit-strong-tea.png", "sincerely-shocked.png", "wtf.png", "unacknowledging-the-grim-dark-future.png", "idk-and-at-this-point-i-am-afraid-to-ask.png", "kill-me-plz.png", "more-marvelous-things-i-dont-fucking-know-1.png", "bob.png", "more-layers-kill-me.png", "survival.png"];    
    expect(chatScreen.renderMessageBody("test :no-words: test")).toMatchSnapshot();
});

test( "Emoji rendering 2", () => {
    var chatScreen = new ChatScreen();    
    chatScreen.state.emojis = ["no-words-just-wine-and-a-hat.png", "nice.png", "perfection.png", "no-words.png", "marvelous-shirt.png", "more-marvelous-layes-combined-with-nn.png", "upside-down-marvelous.png", "marvelous-head.png", "dafuq.png", "no-words-just-jazz.png", "more-marvelous-things-i-dont-fucking-know-0.png", "more-marvelous-things-i-dont-fucking-know.png", "when-life-goes-according-to-plan-and-you-re-happy-about-the-future-again.png", "chat-backend.png", "nyhhh.png", "being-fucking-overworked.png", "more-marvelous-combined-with-nn.png", "being-productive.png", "more-marvelous-layers.png", "fucking-tired.png", "problem.png", "guess-i-buy.png", "more-marvelous-things-i-dont-fucking-know-2.png", "this-is-fine-frame.png", "alice.png", "being-fucking-tired-and-overworked.png", "oui-more-layers.png", "lasagna.png", "this-is-fine.png", "wtf-1.png", "no-words-just-wine.png", "i-am-proud-of-it.png", "the-scroll-of-truth.png", "kermit-strong-tea.png", "sincerely-shocked.png", "wtf.png", "unacknowledging-the-grim-dark-future.png", "idk-and-at-this-point-i-am-afraid-to-ask.png", "kill-me-plz.png", "more-marvelous-things-i-dont-fucking-know-1.png", "bob.png", "more-layers-kill-me.png", "survival.png"];    
    expect(chatScreen.renderMessageBody(":no-words:")).toMatchSnapshot();
});

test( "Emoji rendering 3", () => {
    var chatScreen = new ChatScreen();    
    chatScreen.state.emojis = ["no-words-just-wine-and-a-hat.png", "nice.png", "perfection.png", "no-words.png", "marvelous-shirt.png", "more-marvelous-layes-combined-with-nn.png", "upside-down-marvelous.png", "marvelous-head.png", "dafuq.png", "no-words-just-jazz.png", "more-marvelous-things-i-dont-fucking-know-0.png", "more-marvelous-things-i-dont-fucking-know.png", "when-life-goes-according-to-plan-and-you-re-happy-about-the-future-again.png", "chat-backend.png", "nyhhh.png", "being-fucking-overworked.png", "more-marvelous-combined-with-nn.png", "being-productive.png", "more-marvelous-layers.png", "fucking-tired.png", "problem.png", "guess-i-buy.png", "more-marvelous-things-i-dont-fucking-know-2.png", "this-is-fine-frame.png", "alice.png", "being-fucking-tired-and-overworked.png", "oui-more-layers.png", "lasagna.png", "this-is-fine.png", "wtf-1.png", "no-words-just-wine.png", "i-am-proud-of-it.png", "the-scroll-of-truth.png", "kermit-strong-tea.png", "sincerely-shocked.png", "wtf.png", "unacknowledging-the-grim-dark-future.png", "idk-and-at-this-point-i-am-afraid-to-ask.png", "kill-me-plz.png", "more-marvelous-things-i-dont-fucking-know-1.png", "bob.png", "more-layers-kill-me.png", "survival.png"];    
    expect(chatScreen.renderMessageBody("Test")).toMatchSnapshot();
});

test( "IsEmpty test", () => {
    var chatScreen = new ChatScreen();
    expect(chatScreen.isEmpty("")).toBe(true);
    expect(chatScreen.isEmpty("    ")).toBe(true);
    expect(chatScreen.isEmpty("\t")).toBe(true);
    expect(chatScreen.isEmpty("f")).toBe(false);
});

test( "Code extraction tests", () => {
    var chatScreen = new ChatScreen();
    expect( JSON.stringify(chatScreen.extractCode("")) ).toBe( JSON.stringify([""]) );
    expect( JSON.stringify(chatScreen.extractCode("test")) ).toBe( JSON.stringify(["test"]) );
    expect( JSON.stringify(chatScreen.extractCode("%%test%%")) ).toBe( JSON.stringify(["","%%test%%",""]) );
    expect( JSON.stringify(chatScreen.extractCode("abc%%test%%def")) ).toBe( JSON.stringify(["abc","%%test%%","def"]) );
    expect( JSON.stringify(chatScreen.extractCode("abc%%\ntest%%def")) ).toBe( JSON.stringify(["abc","%%\ntest%%","def"]) );
    expect( JSON.stringify(chatScreen.extractCode("abc%%\ntest\n%%def")) ).toBe( JSON.stringify(["abc","%%\ntest\n%%","def"]) );
    expect( JSON.stringify(chatScreen.extractCode("abc%%\ntest%%\ndef")) ).toBe( JSON.stringify(["abc","%%\ntest%%\n","def"]) );
});