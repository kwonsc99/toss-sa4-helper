export function parseCustomerData(text: string): Record<string, string> {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  const data: Record<string, string> = {};

  const fieldMappings = {
    이름: "name",
    회사: "company",
    사업자번호: "business_number",
    웹사이트: "website",
    이메일: "email",
    전화: "phone",
  };

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (fieldMappings[currentLine as keyof typeof fieldMappings]) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (!Object.keys(fieldMappings).includes(nextLine)) {
          const fieldKey =
            fieldMappings[currentLine as keyof typeof fieldMappings];
          data[fieldKey] = nextLine;
        }
      }
    }
  }

  return data;
}
