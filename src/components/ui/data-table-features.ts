import type { TableFeatures } from "@tanstack/react-table"

export const features = {} as const satisfies TableFeatures

export type DataTableFeatures = typeof features
