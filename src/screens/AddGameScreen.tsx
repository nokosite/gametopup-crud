import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { firebaseService } from '../services/firebaseService';
import { GameTopup, TopupOption } from '../types';

type AddGameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddGame'>;

interface GameFormData {
  gameName: string;
  gameIcon: string;
  category: 'MOBA' | 'FPS' | 'RPG' | 'STRATEGY' | 'CASUAL';
  isPopular: boolean;
  isFeatured: boolean;
  topupOptions: TopupOption[];
}

const AddGameScreen: React.FC = () => {
  const [formData, setFormData] = useState<GameFormData>({
    gameName: '',
    gameIcon: '',
    category: 'CASUAL',
    isPopular: false,
    isFeatured: false,
    topupOptions: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigation = useNavigation<AddGameScreenNavigationProp>();

  const categories = [
    { id: 'MOBA', name: 'MOBA' },
    { id: 'FPS', name: 'FPS' },
    { id: 'RPG', name: 'RPG' },
    { id: 'STRATEGY', name: 'Strategy' },
    { id: 'CASUAL', name: 'Casual' },
  ];

  const handleSubmit = async () => {
    if (!formData.gameName.trim()) {
      Alert.alert('Error', 'Nama game harus diisi');
      return;
    }

    if (!formData.gameIcon.trim()) {
      Alert.alert('Error', 'URL icon game harus diisi');
      return;
    }

    if (formData.topupOptions.length === 0) {
      Alert.alert('Error', 'Minimal harus ada 1 opsi topup');
      return;
    }

    setIsLoading(true);
    setRetryCount(0);
    
    try {
      const gameId = await firebaseService.createGame({
        gameName: formData.gameName.trim(),
        gameIcon: formData.gameIcon.trim(),
        category: formData.category,
        topupOptions: formData.topupOptions,
        isPopular: formData.isPopular,
        isFeatured: formData.isFeatured,
      });

      Alert.alert('Sukses', 'Game berhasil ditambahkan!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan game';
      
      // Check if it's a network/connection error
      if (errorMessage.includes('koneksi') || 
          errorMessage.includes('server') || 
          errorMessage.includes('timeout') ||
          errorMessage.includes('transport')) {
        
        if (retryCount < 2) {
          Alert.alert(
            'Koneksi Bermasalah', 
            'Gagal terhubung ke server. Coba lagi?',
            [
              { text: 'Batal', style: 'cancel' },
              { 
                text: 'Coba Lagi', 
                onPress: () => {
                  setRetryCount(prev => prev + 1);
                  handleSubmit();
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Gagal menambahkan game setelah beberapa percobaan. Periksa koneksi internet Anda.');
        }
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTopupOption = () => {
    const newOption: TopupOption = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      currency: 'IDR',
    };
    setFormData({
      ...formData,
      topupOptions: [...formData.topupOptions, newOption]
    });
  };

  const updateTopupOption = (index: number, field: keyof TopupOption, value: any) => {
    const updatedOptions = [...formData.topupOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData({ ...formData, topupOptions: updatedOptions });
  };

  const removeTopupOption = (index: number) => {
    const updatedOptions = formData.topupOptions.filter((_, i) => i !== index);
    setFormData({ ...formData, topupOptions: updatedOptions });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tambah Game Baru</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nama Game *</Text>
            <TextInput
              style={styles.input}
              value={formData.gameName}
              onChangeText={(text) => setFormData({ ...formData, gameName: text })}
              placeholder="Masukkan nama game"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>URL Icon Game *</Text>
            <TextInput
              style={styles.input}
              value={formData.gameIcon}
              onChangeText={(text) => setFormData({ ...formData, gameIcon: text })}
              placeholder="https://example.com/icon.png"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    formData.category === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.id as any })}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, isPopular: !formData.isPopular })}
            >
              <View style={[styles.checkbox, formData.isPopular && styles.checkboxActive]}>
                {formData.isPopular && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Game Populer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
            >
              <View style={[styles.checkbox, formData.isFeatured && styles.checkboxActive]}>
                {formData.isFeatured && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Game Unggulan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Opsi Topup</Text>
              <TouchableOpacity style={styles.addButton} onPress={addTopupOption}>
                <Text style={styles.addButtonText}>+ Tambah</Text>
              </TouchableOpacity>
            </View>

            {formData.topupOptions.map((option, index) => (
              <View key={option.id} style={styles.topupOptionContainer}>
                <View style={styles.topupOptionHeader}>
                  <Text style={styles.topupOptionTitle}>Opsi {index + 1}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeTopupOption(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.topupOptionForm}>
                  <View style={styles.inputRow}>
                    <View style={styles.inputHalf}>
                      <Text style={styles.sublabel}>Nama</Text>
                      <TextInput
                        style={styles.input}
                        value={option.name}
                        onChangeText={(text) => updateTopupOption(index, 'name', text)}
                        placeholder="Contoh: 100 💎"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.inputHalf}>
                      <Text style={styles.sublabel}>Harga</Text>
                      <TextInput
                        style={styles.input}
                        value={option.price.toString()}
                        onChangeText={(text) => updateTopupOption(index, 'price', parseInt(text) || 0)}
                        placeholder="0"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={styles.inputHalf}>
                      <Text style={styles.sublabel}>Mata Uang</Text>
                      <TextInput
                        style={styles.input}
                        value={option.currency}
                        onChangeText={(text) => updateTopupOption(index, 'currency', text)}
                        placeholder="IDR"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.inputHalf}>
                      <Text style={styles.sublabel}>Bonus (Opsional)</Text>
                      <TextInput
                        style={styles.input}
                        value={option.bonus || ''}
                        onChangeText={(text) => updateTopupOption(index, 'bonus', text)}
                        placeholder="Contoh: Bonus 10%"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.popularToggle}
                    onPress={() => updateTopupOption(index, 'isPopular', !option.isPopular)}
                  >
                    <View style={[styles.checkbox, option.isPopular && styles.checkboxActive]}>
                      {option.isPopular && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Opsi Populer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Tambah Game</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#495057',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  categoryButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#212529',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  topupOptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  topupOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topupOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topupOptionForm: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  popularToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddGameScreen; 