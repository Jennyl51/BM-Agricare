import { View, Text, StyleSheet, Pressable, ImageBackground, Image, TextInput} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function TCELoginPage() {
    const backgroundImage = require('@/assets/images/LoginBackgroundOne.png');
    const brandImage = require('@/assets/images/brand_name.png');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
        <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode = 'cover'
      >
        <View style={styles.container}>
            <Image source={brandImage} 
            style={styles.logo} 
            resizeMode="contain" />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

        </View>

        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    input: {
        width: '80%',
        padding: 14,
        borderWidth: 1,
        borderRadius: 14,
        fontSize: 16,
    },

    logo: {
        width: 313 * 1.1,
        height: 118 * 1.1,
        alignSelf: 'center',
        marginBottom: 20,
    },
});