export interface BnplInstalment {
  number: number;
  amount: number;
  date: string;
}

export interface BnplSimulation {
  cost: number;
  instalments: BnplInstalment[];
}
