import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill } from '../types';
import { formatCurrency } from '../utils/calculations';

interface BillCardProps {
  bill: Bill;
  onPress?: () => void;
  paidByName?: string;
}

const BillCard: React.FC<BillCardProps> = ({ 
  bill, 
  onPress, 
  paidByName = 'You' 
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return 'restaurant';
      case 'transport':
        return 'car';
      case 'entertainment':
        return 'game-controller';
      case 'shopping':
        return 'bag';
      case 'utilities':
        return 'flash';
      default:
        return 'receipt';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={getCategoryIcon(bill.category) as any} 
          size={24} 
          color="#007AFF" 
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{bill.title}</Text>
        <Text style={styles.description}>
          Paid by {paidByName} • {bill.splitType} split
        </Text>
        {bill.description && (
          <Text style={styles.billDescription} numberOfLines={1}>
            {bill.description}
          </Text>
        )}
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
          {formatCurrency(bill.amount, bill.currency)}
        </Text>
        <Text style={styles.date}>
          {new Date(bill.paidAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  billDescription: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});

export default BillCard;
