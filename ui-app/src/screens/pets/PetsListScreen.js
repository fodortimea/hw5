// src/screens/pets/PetsListScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { petsService } from '../../services/pets';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';

export function PetsListScreen() {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { directMode } = useAuth();

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      const data = await petsService.getAll(directMode);
      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert(
        'Error',
        'Failed to load pets. Make sure your infrastructure is running.'
      );
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  };

  const createTestPet = async () => {
    try {
      const testPet = {
        name: `Test Pet ${Date.now()}`,
        breed: 'Golden Retriever',
        age: 3,
        owner_name: 'Test Owner',
      };

      await petsService.create(testPet, directMode);
      Alert.alert('Success', 'Test pet created successfully!');
      await loadPets();
    } catch (error) {
      console.error('Error creating test pet:', error);
      Alert.alert('Error', 'Failed to create test pet');
    }
  };

  const renderPetItem = ({ item }) => (
    <TouchableOpacity style={styles.petItem}>
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petDetails}>
          {item.breed} • {item.age} years old
        </Text>
        <Text style={styles.petOwner}>Owner: {item.owner_name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading pets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pets</Text>
        <TouchableOpacity style={styles.addButton} onPress={createTestPet}>
          <Text style={styles.addButtonText}>+ Add Test Pet</Text>
        </TouchableOpacity>
      </View>

      {directMode && (
        <View style={styles.directModeWarning}>
          <Text style={styles.warningText}>
            🔧 Direct Mode Active - Bypassing Authentication
          </Text>
        </View>
      )}

      <FlatList
        data={pets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pets found</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Test Pet" to create your first pet
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.medium,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.large,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  directModeWarning: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  warningText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  listContainer: {
    padding: SPACING.md,
  },
  petItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  petDetails: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  petOwner: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});