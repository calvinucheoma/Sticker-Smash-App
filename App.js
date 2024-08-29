import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import ImageViewer from "./components/ImageViewer";
import CustomButton from "./components/Button";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import IconButton from "./components/IconButton";
import CircleButton from "./components/CircleButton";
import EmojiPicker from "./components/EmojiPicker";
import EmojiList from "./components/EmojiList";
import EmojiSticker from "./components/EmojiSticker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import domtoimage from "dom-to-image";

const placeholderImage = require("./assets/images/background-image.png");

export default function App() {
  const [showAppOptions, setShowAppOptions] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [pickedEmoji, setPickedEmoji] = useState(null);

  const [selectedImageFromGallery, setSelectedImageFromGallery] =
    useState(null);

  const [status, requestPermission] = MediaLibrary.usePermissions();

  if (status === null) {
    requestPermission();
  }

  const imageRef = useRef();

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // console.log(result);
      const image = result.assets[0].uri;
      setSelectedImageFromGallery(image);
      setShowAppOptions(true);
    } else {
      alert("You did not select any image.");
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    if (Platform.OS !== "web") {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert("Saved!");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement("a");
        link.download = "sticker-smash.jpeg";
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer
            placeholderImage={placeholderImage}
            selectedImage={selectedImageFromGallery}
          />
          {pickedEmoji && (
            <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
          )}
        </View>
      </View>

      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton
              icon="save-alt"
              label="Save"
              onPress={onSaveImageAsync}
            />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <CustomButton
            label="Choose a photo"
            theme="primary"
            onPress={pickImageAsync}
          />
          <CustomButton
            label="Use this photo"
            onPress={() => setShowAppOptions(true)}
          />
        </View>
      )}

      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>

      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});

/*

The 'collapsable' prop is set to false in the above code because this <View> component is used to take 
a screenshot of the background image and the emoji sticker. The rest of the contents of the app screen 
(such as buttons) are not part of the screenshot.

*/

/*

A splash screen is a screen that is visible before the contents of the app has had a chance to load. 
It hides once the app is ready for use and the content is ready to be displayed.

The splash screen is configured by defining a path to the "splash.image" property in the app.json file.
 It has a current value of "./assets/splash.png" path. This is already done by default when a new Expo 
 project is created.

*/

/*

You can make the splash screen stick around for longer by manually controlling when it is hidden, 
rather than the default of automatically hiding it as soon as the app is ready.

Start by running the following command: npx expo install expo-splash-screen.

Next, add the following code in App.js to delay hiding the splash screen for five seconds.

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 5000);


Similar to splash screen image, the icon is configured by defining a path to the "icon" property in the
app.json file. It has a current value of "./assets/icon.png".

Eventually, when you build the app for the app stores, Expo Application Services (EAS) will take this 
image and create optimized icon for every device.

*/
