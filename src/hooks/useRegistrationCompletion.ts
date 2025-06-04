
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationData {
  userType: 'restaurante' | 'entregador';
  profileData: any;
  specificData: any;
}

export const useRegistrationCompletion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const completeRegistration = async (data: RegistrationData) => {
    setIsSubmitting(true);
    console.log('Iniciando finalização do cadastro:', data);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Usuário autenticado:', user.id);

      // Atualizar o perfil básico
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...data.profileData,
          cadastro_completo: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      console.log('Perfil atualizado com sucesso');

      // Criar ou atualizar dados específicos
      if (data.userType === 'restaurante') {
        const { error: restaurantError } = await supabase
          .from('restaurant_details')
          .upsert({
            user_id: user.id,
            ...data.specificData,
            status_aprovacao: 'pendente',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (restaurantError) {
          console.error('Erro ao salvar dados do restaurante:', restaurantError);
          throw restaurantError;
        }

        console.log('Dados do restaurante salvos com sucesso');

      } else if (data.userType === 'entregador') {
        const { error: deliveryError } = await supabase
          .from('delivery_details')
          .upsert({
            user_id: user.id,
            ...data.specificData,
            status_aprovacao: 'pendente',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (deliveryError) {
          console.error('Erro ao salvar dados do entregador:', deliveryError);
          throw deliveryError;
        }

        console.log('Dados do entregador salvos com sucesso');
      }

      toast({
        title: 'Cadastro finalizado!',
        description: 'Seu cadastro foi enviado para aprovação. Você receberá uma notificação quando for aprovado.',
      });

      return { success: true };

    } catch (error: any) {
      console.error('Erro durante a finalização do cadastro:', error);
      
      toast({
        title: 'Erro na finalização',
        description: error.message || 'Ocorreu um erro ao finalizar o cadastro. Tente novamente.',
        variant: 'destructive',
      });

      return { success: false, error: error.message };

    } finally {
      setIsSubmitting(false);
    }
  };

  const validateRegistration = (data: RegistrationData): string[] => {
    const errors: string[] = [];

    // Validações básicas do perfil
    if (!data.profileData.nome?.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!data.profileData.telefone?.trim()) {
      errors.push('Telefone é obrigatório');
    }

    // Validações específicas por tipo
    if (data.userType === 'restaurante') {
      if (!data.specificData.nome_fantasia?.trim()) {
        errors.push('Nome fantasia do restaurante é obrigatório');
      }
      if (!data.specificData.categoria?.trim()) {
        errors.push('Categoria do restaurante é obrigatória');
      }
      if (!data.specificData.endereco?.trim()) {
        errors.push('Endereço do restaurante é obrigatório');
      }
    }

    if (data.userType === 'entregador') {
      if (!data.specificData.veiculos || data.specificData.veiculos.length === 0) {
        errors.push('Pelo menos um tipo de veículo deve ser selecionado');
      }
      if (!data.specificData.endereco?.trim()) {
        errors.push('Endereço é obrigatório');
      }
      if (!data.specificData.cpf?.trim()) {
        errors.push('CPF é obrigatório');
      }
    }

    return errors;
  };

  return {
    completeRegistration,
    validateRegistration,
    isSubmitting
  };
};
