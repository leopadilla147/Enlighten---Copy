import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';

const AccountScreen = ({ navigation }) => {
  // Simulate user data
  const user = {
    name: "John Doe",
    description: "This is a sample description.",
    profilePic: null, // Change this to a URL or path if a user uploads a picture
  };

  const defaultProfilePic = require('../assets/Profile.png'); // Default profile picture URL

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image 
          source={require('../assets/Profile.png')} 
          style={styles.profilePic} 
        />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.description}>{user.description}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between', // Space between profile info and button
      padding: 20,
    },
    profileContainer: {
      flex: 1, // This takes up the remaining space
      justifyContent: 'center', // Center profile information vertically
      alignItems: 'center',
    },
    profilePic: {
      width: 150,
      height: 150,
      borderRadius: 50, // Make it circular
      marginBottom: 20,
    },
    userName: {
      fontSize: 24,
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    buttonContainer: {
      marginBottom: 20, // Add some margin at the bottom for aesthetics
    },
  });

export default AccountScreen;