
import React from 'react';
import { EnhancedPrinterConfiguration } from './EnhancedPrinterConfiguration';

interface PrinterConfigurationProps {
  restaurantId: string;
}

export const PrinterConfiguration = ({ restaurantId }: PrinterConfigurationProps) => {
  return <EnhancedPrinterConfiguration restaurantId={restaurantId} />;
};
