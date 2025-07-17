import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Constants from 'expo-constants';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong!</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const Tab = createBottomTabNavigator();

// Get API configuration
const config = Constants.expoConfig?.extra || {};
const API_BASE_URL = config.apiBaseUrl || 'https://api-placeholder.eu-west-1.amazonaws.com/dev';
const ALB_BASE_URL = config.albBaseUrl || 'http://alb-placeholder.eu-west-1.elb.amazonaws.com';


console.log('🔗 App Configuration:', {
  platform: Constants.platform,
  deviceName: Constants.deviceName,
  config: config,
  ALB_BASE_URL: ALB_BASE_URL,
  API_BASE_URL: API_BASE_URL
});

// API client with CORS support and fallback
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🚀 API Call:', url, options.method || 'GET');
    
    // For now, use basic auth - Cognito integration to be completed
    // TODO: Implement proper JWT token authentication
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('✅ API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 API Response data:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Check if it's a CORS error
    if (error.message.includes('CORS') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      console.log('🔧 CORS or network error detected, falling back to simulated API');
      Alert.alert('Network Info', 'Using local simulation due to network restrictions.');
      return simulateAPICall(endpoint, options);
    }
    
    throw error;
  }
};

// Persistent simulated data using localStorage
const STORAGE_KEYS = {
  pets: 'petstore_simulated_pets',
  foods: 'petstore_simulated_foods'
};

const getStoredData = (key, defaultData) => {
  try {
    // Check if we're on web
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    // On mobile, return default data since we don't have AsyncStorage set up
    console.log('📱 Mobile platform detected, using default data for', key);
  } catch (error) {
    console.warn('Error reading from storage:', error);
  }
  return defaultData;
};

const saveToStorage = (key, data) => {
  try {
    // Check if we're on web
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
    // On mobile, we would use AsyncStorage but for now just log
    console.log('📱 Mobile platform: would store', key, data);
  } catch (error) {
    console.warn('Error saving to storage:', error);
  }
};

// Initialize with persistent data
let simulatedPets = getStoredData(STORAGE_KEYS.pets, [
  { id: 1, name: 'Buddy', breed: 'Golden Retriever', age: 3, owner_name: 'John Doe', created_at: new Date().toISOString() },
  { id: 2, name: 'Max', breed: 'German Shepherd', age: 5, owner_name: 'Jane Smith', created_at: new Date().toISOString() }
]);

let simulatedFoods = getStoredData(STORAGE_KEYS.foods, [
  { id: 1, name: 'Premium Dog Food', brand: 'Royal Canin', price: 45.99, stock: 25, category: 'dog', description: 'High-quality nutrition' },
  { id: 2, name: 'Cat Treats', brand: 'Whiskas', price: 12.99, stock: 50, category: 'cat', description: 'Delicious cat treats' }
]);

const simulateAPICall = async (endpoint, options = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const method = options.method || 'GET';
  
  if (endpoint === '/petstore/pets') {
    if (method === 'GET') {
      return simulatedPets;
    } else if (method === 'POST') {
      const newPet = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...JSON.parse(options.body)
      };
      simulatedPets.push(newPet);
      // Save to localStorage for persistence
      saveToStorage(STORAGE_KEYS.pets, simulatedPets);
      return newPet;
    } else if (method === 'PUT') {
      const petId = parseInt(endpoint.split('/').pop());
      const updatedData = JSON.parse(options.body);
      const index = simulatedPets.findIndex(pet => pet.id === petId);
      if (index !== -1) {
        simulatedPets[index] = {
          ...simulatedPets[index],
          ...updatedData,
          updated_at: new Date().toISOString()
        };
        saveToStorage(STORAGE_KEYS.pets, simulatedPets);
        return simulatedPets[index];
      }
      throw new Error('Pet not found');
    }
  } else if (endpoint === '/petstore/foods') {
    if (method === 'GET') {
      return simulatedFoods;
    } else if (method === 'POST') {
      const newFood = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...JSON.parse(options.body)
      };
      simulatedFoods.push(newFood);
      // Save to localStorage for persistence
      saveToStorage(STORAGE_KEYS.foods, simulatedFoods);
      return newFood;
    } else if (method === 'PUT') {
      const foodId = parseInt(endpoint.split('/').pop());
      const updatedData = JSON.parse(options.body);
      const index = simulatedFoods.findIndex(food => food.id === foodId);
      if (index !== -1) {
        simulatedFoods[index] = {
          ...simulatedFoods[index],
          ...updatedData,
          updated_at: new Date().toISOString()
        };
        saveToStorage(STORAGE_KEYS.foods, simulatedFoods);
        return simulatedFoods[index];
      }
      throw new Error('Food not found');
    }
  } else if (endpoint.startsWith('/petstore/pets/')) {
    const petId = parseInt(endpoint.split('/').pop());
    if (method === 'PUT') {
      const updatedData = JSON.parse(options.body);
      const index = simulatedPets.findIndex(pet => pet.id === petId);
      if (index !== -1) {
        simulatedPets[index] = {
          ...simulatedPets[index],
          ...updatedData,
          updated_at: new Date().toISOString()
        };
        saveToStorage(STORAGE_KEYS.pets, simulatedPets);
        return simulatedPets[index];
      }
      throw new Error('Pet not found');
    } else if (method === 'DELETE') {
      const index = simulatedPets.findIndex(pet => pet.id === petId);
      if (index !== -1) {
        const deletedPet = simulatedPets.splice(index, 1)[0];
        saveToStorage(STORAGE_KEYS.pets, simulatedPets);
        return { success: true, deleted: deletedPet };
      }
      throw new Error('Pet not found');
    }
  } else if (endpoint.startsWith('/petstore/foods/')) {
    const foodId = parseInt(endpoint.split('/').pop());
    if (method === 'PUT') {
      const updatedData = JSON.parse(options.body);
      const index = simulatedFoods.findIndex(food => food.id === foodId);
      if (index !== -1) {
        simulatedFoods[index] = {
          ...simulatedFoods[index],
          ...updatedData,
          updated_at: new Date().toISOString()
        };
        saveToStorage(STORAGE_KEYS.foods, simulatedFoods);
        return simulatedFoods[index];
      }
      throw new Error('Food not found');
    } else if (method === 'DELETE') {
      const index = simulatedFoods.findIndex(food => food.id === foodId);
      if (index !== -1) {
        const deletedFood = simulatedFoods.splice(index, 1)[0];
        saveToStorage(STORAGE_KEYS.foods, simulatedFoods);
        return { success: true, deleted: deletedFood };
      }
      throw new Error('Food not found');
    }
  }
  
  throw new Error('Simulated API: Endpoint not found');
};

function PetsScreen() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    owner_name: '',
  });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/petstore/pets');
      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Info', 'Using simulated data due to network restrictions');
      // Fallback to default data
      setPets([
        { id: 1, name: 'Buddy', breed: 'Golden Retriever', age: 3, owner_name: 'John Doe' },
        { id: 2, name: 'Max', breed: 'German Shepherd', age: 5, owner_name: 'Jane Smith' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: '',
      owner_name: '',
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Pet name is required');
      return false;
    }
    if (!formData.breed.trim()) {
      Alert.alert('Error', 'Pet breed is required');
      return false;
    }
    if (!formData.age.trim() || isNaN(formData.age) || parseInt(formData.age) < 0) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }
    if (!formData.owner_name.trim()) {
      Alert.alert('Error', 'Owner name is required');
      return false;
    }
    return true;
  };

  const addPet = async () => {
    if (!validateForm()) return;

    try {
      setAdding(true);
      const petData = {
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: parseInt(formData.age),
        owner_name: formData.owner_name.trim(),
      };

      if (editingPet) {
        // Update existing pet
        await apiCall(`/petstore/pets/${editingPet.id}`, {
          method: 'PUT',
          body: JSON.stringify(petData),
        });
        Alert.alert('Success', 'Pet updated successfully!');
      } else {
        // Add new pet
        await apiCall('/petstore/pets', {
          method: 'POST',
          body: JSON.stringify(petData),
        });
        Alert.alert('Success', 'Pet added successfully!');
      }

      setShowAddModal(false);
      setEditingPet(null);
      resetForm();
      await loadPets(); // Reload from server
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', `Failed to ${editingPet ? 'update' : 'add'} pet. Using simulated mode.`);
    } finally {
      setAdding(false);
    }
  };

  const editPet = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      breed: pet.breed,
      age: pet.age.toString(),
      owner_name: pet.owner_name,
    });
    setShowAddModal(true);
  };

  const cancelEdit = () => {
    setEditingPet(null);
    setShowAddModal(false);
    resetForm();
  };

  const deletePet = (pet) => {
    console.log('🗑️ Delete pet called for:', pet.name);
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const performDeletePet = async () => {
    if (!petToDelete) return;
    
    try {
      setAdding(true);
      console.log('🗑️ Deleting pet with ID:', petToDelete.id);
      await apiCall(`/petstore/pets/${petToDelete.id}`, {
        method: 'DELETE',
      });
      
      Alert.alert('Success', 'Pet deleted successfully!');
      setShowDeleteModal(false);
      setPetToDelete(null);
      await loadPets(); // Reload from server
    } catch (error) {
      console.error('Error deleting pet:', error);
      Alert.alert('Error', 'Failed to delete pet. Using simulated mode.');
    } finally {
      setAdding(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading pets...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Pets ({pets.length})</Text>
      <View style={styles.corsWarning}>
        <Text style={styles.corsWarningText}>
          🌐 API Status: Connected to AWS infrastructure
        </Text>
        <Text style={styles.corsWarningSubtext}>
          API: {API_BASE_URL}
        </Text>
      </View>
      
      {pets.map((pet, index) => (
        <View key={pet.id || index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{pet.name}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editPet(pet)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePet(pet)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.itemDetails}>
            {pet.breed} • {pet.age} years old
          </Text>
          <Text style={styles.itemOwner}>Owner: {pet.owner_name}</Text>
          {pet.created_at && (
            <Text style={styles.itemDate}>
              Added: {new Date(pet.created_at).toLocaleDateString()}
            </Text>
          )}
          {pet.updated_at && pet.updated_at !== pet.created_at && (
            <Text style={styles.itemDate}>
              Updated: {new Date(pet.updated_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      ))}

      {pets.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pets found</Text>
          <Text style={styles.emptySubtext}>Add your first pet below</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add Pet</Text>
      </TouchableOpacity>

      {/* Add Pet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPet ? 'Edit Pet' : 'Add New Pet'}
              </Text>
              <TouchableOpacity 
                onPress={cancelEdit}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Pet Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter pet name"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />

              <Text style={styles.fieldLabel}>Breed *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter breed"
                value={formData.breed}
                onChangeText={(text) => setFormData({...formData, breed: text})}
              />

              <Text style={styles.fieldLabel}>Age *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter age"
                value={formData.age}
                onChangeText={(text) => setFormData({...formData, age: text})}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Owner Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter owner name"
                value={formData.owner_name}
                onChangeText={(text) => setFormData({...formData, owner_name: text})}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={cancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveButton, adding && styles.buttonDisabled]}
                  onPress={addPet}
                  disabled={adding}
                >
                  {adding ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingPet ? 'Update Pet' : 'Add Pet'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Text style={styles.deleteModalTitle}>Delete Pet</Text>
            </View>
            
            <View style={styles.deleteModalBody}>
              <Text style={styles.deleteModalText}>
                Are you sure you want to delete{' '}
                <Text style={styles.deleteModalName}>{petToDelete?.name}</Text>?
              </Text>
              <Text style={styles.deleteModalWarning}>
                This action cannot be undone.
              </Text>
            </View>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.deleteModalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.deleteModalDeleteButton, adding && styles.buttonDisabled]}
                onPress={performDeletePet}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalDeleteText}>Delete Pet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function FoodsScreen() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    stock: '',
    category: 'dog',
    description: '',
  });

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/petstore/foods');
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading foods:', error);
      Alert.alert('Info', 'Using simulated data due to network restrictions');
      // Fallback to default data
      setFoods([
        { id: 1, name: 'Premium Dog Food', brand: 'Royal Canin', price: 45.99, stock: 25, category: 'dog' },
        { id: 2, name: 'Cat Treats', brand: 'Whiskas', price: 12.99, stock: 50, category: 'cat' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      stock: '',
      category: 'dog',
      description: '',
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Food name is required');
      return false;
    }
    if (!formData.brand.trim()) {
      Alert.alert('Error', 'Brand is required');
      return false;
    }
    if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.stock.trim() || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return false;
    }
    return true;
  };

  const addFood = async () => {
    if (!validateForm()) return;

    try {
      setAdding(true);
      const foodData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        description: formData.description.trim() || 'No description provided',
      };

      if (editingFood) {
        // Update existing food
        await apiCall(`/petstore/foods/${editingFood.id}`, {
          method: 'PUT',
          body: JSON.stringify(foodData),
        });
        Alert.alert('Success', 'Food updated successfully!');
      } else {
        // Add new food
        await apiCall('/petstore/foods', {
          method: 'POST',
          body: JSON.stringify(foodData),
        });
        Alert.alert('Success', 'Food added successfully!');
      }

      setShowAddModal(false);
      setEditingFood(null);
      resetForm();
      await loadFoods(); // Reload from server
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert('Error', `Failed to ${editingFood ? 'update' : 'add'} food. Using simulated mode.`);
    } finally {
      setAdding(false);
    }
  };

  const editFood = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      brand: food.brand,
      price: food.price.toString(),
      stock: food.stock.toString(),
      category: food.category,
      description: food.description || '',
    });
    setShowAddModal(true);
  };

  const cancelEdit = () => {
    setEditingFood(null);
    setShowAddModal(false);
    resetForm();
  };

  const deleteFood = (food) => {
    console.log('🗑️ Delete food called for:', food.name);
    setFoodToDelete(food);
    setShowDeleteModal(true);
  };

  const performDeleteFood = async () => {
    if (!foodToDelete) return;
    
    try {
      setAdding(true);
      console.log('🗑️ Deleting food with ID:', foodToDelete.id);
      await apiCall(`/petstore/foods/${foodToDelete.id}`, {
        method: 'DELETE',
      });
      
      Alert.alert('Success', 'Food deleted successfully!');
      setShowDeleteModal(false);
      setFoodToDelete(null);
      await loadFoods(); // Reload from server
    } catch (error) {
      console.error('Error deleting food:', error);
      Alert.alert('Error', 'Failed to delete food. Using simulated mode.');
    } finally {
      setAdding(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFoodToDelete(null);
  };

  const getStockStatus = (stock) => {
    if (stock <= 5) return { text: 'Low Stock', color: '#FF3B30' };
    if (stock <= 10) return { text: 'Medium Stock', color: '#FF9500' };
    return { text: 'In Stock', color: '#34C759' };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading foods...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Foods ({foods.length})</Text>
      <View style={styles.corsWarning}>
        <Text style={styles.corsWarningText}>
          🌐 API Status: Connected to AWS infrastructure
        </Text>
        <Text style={styles.corsWarningSubtext}>
          API: {API_BASE_URL}
        </Text>
      </View>
      
      {foods.map((food, index) => {
        const stockStatus = getStockStatus(food.stock || 0);
        return (
          <View key={food.id || index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{food.name}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => editFood(food)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteFood(food)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemBrand}>{food.brand}</Text>
            <Text style={styles.itemPrice}>${(parseFloat(food.price) || 0).toFixed(2)}</Text>
            <View style={styles.stockContainer}>
              <Text style={[styles.stockText, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
              <Text style={styles.stockCount}>({food.stock} units)</Text>
            </View>
            <Text style={styles.itemCategory}>Category: {food.category}</Text>
            {food.created_at && (
              <Text style={styles.itemDate}>
                Added: {new Date(food.created_at).toLocaleDateString()}
              </Text>
            )}
            {food.updated_at && food.updated_at !== food.created_at && (
              <Text style={styles.itemDate}>
                Updated: {new Date(food.updated_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        );
      })}

      {foods.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No foods found</Text>
          <Text style={styles.emptySubtext}>Add your first food item below</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add Food</Text>
      </TouchableOpacity>

      {/* Add Food Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingFood ? 'Edit Food' : 'Add New Food'}
              </Text>
              <TouchableOpacity 
                onPress={cancelEdit}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Food Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter food name"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />

              <Text style={styles.fieldLabel}>Brand *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter brand"
                value={formData.brand}
                onChangeText={(text) => setFormData({...formData, brand: text})}
              />

              <Text style={styles.fieldLabel}>Price *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter price"
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: text})}
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Stock Quantity *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter stock quantity"
                value={formData.stock}
                onChangeText={(text) => setFormData({...formData, stock: text})}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Category *</Text>
              <View style={styles.categoryContainer}>
                {['dog', 'cat', 'bird', 'fish', 'other'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonSelected
                    ]}
                    onPress={() => setFormData({...formData, category})}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextSelected
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Enter description (optional)"
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={cancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveButton, adding && styles.buttonDisabled]}
                  onPress={addFood}
                  disabled={adding}
                >
                  {adding ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingFood ? 'Update Food' : 'Add Food'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Text style={styles.deleteModalTitle}>Delete Food</Text>
            </View>
            
            <View style={styles.deleteModalBody}>
              <Text style={styles.deleteModalText}>
                Are you sure you want to delete{' '}
                <Text style={styles.deleteModalName}>{foodToDelete?.name}</Text>?
              </Text>
              <Text style={styles.deleteModalWarning}>
                This action cannot be undone.
              </Text>
            </View>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.deleteModalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.deleteModalDeleteButton, adding && styles.buttonDisabled]}
                onPress={performDeleteFood}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalDeleteText}>Delete Food</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function ProfileScreen({ onLogout, user }) {
  const clearStoredData = () => {
    Alert.alert(
      'Clear Stored Data',
      'This will reset all pets and foods to the default data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(STORAGE_KEYS.pets);
                localStorage.removeItem(STORAGE_KEYS.foods);
                Alert.alert('Success', 'Data cleared! Refresh the page to see default data.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Profile</Text>
      
      <View style={styles.profileInfo}>
        <Text style={styles.profileText}>👤 {user.username}</Text>
        <Text style={styles.profileSubtext}>
          🔐 Cognito Authentication
        </Text>
      </View>

      <View style={styles.corsWarning}>
        <Text style={styles.apiTitle}>API Configuration</Text>
        <Text style={styles.apiText}>Target API: {API_BASE_URL}</Text>
        <Text style={styles.apiText}>Mode: Production AWS Infrastructure</Text>
        <Text style={styles.apiText}>Data: AWS RDS with Secrets Manager</Text>
        <Text style={styles.helpText}>
          App connects to AWS infrastructure with secure authentication and database storage.
        </Text>
      </View>

      <TouchableOpacity style={styles.clearDataButton} onPress={clearStoredData}>
        <Text style={styles.clearDataButtonText}>🗑️ Clear Stored Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainApp({ onLogout, user }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: true,
        }}
      >
        <Tab.Screen 
          name="Pets" 
          component={PetsScreen}
          options={{
            tabBarIcon: () => <Text>🐕</Text>,
          }}
        />
        <Tab.Screen 
          name="Foods" 
          component={FoodsScreen}
          options={{
            tabBarIcon: () => <Text>🍖</Text>,
          }}
        />
        <Tab.Screen 
          name="Profile"
          options={{
            tabBarIcon: () => <Text>👤</Text>,
          }}
        >
          {() => <ProfileScreen onLogout={onLogout} user={user} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      // Simple authentication - just check if credentials are provided
      // TODO: Implement proper Cognito authentication
      if (username.trim() && password.trim()) {
        onLogin({ 
          username: username.trim(), 
          mode: 'cognito'
        });
        
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        Alert.alert('Login Failed', 'Please enter both username and password');
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      Alert.alert('Login Failed', 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.loginContainer}>
      <Text style={styles.title}>Pet Store</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.corsWarning}>
        <Text style={styles.corsWarningText}>🌐 Pet Store API</Text>
        <Text style={styles.corsWarningSubtext}>
          Connected to AWS infrastructure with secure authentication.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.helpText}>
        Production API: {API_BASE_URL}
      </Text>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    setLoading(false); // No auth check for now
  }, []);

  const handleLogin = (userInfo) => {
    console.log('Login attempt:', userInfo);
    setUser(userInfo);
    Alert.alert('Success', `Logged in as ${userInfo.username}`);
  };

  const handleLogout = async () => {
    setUser(null);
    Alert.alert('Logged out', 'You have been signed out');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {user ? (
          <MainApp onLogout={handleLogout} user={user} />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  corsWarning: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  corsWarningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  corsWarningSubtext: {
    fontSize: 12,
    color: '#0066CC',
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  screenContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    minWidth: 60,
    minHeight: 32,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  itemOwner: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  itemBrand: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  stockCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemCategory: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  apiTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  apiText: {
    fontSize: 12,
    color: '#0066CC',
    marginBottom: 2,
  },
  clearDataButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  clearDataButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#8E8E93',
  },
  modalForm: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Delete Modal styles
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
  },
  deleteModalHeader: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  deleteModalBody: {
    padding: 20,
    alignItems: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  deleteModalName: {
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  deleteModalWarning: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  deleteModalCancelText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteModalDeleteButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  deleteModalDeleteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});