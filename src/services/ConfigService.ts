import { prisma } from '@/lib/prisma';

export class ConfigService {
  /**
   * Busca todas as configurações e as retorna como um objeto chave-valor.
   */
  static async list() {
    const configs = await prisma.config.findMany();
    return configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Busca uma configuração específica.
   */
  static async get(key: string, defaultValue: string = ''): Promise<string> {
    const config = await prisma.config.findUnique({ where: { key } });
    return config ? config.value : defaultValue;
  }

  /**
   * Salva múltiplas configurações de uma vez.
   */
  static async saveBatch(configs: Record<string, string>) {
    const operations = Object.entries(configs).map(([key, value]) => {
      return prisma.config.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    return await prisma.$transaction(operations);
  }
}
