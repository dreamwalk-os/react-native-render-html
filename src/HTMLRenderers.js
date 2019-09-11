import React from "react";
import { TouchableOpacity, Text, View, Dimensions, ActivityIndicator, Linking } from "react-native";
import { _constructStyles, _getElementClassStyles } from "./HTMLStyles";
import HTMLImage from "./HTMLImage";

import TouchableCard from "../../../src/components/TouchableCard";

import WebView from "react-native-android-fullscreen-webview-video";

export function a(htmlAttribs, children, convertedCSSStyles, passProps) {
  const style = _constructStyles({
    tagName: "a",
    htmlAttribs,
    passProps,
    styleSet: passProps.parentWrapper === "Text" ? "TEXT" : "VIEW"
  });
  // !! This deconstruction needs to happen after the styles construction since
  // the passed props might be altered by it !!
  const { parentWrapper, onLinkPress, key, data } = passProps;
  const onPress = evt =>
    onLinkPress && htmlAttribs && htmlAttribs.href ? onLinkPress(evt, htmlAttribs.href, htmlAttribs) : undefined;

  if (parentWrapper === "Text") {
    return (
      <Text {...passProps} style={style} onPress={onPress} key={key}>
        {children || data}
      </Text>
    );
  } else {
    return (
      <TouchableOpacity onPress={onPress} key={key}>
        {children || data}
      </TouchableOpacity>
    );
  }
}

export function img(htmlAttribs, children, convertedCSSStyles, passProps = {}) {
  if (!htmlAttribs.src) {
    return false;
  }

  const style = _constructStyles({
    tagName: "img",
    htmlAttribs,
    passProps,
    styleSet: "IMAGE"
  });
  const { src, alt, width, height } = htmlAttribs;
  return <HTMLImage source={{ uri: src }} alt={alt} width={width} height={height} style={style} {...passProps} />;
}

export function ul(htmlAttribs, children, convertedCSSStyles, passProps = {}) {
  const style = _constructStyles({
    tagName: "ul",
    htmlAttribs,
    passProps,
    styleSet: "VIEW"
  });
  const { rawChildren, nodeIndex, key, baseFontStyle, listsPrefixesRenderers } = passProps;
  const baseFontSize = baseFontStyle.fontSize || 14;

  children =
    children &&
    children.map((child, index) => {
      const rawChild = rawChildren[index];
      let prefix = false;
      const rendererArgs = [
        htmlAttribs,
        children,
        convertedCSSStyles,
        {
          ...passProps,
          index
        }
      ];

      if (rawChild) {
        if (rawChild.parentTag === "ul") {
          prefix =
            listsPrefixesRenderers && listsPrefixesRenderers.ul ? (
              listsPrefixesRenderers.ul(...rendererArgs)
            ) : (
              <View
                style={{
                  marginRight: 10,
                  width: baseFontSize / 2.8,
                  height: baseFontSize / 2.8,
                  marginTop: baseFontSize / 2,
                  borderRadius: baseFontSize / 2.8,
                  backgroundColor: "black"
                }}
              />
            );
        } else if (rawChild.parentTag === "ol") {
          prefix =
            listsPrefixesRenderers && listsPrefixesRenderers.ol ? (
              listsPrefixesRenderers.ol(...rendererArgs)
            ) : (
              <Text style={{ marginRight: 5, fontSize: baseFontSize }}>{index + 1})</Text>
            );
        }
      }
      return (
        <View key={`list-${nodeIndex}-${index}-${key}`} style={{ flexDirection: "row", marginBottom: 10 }}>
          {prefix}
          <View style={{ flex: 1 }}>{child}</View>
        </View>
      );
    });
  return (
    <View style={style} key={key}>
      {children}
    </View>
  );
}
export const ol = ul;

export function blockquote(htmlAttribs, children, convertedCSSStyles, passProps) {
  return children.map(child => {
    return (
      <TouchableCard
        containerStyle={{ marginLeft: -30, marginRight: -30, marginBottom: -15 }}
        touchableBorder={child[0].props.children[1][0][0].props.linkBorderColour}
        text={child[0].props.children[1][0][0].props.rawChildren[0].data}
        onPress={() => Linking.openURL(child[0].props.children[1][0][0].props.rawChildren[0].parent.attribs.href)}
      />
    );
  });
}

export function iframe(htmlAttribs, children, convertedCSSStyles, passProps) {
  if (!htmlAttribs.src) {
    return false;
  }
  const { staticContentMaxWidth, tagsStyles, classesStyles, onViewTranscriptPress, increaseVideoCount } = passProps;

  const tagStyleHeight = tagsStyles.iframe && tagsStyles.iframe.height;
  const tagStyleWidth = tagsStyles.iframe && tagsStyles.iframe.width;

  const classStyles = _getElementClassStyles(htmlAttribs, classesStyles);
  const classStyleWidth = classStyles.width;
  const classStyleHeight = classStyles.height;

  const attrHeight = htmlAttribs.height ? parseInt(htmlAttribs.height) : false;
  const attrWidth = htmlAttribs.width ? parseInt(htmlAttribs.width) : false;

  const height = attrHeight || classStyleHeight || tagStyleHeight || 200;
  const width = attrWidth || classStyleWidth || tagStyleWidth || staticContentMaxWidth;

  const style = _constructStyles({
    tagName: "iframe",
    htmlAttribs,
    passProps,
    styleSet: "VIEW",
    additionalStyles: [{ height, width }]
  });

  // Cosmic JS sometimes tries to load www's
  if (!htmlAttribs.src.includes("https://")) {
    htmlAttribs.src = htmlAttribs.src = `https://${htmlAttribs.src}`;
  }

  const onPress = evt => (onViewTranscriptPress ? onViewTranscriptPress(htmlAttribs.src) : undefined);

  if (increaseVideoCount) {
    increaseVideoCount(htmlAttribs.src);
  }

  // useWebKit sores memory usage when multiple WebView's are used on the same screen
  return (
    <View style={{ backgroundColor: "white", overflow: "hidden", paddingTop: 20, marginLeft: -30, marginRight: -30 }}>
      <WebView
        //useWebKit
        key={passProps.key}
        source={{ uri: htmlAttribs.src }}
        style={[style, { backgroundColor: "white", opacity: 0.99 }]}
        allowsInlineMediaPlayback={false}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        mixedContentMode="always"
      />

      <View style={{ height: 56, width: width, marginLeft: -30, marginRight: -30 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "flex-end",
            paddingTop: 15,
            backgroundColor: "white",
            paddingRight: 5
          }}
          onPress={onPress}
        >
          <Text
            style={{
              fontFamily: "Quicksand-Bold",
              fontSize: 16,
              color: "#5B7D86"
            }}
          >
            VIEW TRANSCRIPT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function br(htlmAttribs, children, convertedCSSStyles, passProps) {
  return (
    <Text style={{ height: 1.2 * passProps.emSize, flex: 1 }} key={passProps.key}>
      {"\n"}
    </Text>
  );
}

export function textwrapper(htmlAttribs, children, convertedCSSStyles, { key }) {
  return (
    <Text key={key} style={convertedCSSStyles}>
      {children}
    </Text>
  );
}
