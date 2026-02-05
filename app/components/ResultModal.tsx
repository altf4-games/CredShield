import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import NothingButton from './NothingButton';

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: { label: string; value: string }[];
}

export default function ResultModal({ 
  visible, 
  onClose, 
  type, 
  title, 
  message,
  details 
}: ResultModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1}>
            <View style={[
              styles.modal,
              type === 'success' ? styles.successBorder : styles.errorBorder
            ]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {details && details.length > 0 && (
                <View style={styles.detailsContainer}>
                  {details.map((detail, index) => (
                    <View key={index} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{detail.label}</Text>
                      <Text style={styles.detailValue}>{detail.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              <NothingButton
                title="Close"
                onPress={onClose}
                fullWidth
                style={styles.button}
              />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.xl,
    borderLeftWidth: 4,
  },
  successBorder: {
    borderLeftColor: COLORS.success,
  },
  errorBorder: {
    borderLeftColor: COLORS.error,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray400,
    marginBottom: SPACING.lg,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.base,
  },
  detailsContainer: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: SPACING.sm,
  },
  detailValue: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    textAlign: 'right',
  },
  button: {
    marginTop: SPACING.md,
  },
});
