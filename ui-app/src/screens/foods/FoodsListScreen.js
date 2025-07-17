// src/screens/foods/FoodsListScreen.js
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
import { foodsService } from '../../services/foods';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';

export function FoodsListScreen() {
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { directMode } = useAuth();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setIsLoading(true);
      const data = await foodsService.getAll(directMode);
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading foods:', error);
      Alert.alert(
        'Error',
        'Failed to load foods. Make sure your infrastructure is running.'
      );
      setFoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoods();
    setRefreshing(false);
  };

  const createTestFood = async () => {
    try {
      const testFood = {
        name: `Test Food ${Date.now()}`,
        brand: 'Royal Canin',
        price: 29.99,
        stock: 15,
        category: 'dog',
        description: 'High-quality test food for testing purposes',
      };

      await foodsService.create(testFood, directMode);
      Alert.alert('Success', 'Test food created successfully!');
      await loadFoods();
    } catch (error) {
      console.error('Error creating test food:', error);
      Alert.alert('Error', 'Failed to create test food');
    }
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? `$${price.toFixed(2)}` : '$0.00';
  };

  const getStockStatus = (stock) => {
    if (stock <= 5) return { text: 'Low Stock', color: COLORS.error };
    if (stock <= 10) return { text: 'Medium Stock', color: COLORS.warning };
    return { text: 'In Stock', color: COLORS.success };
  };

  const renderFoodItem = ({ item }) => {
    const stockStatus = getStockStatus(item.stock || 0);
    
    return (
      <TouchableOpacity style={styles.foodItem}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodBrand}>{item.brand}</Text>
          <Text style={styles.foodDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.foodFooter}>
            <Text style={styles.foodPrice}>{formatPrice(item.price)}</Text>
            <View style={styles.stockContainer}>
              <Text style={[styles.stockText, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
              <Text style={styles.stockCount}>({item.stock} units)</Text>
            </View>
          </View>
          <Text style={styles.foodCategory}>Category: {item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading foods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Foods</Text>
        <TouchableOpacity style={styles.addButton} onPress={createTestFood}>
          <Text style={styles.addButtonText}>+ Add Test Food</Text>
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
        data={foods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No foods found</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Test Food" to create your first food item
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
  foodItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  foodBrand: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  foodDescription: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  foodPrice: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stockText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  stockCount: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
  },
  foodCategory: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
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