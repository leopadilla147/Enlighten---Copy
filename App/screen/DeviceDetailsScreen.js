import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Switch, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref, update } from 'firebase/database';

const DeviceDetailsScreen = ({ route, navigation }) => {
  const { device, onUpdate } = route.params;
  const [roomName, setRoomName] = useState(device.name);
  const [isAutomatic, setIsAutomatic] = useState(device.isAutomatic);
  const [isOn, setIsOn] = useState(device.lightStatus);
  const [turnOnTime, setTurnOnTime] = useState(new Date());
  const [turnOffTime, setTurnOffTime] = useState(new Date());
  const [showOnPicker, setShowOnPicker] = useState(false);
  const [showOffPicker, setShowOffPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState(device.schedule ? device.schedule.days : []);

  useEffect(() => {
    if (device.schedule) {
      const [onHour, onMinute] = device.schedule.on.split(':');
      const [offHour, offMinute] = device.schedule.off.split(':');
      const currentDate = new Date();
      setTurnOnTime(new Date(currentDate.setHours(onHour, onMinute, 0, 0)));
      setTurnOffTime(new Date(currentDate.setHours(offHour, offMinute, 0, 0)));
      setSelectedDays(device.schedule.days);
    }
  }, [device]);

  const handleUpdateDevice = () => {

    if (isAutomatic && selectedDays.length === 0) {
      alert("You need to select at least one day.");
      return; 
    }
  

    let lightStatus;
    if (isAutomatic) {

      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
  
      const [onHour, onMinute] = [turnOnTime.getHours(), turnOnTime.getMinutes()];
      const [offHour, offMinute] = [turnOffTime.getHours(), turnOffTime.getMinutes()];
  
      if (
        (currentHour > onHour || (currentHour === onHour && currentMinute >= onMinute)) &&
        (currentHour < offHour || (currentHour === offHour && currentMinute < offMinute))
      ) {
        lightStatus = 'on';
      } else {
        lightStatus = 'off';
      }
    } else {
      lightStatus = isOn ? 'on' : 'off';
    }
  
    const updatedDevice = {
      ...device,
      name: roomName,
      isAutomatic,
      lightStatus,
      schedule: isAutomatic
        ? {
            on: `${turnOnTime.getHours()}:${turnOnTime.getMinutes().toString().padStart(2, '0')}`,
            off: `${turnOffTime.getHours()}:${turnOffTime.getMinutes().toString().padStart(2, '0')}`,
            days: selectedDays,
          }
        : null,
    };
  
    const db = getDatabase();
    const deviceRef = ref(db, `devices/${device.id}`);
  
    update(deviceRef, updatedDevice)
      .then(() => {
        onUpdate(updatedDevice);
        navigation.goBack();
      })
      .catch((error) => {
        console.error("Error updating device: ", error);
      });
  };
  


  const showTimePicker = (type) => {
    if (type === 'on') {
      setShowOnPicker(true);
    } else {
      setShowOffPicker(true);
    }
  };

  const onChange = (event, selectedDate, type) => {
    if (event.type === 'dismissed') {
      if (type === 'on') {
        setShowOnPicker(false);
      } else {
        setShowOffPicker(false);
      }
      return;
    }

    const currentDate = selectedDate || (type === 'on' ? turnOnTime : turnOffTime);
    if (type === 'on') {
      setShowOnPicker(false);
      setTurnOnTime(currentDate);
    } else {
      setShowOffPicker(false);
      setTurnOffTime(currentDate);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Room Name"
        value={roomName}
        onChangeText={setRoomName}
      />
      <Text style={styles.label}>Mode:</Text>
      <View style={styles.switchContainer}>
        <Text>Manual</Text>
        <Switch value={isAutomatic} onValueChange={setIsAutomatic} />
        <Text>Automatic</Text>
      </View>

      {!isAutomatic && (
        <>
          <Text style={styles.label}>Lights:</Text>
          <View style={styles.switchContainer}>
            <Text>Off</Text>
            <Switch value={isOn} onValueChange={setIsOn} />
            <Text>On</Text>
          </View>
        </>
      )}

      {isAutomatic && (
        <>
          <Button title="Set Turn On Time" onPress={() => showTimePicker('on')} />
          {showOnPicker && (
            <DateTimePicker
              value={turnOnTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => onChange(event, date, 'on')}
            />
          )}
          <Text style={styles.scheduleText}>
            Turn On Time: {`${turnOnTime.getHours()}:${turnOnTime.getMinutes().toString().padStart(2, '0')}`}
          </Text>

          <Button title="Set Turn Off Time" onPress={() => showTimePicker('off')} />
          {showOffPicker && (
            <DateTimePicker
              value={turnOffTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => onChange(event, date, 'off')}
            />
          )}
          <Text style={styles.scheduleText}>
            Turn Off Time: {`${turnOffTime.getHours()}:${turnOffTime.getMinutes().toString().padStart(2, '0')}`}
          </Text>

          <Text style={styles.label}>Select Days:</Text>
          <View style={styles.daysContainer}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <View key={day} style={styles.dayContainer}>
                <TouchableOpacity onPress={() => toggleDay(day)} style={styles.checkbox}>
                  <View
                    style={[
                      styles.checkboxInner,
                      selectedDays.includes(day) && styles.checked,
                    ]}
                  />
                </TouchableOpacity>
                <Text>{day}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Update Device" onPress={handleUpdateDevice} />
        <Button title="Cancel" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%', 
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: '#000',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#000',
  },
});

export default DeviceDetailsScreen;
