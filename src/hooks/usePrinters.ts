
import { useState, useEffect } from 'react';
import { printerService, type PrinterConfig, type PrintJob } from '@/services/printerService';

export const usePrinters = () => {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = () => {
    const configuredPrinters = printerService.getPrinters();
    setPrinters(configuredPrinters);
  };

  const detectPrinters = async () => {
    setLoading(true);
    try {
      const detectedPrinters = await printerService.detectPrinters();
      setPrinters(detectedPrinters);
      return detectedPrinters;
    } finally {
      setLoading(false);
    }
  };

  const testPrinter = async (printerId: string) => {
    return await printerService.testPrinter(printerId);
  };

  const configurePrinter = async (config: PrinterConfig) => {
    const success = await printerService.configurePrinter(config);
    if (success) {
      loadPrinters();
    }
    return success;
  };

  const setDefaultPrinter = async (printerId: string) => {
    const success = await printerService.setDefaultPrinter(printerId);
    if (success) {
      loadPrinters();
    }
    return success;
  };

  const print = async (job: PrintJob) => {
    return await printerService.print(job);
  };

  const printOrder = async (order: any, type: 'kitchen' | 'receipt') => {
    const content = printerService.formatOrderForPrint(order, type);
    return await print({
      id: `${type}-${order.id}-${Date.now()}`,
      content,
      type,
      copies: 1,
      priority: 'normal'
    });
  };

  return {
    printers,
    loading,
    detectPrinters,
    testPrinter,
    configurePrinter,
    setDefaultPrinter,
    print,
    printOrder,
    refreshPrinters: loadPrinters
  };
};
