export interface Transaction {
  fecha: string
  comercio: string
  monto: number
  ciudad: string
  raw: string
}

export interface CategorizedTransaction extends Transaction {
  categoria: string
}

export interface CategoryConfig {
  icon: string
  keywords: string[]
}

export type CategoriesMap = Record<string, CategoryConfig>

export interface CategoryJson {
  name: string
  icon: string
  keywords: string[]
}

export interface CategoriesPayload {
  version?: string
  categories: CategoryJson[]
}

export interface CategoryGroup {
  name: string
  icon: string
  total: number
  count: number
  transactions: PersistedTransaction[]
}

export interface GroupedTransactions {
  categories: CategoryGroup[]
  grandTotal: number
}

export interface PersistedTransaction {
  fecha: string
  monto: number
  comercio?: string
  ciudad?: string
  raw?: string
  categoria?: string
}

export interface PdfState {
  rawTransactions: PersistedTransaction[]
  fileName: string
}

export interface SavePdfStateResult {
  success: boolean
  warning?: string
}

export interface DateRange {
  desde: string
  hasta: string
}
