export const parseRegency = (address: string): string => {
  if (!address) return 'Tidak Diketahui';

  // Match "Kabupaten" or "Kab."
  const regencyMatch = address.match(/(?:Kabupaten|Kab\.)\s+([\w\s]+?)(?:,|$)/i);
  if (regencyMatch && regencyMatch[1]) {
    const cleanedName = regencyMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase());
    return `Kab. ${cleanedName}`;
  }
  
  // Match "Kota"
  const cityMatch = address.match(/(?:Kota)\s+([\w\s]+?)(?:,|$)/i);
  if (cityMatch && cityMatch[1]) {
    const cleanedName = cityMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase());
    return `Kota ${cleanedName}`;
  }

  return 'Lainnya';
};

export const parseVillage = (address: string): string => {
  if (!address) return 'Tidak Diketahui';

  // Match "Desa" or "Ds."
  const villageMatch = address.match(/(?:Desa|Ds\.)\s+([\w\s]+?)(?:,|$)/i);
  if (villageMatch && villageMatch[1]) {
    const cleanedName = villageMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase());
    return `Desa ${cleanedName}`;
  }

  return 'Lainnya';
};
