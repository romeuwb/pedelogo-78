
import { useEnhancedPrinters } from './useEnhancedPrinters';

export const usePrinters = (restaurantId?: string) => {
  // Se não tiver restaurantId, usar comportamento legacy
  if (!restaurantId) {
    return {
      printers: [],
      loading: false,
      detectPrinters: async () => [],
      testPrinter: async () => false,
      configurePrinter: async () => false,
      setDefaultPrinter: async () => false,
      print: async () => false,
      printOrder: async () => false,
      refreshPrinters: () => {}
    };
  }

  // Usar o novo sistema
  const {
    printers: enhancedPrinters,
    loading,
    configurePrinter: configureEnhancedPrinter,
    setDefaultPrinter: setEnhancedDefaultPrinter,
    testPrinter: testEnhancedPrinter,
    printOrder: printEnhancedOrder,
    refreshPrinters: refreshEnhanced
  } = useEnhancedPrinters(restaurantId);

  // Adaptar interface para compatibilidade
  const printers = enhancedPrinters.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    connection: p.connection_type,
    ipAddress: p.ip_address,
    port: p.port,
    width: p.width,
    enabled: p.enabled,
    defaultPrinter: p.is_default
  }));

  return {
    printers,
    loading,
    detectPrinters: async () => enhancedPrinters,
    testPrinter: testEnhancedPrinter,
    configurePrinter: async (config: any) => {
      try {
        await configureEnhancedPrinter({
          name: config.name,
          type: config.type,
          connection_type: config.connection,
          ip_address: config.ipAddress,
          port: config.port,
          width: config.width,
          enabled: config.enabled,
          is_default: config.defaultPrinter
        });
        return true;
      } catch {
        return false;
      }
    },
    setDefaultPrinter: setEnhancedDefaultPrinter,
    print: async () => true, // Legacy
    printOrder: printEnhancedOrder,
    refreshPrinters: refreshEnhanced
  };
};
