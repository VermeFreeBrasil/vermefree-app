import {
  Apple,
  Baby,
  Bed,
  Beef,
  Candy,
  Carrot,
  Citrus,
  Croissant,
  Dog,
  Drumstick,
  Flower2,
  GlassWater,
  Hand,
  Leaf,
  Milk,
  Nut,
  Popcorn,
  Salad,
  Shell,
  Sprout,
  Sun,
  Vegan,
  Wheat,
  Wine,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Icone } from "@/content/guia"

const ICONES: Record<Icone, LucideIcon> = {
  alho: Vegan,
  cebola: Salad,
  folha: Leaf,
  cravo: Flower2,
  semente: Nut,
  gengibre: Sprout,
  curcuma: Sun,
  fruta: Apple,
  abacaxi: Citrus,
  coco: Shell,
  fibra: Wheat,
  fermentado: Milk,
  legume: Carrot,
  agua: GlassWater,
  maos: Hand,
  crianca: Baby,
  pet: Dog,
  cama: Bed,
  carne: Beef,
  acucar: Candy,
  farinha: Croissant,
  pacote: Popcorn,
  fritura: Drumstick,
  alcool: Wine,
}

/** Ícone redondo usado nos cartões do guia. */
export function IconeBolha({ icone, tom = "verde", className }: { icone: Icone; tom?: "verde" | "areia"; className?: string }) {
  const Icon = ICONES[icone]
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full",
        tom === "verde" ? "bg-selected text-leaf" : "bg-[#f3ead2] text-[#7a5b16]",
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  )
}
