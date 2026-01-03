/*
WearLes - Sample Expo React Native App
Single-file App.js (for quick prototyping)

Dependencies (install before running):
  expo init wearles
  cd wearles
  npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage
  expo start

This file implements:
 - Product listing
 - Product detail
 - Cart with quantity
 - Courier selection per order (multiple courier options)
 - Simple checkout flow (mock)
 - Local persistence for cart using AsyncStorage

Note: In a real app you'd split files, add a backend, and handle payments + auth.
*/

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Modal, Pressable, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

/* Mock data */
const PRODUCTS = [
  { id: 'p1', title: 'Traditional Basotho Blanket', price: 120, image: 'https://picsum.photos/300/200?random=1' },
  { id: 'p2', title: 'Women's Summer Dress', price: 45, image: 'https://picsum.photos/300/200?random=2' },
  { id: 'p3', title: 'Men\'s Shirt', price: 35, image: 'https://picsum.photos/300/200?random=3' },
  { id: 'p4', title: 'Kids Hoodie', price: 30, image: 'https://picsum.photos/300/200?random=4' },
];

const COURIERS = [
  { id: 'c1', name: 'Lesotho Post', est: '3-6 days', fee: 5 },
  { id: 'c2', name: 'FastX Courier', est: '1-3 days', fee: 12 },
  { id: 'c3', name: 'CrossBorder Express', est: '4-8 days', fee: 8 },
];

/* Storage keys */
const STORAGE_CART_KEY = '@wearles_cart_v1';

/* --- Helpers --- */
function formatCurrency(n) {
  return `USD ${n.toFixed(2)}`;
}

/* --- App screens --- */
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Product', { product: item })}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={{ flex: 1, padding: 8 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>{formatCurrency(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function ProductScreen({ route, navigation }) {
  const { product } = route.params;
  const [qty, setQty] = useState(1);

  async function addToCart() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.find((c) => c.product.id === product.id);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ product, qty });
      }
      await AsyncStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
      Alert.alert('Added', `${product.title} x${qty} added to cart`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not add to cart');
    }
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={[styles.productImage, { height: 240 }]} />
      <View style={{ padding: 12 }}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <Text style={{ marginTop: 8 }}>Simple product description. Material: cotton blend. Made in Lesotho.</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text>Quantity:</Text>
          <View style={{ flexDirection: 'row', marginLeft: 12 }}>
            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
            <View style={styles.qtyBox}><Text>{qty}</Text></View>
            <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={addToCart}>
          <Text style={styles.primaryBtnText}>Add to cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => navigation.navigate('Cart')}>
          <Text>Go to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courierModalVisible, setCourierModalVisible] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(COURIERS[0]);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      loadCart();
    });
    loadCart();
    return unsub;
  }, []);

  async function loadCart() {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_CART_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      setCart(saved);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(productId, qty) {
    const next = cart.map((c) => (c.product.id === productId ? { ...c, qty } : c));
    setCart(next);
    await AsyncStorage.setItem(STORAGE_CART_KEY, JSON.stringify(next));
  }

  async function removeItem(productId) {
    const next = cart.filter((c) => c.product.id !== productId);
    setCart(next);
    await AsyncStorage.setItem(STORAGE_CART_KEY, JSON.stringify(next));
  }

  function subtotal() {
    return cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  }

  async function placeOrder() {
    if (cart.length === 0) {
      Alert.alert('Cart empty', 'Please add items before checking out');
      return;
    }
    if (!phone || !address) {
      Alert.alert('Missing info', 'Please provide phone number and delivery address');
      return;
    }

    // Mock order payload
    const order = {
      id: `ORD-${Date.now()}`,
      items: cart,
      courier: selectedCourier,
      contact: { phone, address },
      subtotal: subtotal(),
      total: subtotal() + selectedCourier.fee,
      createdAt: new Date().toISOString(),
    };

    // In a real app you'd POST to your backend here.
    // We'll simulate success and clear cart
    try {
      await AsyncStorage.removeItem(STORAGE_CART_KEY);
      setCart([]);
      Alert.alert('Order placed', `Order ${order.id} placed successfully. Courier: ${selectedCourier.name}`);
      navigation.navigate('Home');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not place order');
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.product.id}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}><Text>Your cart is empty.</Text></View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cartRow}>
            <Image source={{ uri: item.product.image }} style={styles.cartImage} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600' }}>{item.product.title}</Text>
              <Text>{formatCurrency(item.product.price)} x {item.qty}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity onPress={() => updateQty(item.product.id, Math.max(1, item.qty - 1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
                <View style={styles.qtyBox}><Text>{item.qty}</Text></View>
                <TouchableOpacity onPress={() => updateQty(item.product.id, item.qty + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(item.product.id)} style={{ marginLeft: 12 }}><Text>Remove</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ padding: 12 }}>
            <Text style={{ fontWeight: '700' }}>Subtotal: {formatCurrency(subtotal())}</Text>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={() => setCourierModalVisible(true)}>
              <Text style={styles.primaryBtnText}>Choose Courier</Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 12 }}>Selected courier: {selectedCourier.name} ({selectedCourier.est}) — Fee: {formatCurrency(selectedCourier.fee)}</Text>

            <TextInput placeholder="Phone number" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
            <TextInput placeholder="Delivery address" value={address} onChangeText={setAddress} style={styles.input} />

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 8 }]} onPress={placeOrder}>
              <Text style={styles.primaryBtnText}>Place Order - Total: {formatCurrency(subtotal() + selectedCourier.fee)}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={courierModalVisible} animationType="slide" onRequestClose={() => setCourierModalVisible(false)}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Choose a Courier</Text>
          {COURIERS.map((c) => (
            <Pressable key={c.id} onPress={() => { setSelectedCourier(c); setCourierModalVisible(false); }} style={styles.courierRow}>
              <Text style={{ fontWeight: '600' }}>{c.name}</Text>
              <Text>{c.est} • Fee: {formatCurrency(c.fee)}</Text>
            </Pressable>
          ))}

          <TouchableOpacity onPress={() => setCourierModalVisible(false)} style={[styles.secondaryBtn, { marginTop: 12 }]}><Text>Close</Text></TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'WearLes' }} />
        <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Product' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', marginBottom: 12, backgroundColor: '#f8f8f8' },
  productImage: { width: 140, height: 120, resizeMode: 'cover' },
  title: { fontSize: 16, fontWeight: '700' },
  price: { marginTop: 6, color: '#333', fontWeight: '600' },
  primaryBtn: { marginTop: 12, backgroundColor: '#0066cc', padding: 12, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { marginTop: 8, padding: 10, alignItems: 'center' },
  qtyBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginHorizontal: 4 },
  qtyBox: { minWidth: 36, alignItems: 'center', justifyContent: 'center' },
  cartRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  cartImage: { width: 80, height: 60, resizeMode: 'cover', marginRight: 12 },
  courierRow: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 6, marginTop: 8 },
});
