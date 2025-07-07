import React, { useState, useEffect } from 'react';

type CurrencyInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  // Função para formatar número como moeda brasileira
  const formatToBRL = (value: number): string =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Função para limpar máscara e converter para número float
  const parseToNumber = (value: string): number | null => {
    const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  // Atualiza input quando a prop `value` mudar
  useEffect(() => {
    if (value !== null) {
      setInputValue(formatToBRL(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Apenas números, vírgulas e pontos
    const cleaned = raw.replace(/[^\d.,]/g, '');

    const parsed = parseToNumber(cleaned);
    setInputValue(cleaned);

    onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseToNumber(inputValue);
    if (parsed !== null) {
      setInputValue(formatToBRL(parsed));
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="R$ 0,00"
    />
  );
};
